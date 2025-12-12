"use client";

import { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type UploadState = "idle" | "uploading" | "done";

export default function StartPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploadState, setImageUploadState] = useState<UploadState>("idle");
  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  async function uploadImageToSupabase(file: File) {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("token-images").upload(fileName, file);
    if (error) throw error;
    const { data: publicData } = supabase.storage.from("token-images").getPublicUrl(fileName);
    return publicData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    setStatus(null);
    setLoading(true);

    try {
      const formData = new FormData(form);
      const payload: any = Object.fromEntries(formData.entries());

      if (imageFile) {
        setImageUploadState("uploading");
        const publicUrl = await uploadImageToSupabase(imageFile);
        payload.image = publicUrl;
        setImageUploadState("done");
      } else if (payload.imageUrl) {
        payload.image = payload.imageUrl;
      }
      delete payload.imageUrl;

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        let message = "Network error";
        if (json?.message) message = json.message;
        else if (json?.error) message = json.error;
        setStatus(`error:${message}`);
      } else {
        setStatus("success:Submission complete");
        form.reset();
        setImageFile(null);
        setImagePreviewUrl(null);
        setImageUploadState("idle");
      }
    } catch (err) {
      console.error(err);
      setStatus("error:System error");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImageUploadState("idle");
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  const isError = status?.startsWith("error:");
  const isSuccess = status?.startsWith("success:");
  const statusMessage = status?.split(":")?.[1] || "";

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
       {/* Effects */}
       <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-50" />
       <div className="scanline" />

       {/* Navbar */}
       <nav className="border-b border-white/10 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
            <span className="font-bold tracking-tight text-lg">XED REGISTRY</span>
          </Link>
          <div className="font-mono text-xs text-zinc-500">
            SECURE_CONNECTION
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        {/* Sidebar Info - Hidden on mobile */}
        <div className="hidden lg:block w-80 border-r border-white/10 p-8 space-y-8 bg-zinc-950/30">
          <div>
            <h2 className="font-mono text-xs text-zinc-500 mb-2">STATUS</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full pulse-glow" />
              <span>Operational</span>
            </div>
          </div>
          <div>
            <h2 className="font-mono text-xs text-zinc-500 mb-2">NETWORK</h2>
            <p className="text-sm">Solana Mainnet</p>
          </div>
          <div>
            <h2 className="font-mono text-xs text-zinc-500 mb-2">RATE LIMIT</h2>
            <p className="text-sm font-mono text-zinc-400">1 REQ / 3 HRS</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">NEW ENTRY</h1>
              <p className="text-zinc-500">Submit metadata for on-chain registration.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Group 1 */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">01 // IDENTIFIERS</div>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide">Wallet Address</Label>
                    <Input name="wallet" required className="bg-zinc-900/50 border-zinc-800 focus:border-white h-12 font-mono text-sm rounded-none" placeholder="0x..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide">Mint Address</Label>
                    <Input name="mint" required className="bg-zinc-900/50 border-zinc-800 focus:border-white h-12 font-mono text-sm rounded-none" placeholder="Token mint..." />
                  </div>
                </div>
              </div>

              {/* Group 2 */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">02 // METADATA</div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide">Name</Label>
                    <Input name="name" required className="bg-zinc-900/50 border-zinc-800 focus:border-white h-12 rounded-none" placeholder="Token Name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide">Symbol</Label>
                    <Input name="symbol" required className="bg-zinc-900/50 border-zinc-800 focus:border-white h-12 rounded-none uppercase" placeholder="TKN" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold tracking-wide">Description</Label>
                  <Textarea name="description" required className="bg-zinc-900/50 border-zinc-800 focus:border-white min-h-[100px] rounded-none resize-none" placeholder="Asset description..." />
                </div>
              </div>

              {/* Group 3 */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">03 // ASSETS</div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-zinc-700 hover:border-white hover:bg-zinc-900/50 transition-colors p-8 text-center cursor-pointer"
                >
                  {imagePreviewUrl ? (
                    <div className="flex items-center justify-center gap-4">
                      <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover bg-black border border-zinc-800" />
                      <div className="text-left">
                        <p className="text-sm font-bold">IMAGE_LOADED</p>
                        <p className="text-xs text-zinc-500 font-mono">CLICK_TO_REPLACE</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-8 h-8 bg-zinc-800 mx-auto" />
                      <p className="text-sm font-bold">UPLOAD IMAGE</p>
                      <p className="text-xs text-zinc-500 font-mono">MAX_SIZE: 5MB</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <Input name="imageUrl" placeholder="OR PASTE URL" className="bg-transparent border-b border-zinc-800 focus:border-white border-t-0 border-x-0 rounded-none px-0 h-10 text-xs font-mono" />
              </div>

              {/* Group 4 */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">04 // LINKS</div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide">Twitter</Label>
                    <Input name="twitter" className="bg-zinc-900/50 border-zinc-800 focus:border-white h-12 rounded-none" placeholder="@" />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide">Telegram</Label>
                    <Input name="telegram" className="bg-zinc-900/50 border-zinc-800 focus:border-white h-12 rounded-none" placeholder="t.me/" />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide">Website</Label>
                    <Input name="website" className="bg-zinc-900/50 border-zinc-800 focus:border-white h-12 rounded-none" placeholder="https://" />
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button type="submit" disabled={loading} className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-sm">
                  {loading ? "PROCESSING..." : "SUBMIT ENTRY"}
                </Button>
              </div>

              {status && (
                <Alert className={`rounded-none border-l-2 border-t-0 border-r-0 border-b-0 ${isSuccess ? "border-l-green-500 bg-green-500/5" : "border-l-red-500 bg-red-500/5"}`}>
                  <AlertDescription className="font-mono text-xs uppercase">
                    {statusMessage}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}


