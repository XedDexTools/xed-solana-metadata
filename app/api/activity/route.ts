import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get recent approved tokens
    const { data: approved, error: approvedError } = await supabase
      .from("token_submissions")
      .select("id, mint, name, symbol, image, created_at, status")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10);

    if (approvedError) {
      console.error("Activity API error:", approvedError);
      return NextResponse.json({ activities: [] });
    }

    const activities = (approved || []).map((token) => ({
      id: token.id,
      type: "approved" as const,
      name: token.name,
      symbol: token.symbol,
      mint: token.mint,
      image: token.image,
      timestamp: token.created_at,
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json({ activities: [] }, { status: 500 });
  }
}
