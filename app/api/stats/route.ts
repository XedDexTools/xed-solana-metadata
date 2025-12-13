import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 60;

export async function GET() {
  try {
    const { count: approved } = await supabase
      .from("token_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: total } = await supabase
      .from("token_submissions")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      approved: approved || 0,
      total: total || 0,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { approved: 0, total: 0 },
      { status: 500 }
    );
  }
}

