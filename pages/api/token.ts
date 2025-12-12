import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenMetadataResponse | ErrorResponse>
) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mint } = req.query;

  // Validate mint param
  if (!mint || typeof mint !== "string") {
    return res.status(400).json({ error: "Missing or invalid ?mint= parameter" });
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
      return res.status(500).json({ error: "Database error" });
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ error: "No approved metadata found for this mint" });
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

    return res.status(200).json(response);
  } catch (err) {
    console.error("Unexpected error in /api/token:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
