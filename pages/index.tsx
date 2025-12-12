import { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UploadState = "idle" | "uploading" | "done";

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploadState, setImageUploadState] =
    useState<UploadState>("idle");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---- Upload helper: put file into Supabase Storage and return public URL ----
  async function uploadImageToSupabase(file: File) {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("token-images") // bucket name
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from("token-images")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  }

  // ---- Form submit ----
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    // Save the form element BEFORE any await (fixes the reset() error)
    const form = e.currentTarget as HTMLFormElement;

    setStatus(null);
    setLoading(true);

    try {
      // Grab all form fields
      const formData = new FormData(form);
      const payload: any = Object.fromEntries(formData.entries());

      // Handle image: if user uploaded a file, upload it to Supabase
      if (imageFile) {
        setImageUploadState("uploading");
        const publicUrl = await uploadImageToSupabase(imageFile);
        payload.image = publicUrl;
        setImageUploadState("done");
      } else if (payload.imageUrl) {
        // fallback: user pasted an image URL
        payload.image = payload.imageUrl;
      }

      // We don’t need imageUrl in the final payload
      delete payload.imageUrl;

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Submit failed:", json);

        let message = "Network or upload error. Please try again.";

        if (json && typeof json === "object") {
          if (typeof json.message === "string") {
            message = json.message;
          } else if (Array.isArray(json.details) && json.details.length) {
            message = json.details.join(" ");
          } else if (typeof json.error === "string") {
            message = json.error;
          }
        }

        setStatus(`❌ ${message}`);
      } else {
        setStatus("✅ Submitted successfully!");

        // Reset the form using the saved reference (safe)
        form.reset();

        // Clear image state
        setImageFile(null);
        setImagePreviewUrl(null);
        setImageUploadState("idle");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setStatus("❌ Network or upload error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ---- Image input handlers ----
  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageUploadState("idle");

    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">
          Solana Token Metadata Submit
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Submit your token info. Updates are limited to once every{" "}
          <span className="font-semibold text-slate-200">3 hours</span> per{" "}
          <span className="font-semibold text-slate-200">
            wallet + mint
          </span>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Wallet */}
          <div>
            <label className="block text-sm mb-1">
              Wallet Address *
            </label>
            <input
              name="wallet"
              required
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Your Solana wallet"
            />
          </div>

          {/* Mint */}
          <div>
            <label className="block text-sm mb-1">
              Mint Address *
            </label>
            <input
              name="mint"
              required
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Token mint address"
            />
          </div>

          {/* Name & Symbol */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Name *</label>
              <input
                name="name"
                required
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Token name"
              />
            </div>
            <div className="w-28">
              <label className="block text-sm mb-1">Symbol *</label>
              <input
                name="symbol"
                required
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="TEST"
              />
            </div>
          </div>

          {/* Token Image */}
          <div>
            <label className="block text-sm mb-1">Token Image</label>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <div className="border border-dashed border-slate-700 rounded-md px-3 py-3 text-xs text-slate-400 bg-slate-950 flex items-center justify-between">
                  <div>
                    {imagePreviewUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={imagePreviewUrl}
                          alt="preview"
                          className="w-10 h-10 rounded-md object-cover border border-slate-700"
                        />
                        <span>Image selected</span>
                      </div>
                    ) : (
                      <span>
                        Click&nbsp;
                        <span className="font-semibold text-slate-200">
                          Choose file
                        </span>{" "}
                        or paste an image URL below.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600"
                  >
                    Choose file
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Upload an image or paste an image URL below. We’ll
                  host it for you.
                </p>
              </div>
            </div>

            {/* Optional image URL fallback */}
            <input
              name="imageUrl"
              placeholder="https://… image URL (optional)"
              className="mt-2 w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Short description of the token…"
            />
          </div>

          {/* Socials */}
          <div>
            <label className="block text-sm mb-1">Twitter</label>
            <input
              name="twitter"
              placeholder="@handle"
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Telegram</label>
            <input
              name="telegram"
              placeholder="@group"
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Website</label>
            <input
              name="website"
              placeholder="https://example.com"
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 rounded-md bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? imageUploadState === "uploading"
                ? "Uploading image…"
                : "Submitting…"
              : "Submit"}
          </button>
        </form>

        {/* Status message */}
        {status && (
          <p
            className="mt-3 text-xs"
            style={{
              marginTop: "12px",
              fontSize: "13px",
              color: status.startsWith("✅") ? "#4ade80" : "#fbbf24",
            }}
          >
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
