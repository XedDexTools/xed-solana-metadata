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
      wallet,        // wallet address of the user
      mint,          // token mint address
      name,
      symbol,
      image,
      description,
      twitter,
      telegram,
      website,
    } = req.body;

    if (!wallet || !mint) {
      return res
        .status(400)
        .json({ error: "wallet and mint are required fields" });
    }

    // 🔹 1) Check last submission from this wallet for this mint
    const { data: lastRows, error: lastCheckError } = await supabase
      .from("token_submissions")                   // << your table name
      .select("id, created_at")
      .eq("wallet", wallet)
      .eq("mint", mint)
      .order("created_at", { ascending: false })
      .limit(1);

    if (lastCheckError) {
      console.error("Error checking cooldown:", lastCheckError);
      return res.status(500).json({
        error: "Failed to check cooldown",
      });
    }

    if (lastRows && lastRows.length > 0) {
      const lastTime = new Date(lastRows[0].created_at).getTime();
      const now = Date.now();

      if (now - lastTime < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - (now - lastTime);
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMinsOnly = remainingMinutes % 60;

        return res.status(429).json({
          error: "Too many updates",
          message: `You can update this token again in about ${remainingHours}h ${remainingMinsOnly}m.`,
        });
      }
    }

    // 🔹 2) Insert the new submission into Supabase
    const { data, error } = await supabase
      .from("token_submissions") // make sure this matches your table name
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

    // 🔹 3) Success
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Unexpected error in submit handler:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
