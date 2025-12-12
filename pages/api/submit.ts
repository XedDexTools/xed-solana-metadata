import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

// 3 hour cooldown in milliseconds
const COOLDOWN_MS = 3 * 60 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
    } = req.body || {};

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
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
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
      return res.status(500).json({
        error: "PGRT2BS",
        message: "Could not check cooldown. Please try again later.",
      });
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

        return res.status(429).json({
          error: "Too many updates",
          message: `You can update this token again in about ${remainingHours}h ${remainingMinutes}m.`,
        });
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
      return res.status(500).json({
        error: "Failed to save submission",
      });
    }

    // --- 3) Success ---
    return res.status(200).json({
      success: true,
      submission: data,
    });
  } catch (err: any) {
    console.error("Submit error:", err);

    let message = "Network or upload error. Please try again.";

    if (err && typeof err === "object") {
      if ("message" in err && typeof err.message === "string") {
        message = err.message;
      } else {
        try {
          message = JSON.stringify(err);
        } catch {
          // keep default
        }
      }
    }

    return res.status(500).json({ error: message });
  }
}
