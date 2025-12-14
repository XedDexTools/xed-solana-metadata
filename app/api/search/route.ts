import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting - 100 requests per minute
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`search:${clientIP}`, RATE_LIMITS.RELAXED);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { results: [], error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search by name, symbol, or mint
    const { data, error } = await supabase
      .from("token_submissions")
      .select("id, mint, name, symbol, image")
      .eq("status", "approved")
      .or(`name.ilike.%${query}%,symbol.ilike.%${query}%,mint.ilike.%${query}%`)
      .limit(8);

    if (error) {
      console.error("Search API error:", error);
      return NextResponse.json({ results: [] });
    }

    const results = (data || []).map((token) => ({
      id: token.id,
      mint: token.mint,
      name: token.name,
      symbol: token.symbol,
      image: token.image,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
