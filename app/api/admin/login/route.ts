import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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
