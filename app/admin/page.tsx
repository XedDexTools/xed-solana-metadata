"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

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

const ITEMS_PER_PAGE = 20;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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
        headers: { "Content-Type": "application/json" },
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

    setSubmissions((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: newStatus } : row
      )
    );
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    
    setError(null);

    const { error } = await supabase
      .from("token_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting submission:", error);
      setError("Failed to delete submission.");
      return;
    }

    setSubmissions((prev) => prev.filter((row) => row.id !== id));
    setSelectedSubmission(null);
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("xed_admin_authed");
    }
    setHasAccess(false);
    setPassword("");
  }

  // Filtered and paginated submissions
  const filteredSubmissions = useMemo(() => {
    let result = submissions;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => (s.status || "pending") === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.symbol?.toLowerCase().includes(query) ||
          s.mint?.toLowerCase().includes(query) ||
          s.wallet?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [submissions, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter((s) => !s.status || s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  }), [submissions]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-30" />
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 relative z-10">
          <h1 className="text-2xl font-bold mb-2">ADMIN LOGIN</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Enter the admin password to access the dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
            >
              ENTER
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400 font-mono">{error}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-20" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-black">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
              <span className="font-bold tracking-tight">XED SCREENER</span>
            </Link>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchSubmissions}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              REFRESH
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-mono text-zinc-400 hover:text-red-400 transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-mono text-zinc-500 mb-1">TOTAL</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-mono text-yellow-500 mb-1">PENDING</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-mono text-green-500 mb-1">APPROVED</p>
            <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-mono text-red-500 mb-1">REJECTED</p>
            <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, symbol, mint, or wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-xs font-mono transition-colors ${
                  statusFilter === status
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-400 font-mono text-sm">Loading submissions...</div>
          </div>
        ) : paginatedSubmissions.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
            <p className="text-zinc-400 font-mono">No submissions found</p>
          </div>
        ) : (
          <div className="border border-zinc-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900 text-left">
                  <th className="px-4 py-3 font-mono text-xs text-zinc-500 uppercase">Date</th>
                  <th className="px-4 py-3 font-mono text-xs text-zinc-500 uppercase">Token</th>
                  <th className="px-4 py-3 font-mono text-xs text-zinc-500 uppercase">Mint</th>
                  <th className="px-4 py-3 font-mono text-xs text-zinc-500 uppercase">Status</th>
                  <th className="px-4 py-3 font-mono text-xs text-zinc-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubmissions.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.image} alt="" className="w-8 h-8 object-cover bg-zinc-800" />
                        ) : (
                          <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">?</div>
                        )}
                        <div>
                          <p className="font-medium">{row.name || "—"}</p>
                          <p className="text-xs text-zinc-500">${row.symbol || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400 max-w-[150px] truncate">
                      {row.mint || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-mono ${
                        row.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : row.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {(row.status || "pending").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSubmission(row)}
                          className="px-2 py-1 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        >
                          VIEW
                        </button>
                        <button
                          onClick={() => updateStatus(row.id, "approved")}
                          className="px-2 py-1 text-xs font-mono bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => updateStatus(row.id, "rejected")}
                          className="px-2 py-1 text-xs font-mono bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs font-mono text-zinc-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)} of {filteredSubmissions.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-mono bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                PREV
              </button>
              <span className="px-3 py-1 text-xs font-mono text-zinc-500">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs font-mono bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedSubmission(null)} />
          <div className="relative bg-zinc-950 border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Submission Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Token Info */}
              <div className="flex items-start gap-4">
                {selectedSubmission.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedSubmission.image} alt="" className="w-20 h-20 object-cover bg-zinc-800" />
                ) : (
                  <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center text-xl text-zinc-500">?</div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{selectedSubmission.name}</h3>
                  <p className="text-zinc-500 font-mono">${selectedSubmission.symbol}</p>
                  <span className={`inline-flex mt-2 px-2 py-1 text-xs font-mono ${
                    selectedSubmission.status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : selectedSubmission.status === "rejected"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {(selectedSubmission.status || "pending").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4">
                <div>
                  <p className="text-xs font-mono text-zinc-500 mb-1">DESCRIPTION</p>
                  <p className="text-sm text-zinc-300">{selectedSubmission.description || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-zinc-500 mb-1">MINT ADDRESS</p>
                  <code className="text-sm font-mono text-zinc-300 bg-zinc-900 px-2 py-1 block break-all">{selectedSubmission.mint}</code>
                </div>
                <div>
                  <p className="text-xs font-mono text-zinc-500 mb-1">WALLET ADDRESS</p>
                  <code className="text-sm font-mono text-zinc-300 bg-zinc-900 px-2 py-1 block break-all">{selectedSubmission.wallet}</code>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-mono text-zinc-500 mb-1">TWITTER</p>
                    <p className="text-sm">{selectedSubmission.twitter || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-zinc-500 mb-1">TELEGRAM</p>
                    <p className="text-sm">{selectedSubmission.telegram || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-zinc-500 mb-1">WEBSITE</p>
                    <p className="text-sm truncate">{selectedSubmission.website || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-mono text-zinc-500 mb-1">SUBMITTED</p>
                  <p className="text-sm">{selectedSubmission.created_at ? new Date(selectedSubmission.created_at).toLocaleString() : "—"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => { updateStatus(selectedSubmission.id, "approved"); setSelectedSubmission({ ...selectedSubmission, status: "approved" }); }}
                  className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 font-mono text-sm hover:bg-green-500/30 transition-colors"
                >
                  APPROVE
                </button>
                <button
                  onClick={() => { updateStatus(selectedSubmission.id, "rejected"); setSelectedSubmission({ ...selectedSubmission, status: "rejected" }); }}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 font-mono text-sm hover:bg-red-500/30 transition-colors"
                >
                  REJECT
                </button>
                <button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-400 font-mono text-sm hover:bg-zinc-700 transition-colors"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
