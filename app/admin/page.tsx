"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHasAccess(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("xed_admin_authed", "true");
        }
      } else {
        setError("Incorrect admin password.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
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
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
          <h1 className="text-2xl font-semibold mb-3">
            Admin Login
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Enter the admin password to view token submissions.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-slate-950 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Enter
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-orange-400">
              {error}
            </p>
          )}
        </div>
      </main>
    );
  }

  // Admin view
  return (
    <main className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">
            Token Submissions
          </h1>
          <p className="text-sm text-gray-400">
            Internal admin view of all submitted tokens.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-sm text-orange-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading submissions…</div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
            <p className="text-gray-400">No submissions yet.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-gray-800 bg-slate-950">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-900 text-left">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Created
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Wallet
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Mint
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Symbol
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Image
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Links
                  </th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-300 border-b border-gray-800 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-900 hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 align-top text-gray-300 text-xs">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-300 text-xs font-mono truncate max-w-[120px]">
                      {row.wallet || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-300 text-xs font-mono truncate max-w-[120px]">
                      {row.mint || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-300 text-xs">
                      {row.name || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-300 text-xs font-semibold">
                      {row.symbol || "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                          row.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : row.status === "rejected"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-gray-500/15 text-gray-400"
                        }`}
                      >
                        {row.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      {row.image ? (
                        <a
                          href={row.image}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                        >
                          view
                        </a>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1 text-xs">
                        {row.twitter && (
                          <span>
                            <span className="text-gray-500">X: </span>
                            <a
                              href={
                                row.twitter.startsWith("http")
                                  ? row.twitter
                                  : `https://x.com/${row.twitter.replace("@", "")}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                            >
                              {row.twitter}
                            </a>
                          </span>
                        )}
                        {row.telegram && (
                          <span>
                            <span className="text-gray-500">TG: </span>
                            <a
                              href={
                                row.telegram.startsWith("http")
                                  ? row.telegram
                                  : `https://t.me/${row.telegram.replace("@", "")}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                            >
                              {row.telegram}
                            </a>
                          </span>
                        )}
                        {row.website && (
                          <span>
                            <span className="text-gray-500">Web: </span>
                            <a
                              href={row.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all"
                            >
                              {row.website}
                            </a>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-2">
                        <button
                          onClick={() => void updateStatus(row.id, "approved")}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 active:scale-95 transition-all border border-emerald-500/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void updateStatus(row.id, "rejected")}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 active:scale-95 transition-all border border-red-500/20"
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
      </div>
    </main>
  );
}
