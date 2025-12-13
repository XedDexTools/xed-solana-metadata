import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const name = searchParams.get("name") || "Token";
  const symbol = searchParams.get("symbol") || "TKN";
  const image = searchParams.get("image") || "";
  const description = searchParams.get("description")?.slice(0, 100) || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Grid Background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: "50px 50px",
            backgroundImage:
              "linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)",
            opacity: 0.5,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "40px",
            flex: 1,
          }}
        >
          {/* Token Image */}
          {image ? (
            <img
              src={image}
              alt={name}
              width={200}
              height={200}
              style={{
                borderRadius: "0px",
                border: "2px solid #333",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 200,
                height: 200,
                backgroundColor: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 80,
                fontWeight: "bold",
                color: "#666",
                border: "2px solid #333",
              }}
            >
              {symbol.charAt(0)}
            </div>
          )}

          {/* Token Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span
                style={{
                  fontSize: 56,
                  fontWeight: "bold",
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                {name}
              </span>
              <span
                style={{
                  fontSize: 28,
                  color: "#666",
                  backgroundColor: "#1a1a1a",
                  padding: "8px 16px",
                }}
              >
                ${symbol}
              </span>
            </div>

            {description && (
              <span
                style={{
                  fontSize: 24,
                  color: "#888",
                  lineHeight: 1.4,
                }}
              >
                {description}...
              </span>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#22c55e",
                  fontSize: 18,
                  padding: "6px 12px",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                  }}
                />
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #222",
            paddingTop: "30px",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#ffffff",
              }}
            />
            <span style={{ fontSize: 24, fontWeight: "bold", color: "#ffffff" }}>
              XED SCREENER
            </span>
          </div>
          <span style={{ fontSize: 18, color: "#666" }}>xedscreener.xyz</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
