import { NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

// Very strict rate limit for login attempts: 5 per 15 minutes
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export async function POST(request: Request) {
  try {
    // Rate limiting for login attempts - very strict to prevent brute force
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`admin-login:${clientIP}`, LOGIN_RATE_LIMIT);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { password } = await request.json();
    
    // Check against server-side environment variable (no NEXT_PUBLIC prefix)
    const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!CORRECT_PASSWORD) {
      console.error("ADMIN_PASSWORD is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" }, 
        { status: 500 }
      );
    }

    if (password === CORRECT_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Incorrect password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
