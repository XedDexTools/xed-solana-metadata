import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

type TokenMetadataResponse = {
  mint: string;
  name: string | null;
  symbol: string | null;
  description: string | null;
  image: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  updatedAt: string; // created_at from the DB
};

type ErrorResponse = {
  error: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get("mint");

  // Validate mint param
  if (!mint || typeof mint !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid ?mint= parameter" },
      { status: 400 }
    );
  }

  try {
    // Look up the latest *approved* submission for this mint
    const { data, error } = await supabase
      .from("token_submissions")
      .select(
        "mint, name, symbol, description, image, website, twitter, telegram, created_at, status"
      )
      .eq("mint", mint)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Supabase error in /api/token:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No approved metadata found for this mint" },
        { status: 404 }
      );
    }

    const row = data[0];

    const response: TokenMetadataResponse = {
      mint: row.mint,
      name: row.name ?? null,
      symbol: row.symbol ?? null,
      description: row.description ?? null,
      image: row.image ?? null,
      website: row.website ?? null,
      twitter: row.twitter ?? null,
      telegram: row.telegram ?? null,
      updatedAt: row.created_at,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in /api/token:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
