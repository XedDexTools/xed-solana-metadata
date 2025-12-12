import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Submission = {
  id: string;
  created_at: string | null;
  wallet: string | null;
  mint: string | null;
  name: string | null;
  symbol: string | null;
  image: string | null;
  description: string | null;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  status: string | null;
};

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remember login in localStorage so you don't have to re-type every refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("xed_admin_authed");
    if (stored === "true") {
      setHasAccess(true);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) {
      void fetchSubmissions();
    }
  }, [hasAccess]);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("token_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading submissions:", error);
      setError("Failed to load submissions.");
    } else {
      setSubmissions(data as Submission[]);
    }

    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (password === ADMIN_PASSWORD && ADMIN_PASSWORD) {
      setHasAccess(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("xed_admin_authed", "true");
      }
    } else {
      setError("Incorrect admin password.");
    }
  }

  async function updateStatus(id: string, newStatus: "approved" | "rejected") {
    setError(null);

    const { error } = await supabase
      .from("token_submissions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status.");
      return;
    }

    // Update local state so UI reflects change immediately
    setSubmissions((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: newStatus } : row
      )
    );
  }

  if (!hasAccess) {
    // Simple password gate
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "#111827",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>
            Admin Login
          </h1>
          <p style={{ fontSize: "14px", marginBottom: "16px", color: "#9CA3AF" }}>
            Enter the admin password to view token submissions.
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #4B5563",
                background: "#030712",
                color: "#F9FAFB",
                marginBottom: "12px",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "9999px",
                border: "none",
                background:
                  "linear-gradient(to right, #10B981, #3B82F6, #A855F7)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Enter
            </button>
          </form>

          {error && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: "#F97316",
              }}
            >
              {error}
            </p>
          )}
        </div>
      </main>
    );
  }

  // Admin view
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>
        Token Submissions
      </h1>
      <p
        style={{
          fontSize: "13px",
          color: "#9CA3AF",
          marginBottom: "16px",
        }}
      >
        Internal admin view of all submitted tokens.
      </p>

      {error && (
        <p style={{ color: "#F97316", marginBottom: "12px", fontSize: "13px" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            borderRadius: "12px",
            border: "1px solid #1F2937",
            background: "#020617",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#111827",
                  textAlign: "left",
                }}
              >
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Wallet</th>
                <th style={thStyle}>Mint</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Symbol</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Links</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderTop: "1px solid #111827",
                  }}
                >
                  <td style={tdStyle}>
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td style={tdStyle}>{row.wallet || "—"}</td>
                  <td style={tdStyle}>{row.mint || "—"}</td>
                  <td style={tdStyle}>{row.name || "—"}</td>
                  <td style={tdStyle}>{row.symbol || "—"}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        background:
                          row.status === "approved"
                            ? "rgba(16,185,129,0.15)"
                            : row.status === "rejected"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(107,114,128,0.15)",
                        color:
                          row.status === "approved"
                            ? "#6EE7B7"
                            : row.status === "rejected"
                            ? "#FCA5A5"
                            : "#E5E7EB",
                      }}
                    >
                      {row.status || "pending"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {row.image ? (
                      <a
                        href={row.image}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#60A5FA" }}
                      >
                        open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {row.twitter && (
                        <span>
                          X:{" "}
                          <a
                            href={
                              row.twitter.startsWith("http")
                                ? row.twitter
                                : `https://x.com/${row.twitter.replace("@", "")}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#60A5FA" }}
                          >
                            {row.twitter}
                          </a>
                        </span>
                      )}
                      {row.telegram && (
                        <span>
                          TG:{" "}
                          <a
                            href={
                              row.telegram.startsWith("http")
                                ? row.telegram
                                : `https://t.me/${row.telegram.replace("@", "")}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#60A5FA" }}
                          >
                            {row.telegram}
                          </a>
                        </span>
                      )}
                      {row.website && (
                        <span>
                          Web:{" "}
                          <a
                            href={row.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#60A5FA" }}
                          >
                            {row.website}
                          </a>
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => void updateStatus(row.id, "approved")}
                        style={approveButtonStyle}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => void updateStatus(row.id, "rejected")}
                        style={rejectButtonStyle}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontWeight: 600,
  fontSize: "12px",
  color: "#D1D5DB",
  borderBottom: "1px solid #1F2937",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  verticalAlign: "top",
  color: "#E5E7EB",
  fontSize: "13px",
};

const baseButtonStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: "9999px",
  border: "none",
  fontSize: "12px",
  cursor: "pointer",
  fontWeight: 500,
};

const approveButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: "rgba(16,185,129,0.15)",
  color: "#6EE7B7",
};

const rejectButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: "rgba(239,68,68,0.15)",
  color: "#FCA5A5",
};
