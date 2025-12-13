import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort") || "newest";

    const offset = (page - 1) * limit;

    let query = supabase
      .from("token_submissions")
      .select("id, mint, wallet, name, symbol, description, image, twitter, telegram, website, created_at", { count: "exact" })
      .eq("status", "approved");

    if (search) {
      query = query.or(`name.ilike.%${search}%,symbol.ilike.%${search}%,mint.ilike.%${search}%`);
    }

    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch tokens" },
        { status: 500 }
      );
    }

    const tokens = (data || []).map((token) => ({
      id: token.id,
      mint: token.mint,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      image: token.image,
      twitter: token.twitter,
      telegram: token.telegram,
      website: token.website,
      createdAt: token.created_at,
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      tokens,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Explorer API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
