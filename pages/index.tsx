import { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // <- uses your existing client

type UploadState = "idle" | "uploading" | "done";

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploadState, setImageUploadState] =
    useState<UploadState>("idle");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadImageToSupabase(file: File) {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("token-images") // <- bucket name
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
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

      delete payload.imageUrl; // not needed by the API

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(
          data.message ||
            data.error ||
            "Something went wrong. Please try again."
        );
      } else {
        setStatus("✅ Submitted successfully!");
        e.currentTarget.reset();
        setImageFile(null);
        setImagePreviewUrl(null);
        setImageUploadState("idle");
      }
      } catch (err: any) {
    console.error("Submit error:", err);

    let message = "Network or upload error. Please try again.";

    if (err && typeof err === "object") {
      if ("message" in err && typeof (err as any).message === "string") {
        message = (err as any).message;
      } else {
        try {
          message = JSON.stringify(err);
        } catch {
          // keep default message
        }
      }
    }

    setStatus(message);
  } finally {
    setLoading(false);
  }
}

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setImageFile(file);
    setImageUploadState("idle");

    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUploadState("idle");

    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background: "#050816",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#111827",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>
          Solana Token Metadata Submit
        </h1>
        <p style={{ fontSize: "13px", marginBottom: "16px", color: "#9CA3AF" }}>
          Submit your token info. Updates are limited to once every{" "}
          <strong>3 hours per wallet + mint</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "13px" }}>
            Wallet Address *
            <input
              name="wallet"
              required
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
              }}
            />
          </label>

          <label style={{ fontSize: "13px" }}>
            Mint Address *
            <input
              name="mint"
              required
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
              }}
            />
          </label>

          <label style={{ fontSize: "13px" }}>
            Name
            <input
              name="name"
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
              }}
            />
          </label>

          <label style={{ fontSize: "13px" }}>
            Symbol
            <input
              name="symbol"
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
              }}
            />
          </label>

          {/* --------- TOKEN IMAGE UPLOAD (Dexscreener style) --------- */}
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              Token Image
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: "1px dashed #4B5563",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
                background: "#020617",
              }}
            >
              {imagePreviewUrl ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={imagePreviewUrl}
                    alt="preview"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "999px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ fontSize: "12px", color: "#E5E7EB" }}>
                    {imageFile?.name}
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      Click to change or drag a new file
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  <strong>Click to upload</strong> or drag &amp; drop a token
                  image here
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <div
              style={{
                marginTop: "6px",
                fontSize: "11px",
                color: "#6B7280",
              }}
            >
              Optional: or paste an image URL
            </div>
            <input
              name="imageUrl"
              placeholder="https://..."
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "7px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
                fontSize: "12px",
              }}
            />

            {imageUploadState === "uploading" && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "11px",
                  color: "#fbbf24",
                }}
              >
                Uploading image to Supabase...
              </div>
            )}
          </div>
          {/* -------------------------------------------------------- */}

          <label style={{ fontSize: "13px" }}>
            Description
            <textarea
              name="description"
              rows={3}
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
                resize: "vertical",
              }}
            />
          </label>

          <label style={{ fontSize: "13px" }}>
            Twitter
            <input
              name="twitter"
              placeholder="@handle"
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
              }}
            />
          </label>

          <label style={{ fontSize: "13px" }}>
            Telegram
            <input
              name="telegram"
              placeholder="@username or link"
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "10px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
              }}
            />
          </label>

          <label style={{ fontSize: "13px" }}>
            Website
            <input
              name="website"
              placeholder="https://"
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "14px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              background:
                "linear-gradient(90deg, #22c55e, #3b82f6, #a855f7, #ec4899)",
            }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {status && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: status.startsWith("✅") ? "#4ade80" : "#fbbf24",
              }}
            >
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
