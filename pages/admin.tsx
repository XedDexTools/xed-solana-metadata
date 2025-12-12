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

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // helper to update status (approved / rejected)
  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("token_submissions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status: " + error.message);
      return;
    }

    // update local state so UI changes immediately
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  }

  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("token_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading submissions:", error);
        setError(error.message);
      } else {
        setSubmissions((data || []) as Submission[]);
      }

      setLoading(false);
    }

    loadSubmissions();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Token Submissions</h1>
        <p className="text-sm text-gray-400 mb-6">
          Internal admin view of all submitted tokens.
        </p>

        {loading && <p>Loading submissions…</p>}
        {error && (
          <p className="text-red-400 mb-4">
            Error loading submissions: {error}
          </p>
        )}

        {!loading && !error && submissions.length === 0 && (
          <p className="text-gray-400">No submissions yet.</p>
        )}

        {!loading && submissions.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Wallet</th>
                  <th className="px-3 py-2 text-left">Mint</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Symbol</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Image</th>
                  <th className="px-3 py-2 text-left">Links</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-gray-800 hover:bg-gray-900/60"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2 max-w-[160px] truncate">
                      {s.wallet || "-"}
                    </td>
                    <td className="px-3 py-2 max-w-[220px] truncate">
                      {s.mint || "-"}
                    </td>
                    <td className="px-3 py-2">{s.name || "-"}</td>
                    <td className="px-3 py-2">{s.symbol || "-"}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs bg-gray-800">
                        {s.status || "pending"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {s.image ? (
                        <a
                          href={s.image}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 underline"
                        >
                          open
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {s.twitter && (
                        <div>
                          <span className="text-gray-400">X:</span>{" "}
                          <a
                            href={
                              s.twitter.startsWith("http")
                                ? s.twitter
                                : `https://x.com/${s.twitter.replace("@", "")}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 underline"
                          >
                            {s.twitter}
                          </a>
                        </div>
                      )}
                      {s.telegram && (
                        <div>
                          <span className="text-gray-400">TG:</span>{" "}
                          <span>{s.telegram}</span>
                        </div>
                      )}
                      {s.website && (
                        <div>
                          <span className="text-gray-400">Web:</span>{" "}
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 underline"
                          >
                            {s.website}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(s.id, "approved")}
                          className="px-2 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(s.id, "rejected")}
                          className="px-2 py-1 rounded text-xs bg-rose-600 hover:bg-rose-500"
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
