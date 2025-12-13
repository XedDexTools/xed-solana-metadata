import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://xedscreener.xyz";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/start`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explorer`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/status`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic token pages
  let tokenPages: MetadataRoute.Sitemap = [];
  
  try {
    const { data: tokens } = await supabase
      .from("token_submissions")
      .select("mint, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (tokens) {
      tokenPages = tokens.map((token) => ({
        url: `${baseUrl}/token/${token.mint}`,
        lastModified: new Date(token.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
    }
  } catch (error) {
    console.error("Error fetching tokens for sitemap:", error);
  }

  return [...staticPages, ...tokenPages];
}
