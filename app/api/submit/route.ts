import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { rateLimit, getClientIP, RATE_LIMITS } from "../../../lib/rate-limit";

// 3 hour cooldown in milliseconds
const COOLDOWN_MS = 3 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 submissions per minute per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`submit:${clientIP}`, RATE_LIMITS.STRICT);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Please wait a moment before submitting again.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
            "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    
    const {
      wallet,
      mint,
      name,
      symbol,
      image,
      description,
      twitter,
      telegram,
      website,
    } = body || {};

    const errors: string[] = [];

    // --- Helper to check simple string fields ---
    function checkString(
      value: unknown,
      field: string,
      opts: { required?: boolean; maxLen?: number } = {}
    ) {
      const { required = false, maxLen } = opts;

      if (required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required.`);
        return;
      }

      if (typeof value === "string") {
        if (maxLen && value.length > maxLen) {
          errors.push(`${field} must be at most ${maxLen} characters.`);
        }
      } else if (value !== undefined && value !== null) {
        errors.push(`${field} must be a string.`);
      }
    }

    // --- Basic field validation ---

    checkString(wallet, "Wallet address", { required: true, maxLen: 100 });
    checkString(mint, "Mint address", { required: true, maxLen: 100 });
    checkString(name, "Name", { required: true, maxLen: 80 });
    checkString(symbol, "Symbol", { required: true, maxLen: 16 });
    checkString(image, "Image URL", { required: true, maxLen: 500 });
    checkString(description, "Description", { required: true, maxLen: 1000 });
    checkString(twitter, "Twitter", { maxLen: 200 });
    checkString(telegram, "Telegram", { maxLen: 200 });
    checkString(website, "Website", { maxLen: 500 });

    // Very light Solana-style checks – just to catch obvious garbage
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;

    if (typeof wallet === "string") {
      if (wallet.length < 20 || wallet.length > 80 || !base58Regex.test(wallet)) {
        errors.push("Wallet address does not look like a valid Solana address.");
      }
    }

    if (typeof mint === "string") {
      if (mint.length < 20 || mint.length > 80 || !base58Regex.test(mint)) {
        errors.push("Mint address does not look like a valid Solana address.");
      }
    }

    if (typeof image === "string") {
      if (
        !image.startsWith("http://") &&
        !image.startsWith("https://")
      ) {
        errors.push("Image URL must start with http:// or https://.");
      }
    }

    if (typeof website === "string" && website.trim() !== "") {
      if (
        !website.startsWith("http://") &&
        !website.startsWith("https://")
      ) {
        errors.push("Website must start with http:// or https://.");
      }
    }

    // If any validation failed, return 400 with details
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    // --- 1) Check last submission from this wallet for this mint (cooldown) ---
    const { data: lastRows, error: lastCheckError } = await supabase
      .from("token_submissions")
      .select("id, created_at")
      .eq("wallet", wallet)
      .eq("mint", mint)
      .order("created_at", { ascending: false })
      .limit(1);

    if (lastCheckError) {
      console.error("Error checking cooldown:", lastCheckError);
      return NextResponse.json(
        {
          error: "PGRT2BS",
          message: "Could not check cooldown. Please try again later.",
        },
        { status: 500 }
      );
    }

    if (lastRows && lastRows.length > 0 && lastRows[0].created_at) {
      const last = new Date(lastRows[0].created_at).getTime();
      const now = Date.now();
      const diff = now - last;

      if (diff < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - diff;
        const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
        const remainingMinutes = Math.floor(
          (remainingMs % (60 * 60 * 1000)) / (60 * 1000)
        );

        return NextResponse.json(
          {
            error: "Too many updates",
            message: `You can update this token again in about ${remainingHours}h ${remainingMinutes}m.`,
          },
          { status: 429 }
        );
      }
    }

    // --- 2) Insert the new submission into Supabase ---
    const { data, error } = await supabase
      .from("token_submissions")
      .insert([
        {
          wallet,
          mint,
          name,
          symbol,
          image,
          description,
          twitter,
          telegram,
          website,
          // status will default to 'pending' in the DB, but you could also set it here
          // status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting submission:", error);
      return NextResponse.json(
        {
          error: "Failed to save submission",
        },
        { status: 500 }
      );
    }

    // --- 3) Success ---
    return NextResponse.json(
      {
        success: true,
        submission: data,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Submit error:", err);

    let message = "Network or upload error. Please try again.";

    if (err && typeof err === "object") {
      if ("message" in err && typeof (err as { message: unknown }).message === "string") {
        message = (err as { message: string }).message;
      } else {
        try {
          message = JSON.stringify(err);
        } catch {
          // keep default
        }
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
