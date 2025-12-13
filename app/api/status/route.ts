import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get("mint");
    const wallet = searchParams.get("wallet");

    if (!mint && !wallet) {
      return NextResponse.json(
        { error: "Please provide a mint address or wallet address" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("token_submissions")
      .select("id, mint, wallet, name, symbol, status, created_at, image")
      .order("created_at", { ascending: false });

    if (mint) {
      query = query.eq("mint", mint);
    } else if (wallet) {
      query = query.eq("wallet", wallet);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch submission status" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { found: false, message: "No submissions found for this address" },
        { status: 200 }
      );
    }

    const submissions = data.map((sub) => ({
      id: sub.id,
      mint: sub.mint,
      wallet: sub.wallet,
      name: sub.name,
      symbol: sub.symbol,
      image: sub.image,
      status: sub.status || "pending",
      submittedAt: sub.created_at,
    }));

    return NextResponse.json({
      found: true,
      submissions,
    });
  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

