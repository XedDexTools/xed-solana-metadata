"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type UploadState = "idle" | "uploading" | "done";

type FormErrors = {
  wallet?: string;
  mint?: string;
  name?: string;
  symbol?: string;
  description?: string;
  image?: string;
  website?: string;
};

type FormValues = {
  wallet: string;
  mint: string;
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  imageUrl: string;
};

const FIELD_LIMITS = {
  name: 80,
  symbol: 16,
  description: 1000,
};

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

// Validation functions
function validateSolanaAddress(address: string, fieldName: string): string | undefined {
  if (!address) return `${fieldName} is required`;
  if (address.length < 32 || address.length > 44) {
    return `${fieldName} must be 32-44 characters`;
  }
  if (!BASE58_REGEX.test(address)) {
    return `${fieldName} must be a valid Base58 address`;
  }
  return undefined;
}

function validateUrl(url: string): string | undefined {
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    return "URL must start with http:// or https://";
  }
  return undefined;
}

function validateLength(value: string, field: keyof typeof FIELD_LIMITS, required: boolean = true): string | undefined {
  if (!value && required) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
  if (value && value.length > FIELD_LIMITS[field]) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must be ${FIELD_LIMITS[field]} characters or less`;
  }
  return undefined;
}

// Character counter component
function CharCounter({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const colorClass = percentage >= 100 
    ? "text-red-500" 
    : percentage >= 80 
      ? "text-yellow-500" 
      : "text-zinc-500";
  
  return (
    <span className={`text-xs font-mono ${colorClass}`}>
      {current}/{max}
    </span>
  );
}

// Progress indicator component
function FormProgress({ currentSection }: { currentSection: number }) {
  const sections = ["IDENTIFIERS", "METADATA", "ASSETS", "LINKS"];
  
  return (
    <div className="flex items-center gap-2 mb-8">
      {sections.map((section, index) => (
        <div key={section} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors ${
            index < currentSection 
              ? "bg-green-500/20 text-green-400" 
              : index === currentSection 
                ? "bg-white text-black" 
                : "bg-zinc-900 text-zinc-500"
          }`}>
            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold">
              {index < currentSection ? "✓" : index + 1}
            </span>
            <span className="hidden sm:inline">{section}</span>
          </div>
          {index < sections.length - 1 && (
            <div className={`w-4 h-0.5 ${index < currentSection ? "bg-green-500" : "bg-zinc-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Field error component
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>
  );
}

// Tooltip component
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => { e.preventDefault(); setShow(!show); }}
        className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-400 text-xs flex items-center justify-center hover:bg-zinc-700 transition-colors"
      >
        ?
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-black text-xs rounded shadow-lg whitespace-nowrap max-w-xs">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </div>
  );
}

export default function StartPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploadState, setImageUploadState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Form values state
  const [formValues, setFormValues] = useState<FormValues>({
    wallet: "",
    mint: "",
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    imageUrl: "",
  });

  // Load draft from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("xed-form-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormValues(parsed);
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      localStorage.setItem("xed-form-draft", JSON.stringify(formValues));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [formValues]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Validate a single field
  const validateField = useCallback((field: keyof FormValues, value: string): string | undefined => {
    switch (field) {
      case "wallet":
        return validateSolanaAddress(value, "Wallet address");
      case "mint":
        return validateSolanaAddress(value, "Mint address");
      case "name":
        return validateLength(value, "name");
      case "symbol":
        return validateLength(value, "symbol");
      case "description":
        return validateLength(value, "description");
      case "website":
        return value ? validateUrl(value) : undefined;
      case "imageUrl":
        return value ? validateUrl(value) : undefined;
      default:
        return undefined;
    }
  }, []);

  // Handle field change
  const handleFieldChange = useCallback((field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
    
    // Update current section based on filled fields
    if (field === "wallet" || field === "mint") {
      if (formValues.wallet && formValues.mint) setCurrentSection(1);
    } else if (field === "name" || field === "symbol" || field === "description") {
      if (formValues.name && formValues.symbol && formValues.description) setCurrentSection(2);
    }
  }, [touched, validateField, formValues]);

  // Handle field blur (validation on blur)
  const handleFieldBlur = useCallback((field: keyof FormValues) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formValues[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [formValues, validateField]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {
      wallet: validateSolanaAddress(formValues.wallet, "Wallet address"),
      mint: validateSolanaAddress(formValues.mint, "Mint address"),
      name: validateLength(formValues.name, "name"),
      symbol: validateLength(formValues.symbol, "symbol"),
      description: validateLength(formValues.description, "description"),
      website: formValues.website ? validateUrl(formValues.website) : undefined,
    };

    if (!imageFile && !formValues.imageUrl) {
      newErrors.image = "Please upload an image or provide an image URL";
    }

    setErrors(newErrors);
    setTouched({ wallet: true, mint: true, name: true, symbol: true, description: true, website: true, imageUrl: true });
    
    return !Object.values(newErrors).some(error => error !== undefined);
  }, [formValues, imageFile]);

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
    
    if (!validateForm()) {
      setStatus("error:Please fix the errors above");
      return;
    }
    
    setStatus(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = { ...formValues };

      if (imageFile) {
        setImageUploadState("uploading");
        const publicUrl = await uploadImageToSupabase(imageFile);
        payload.image = publicUrl;
        setImageUploadState("done");
      } else if (formValues.imageUrl) {
        payload.image = formValues.imageUrl;
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
        if (json?.details && Array.isArray(json.details)) {
          message = json.details[0];
        } else if (json?.message) {
          message = json.message;
        } else if (json?.error) {
          message = json.error;
        }
        setStatus(`error:${message}`);
      } else {
        localStorage.removeItem("xed-form-draft");
        const successParams = new URLSearchParams({
          mint: formValues.mint,
          name: formValues.name,
          symbol: formValues.symbol,
        });
        router.push(`/success?${successParams.toString()}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("error:System error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, image: "Please upload an image file" }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image must be less than 5MB" }));
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImageUploadState("idle");
    setImagePreviewUrl(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: undefined }));
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreviewUrl]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isSuccess = status?.startsWith("success:");
  const statusMessage = status?.split(":")?.[1] || "";
  const hasRequiredFields = formValues.wallet && formValues.mint && formValues.name && formValues.symbol && formValues.description && (imageFile || formValues.imageUrl);

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-30" />
      <div className="scanline" />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
            <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <span className="font-mono text-xs text-zinc-500">
              {draftSaved ? "DRAFT_SAVED" : "SECURE_CONNECTION"}
            </span>
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-80 border-r border-white/10 p-8 space-y-8 bg-zinc-950">
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
          <div>
            <h2 className="font-mono text-xs text-zinc-500 mb-2">APPROVAL TIME</h2>
            <p className="text-sm font-mono text-green-400">~10-15 MIN</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">NEW ENTRY</h1>
              <p className="text-zinc-400">Submit metadata for on-chain registration.</p>
            </div>

            <FormProgress currentSection={currentSection} />

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Group 1: Identifiers */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">01 // IDENTIFIERS</div>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Wallet Address</Label>
                      <Tooltip text="Your Solana wallet address (32-44 characters, Base58 format)" />
                    </div>
                    <Input 
                      name="wallet" 
                      value={formValues.wallet}
                      onChange={(e) => handleFieldChange("wallet", e.target.value)}
                      onBlur={() => handleFieldBlur("wallet")}
                      className={`bg-zinc-900 border-zinc-800 focus:border-white h-12 font-mono text-sm rounded-none ${errors.wallet && touched.wallet ? "border-red-500" : ""}`}
                      placeholder="Connect wallet or paste address..." 
                    />
                    <FieldError error={touched.wallet ? errors.wallet : undefined} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Mint Address</Label>
                      <Tooltip text="The token's mint address on Solana (32-44 characters, Base58 format)" />
                    </div>
                    <Input 
                      name="mint"
                      value={formValues.mint}
                      onChange={(e) => handleFieldChange("mint", e.target.value)}
                      onBlur={() => handleFieldBlur("mint")}
                      className={`bg-zinc-900 border-zinc-800 focus:border-white h-12 font-mono text-sm rounded-none ${errors.mint && touched.mint ? "border-red-500" : ""}`}
                      placeholder="Token mint address..." 
                    />
                    <FieldError error={touched.mint ? errors.mint : undefined} />
                  </div>
                </div>
              </div>

              {/* Group 2: Metadata */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">02 // METADATA</div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Name</Label>
                        <Tooltip text="The display name for your token" />
                      </div>
                      <CharCounter current={formValues.name.length} max={FIELD_LIMITS.name} />
                    </div>
                    <Input 
                      name="name"
                      value={formValues.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      onBlur={() => handleFieldBlur("name")}
                      maxLength={FIELD_LIMITS.name}
                      className={`bg-zinc-900 border-zinc-800 focus:border-white h-12 rounded-none ${errors.name && touched.name ? "border-red-500" : ""}`}
                      placeholder="Token Name" 
                    />
                    <FieldError error={touched.name ? errors.name : undefined} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Symbol</Label>
                        <Tooltip text="Short ticker symbol (e.g., SOL, USDC)" />
                      </div>
                      <CharCounter current={formValues.symbol.length} max={FIELD_LIMITS.symbol} />
                    </div>
                    <Input 
                      name="symbol"
                      value={formValues.symbol}
                      onChange={(e) => handleFieldChange("symbol", e.target.value.toUpperCase())}
                      onBlur={() => handleFieldBlur("symbol")}
                      maxLength={FIELD_LIMITS.symbol}
                      className={`bg-zinc-900 border-zinc-800 focus:border-white h-12 rounded-none uppercase ${errors.symbol && touched.symbol ? "border-red-500" : ""}`}
                      placeholder="TKN" 
                    />
                    <FieldError error={touched.symbol ? errors.symbol : undefined} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Description</Label>
                      <Tooltip text="A brief description of your token project" />
                    </div>
                    <CharCounter current={formValues.description.length} max={FIELD_LIMITS.description} />
                  </div>
                  <Textarea 
                    name="description"
                    value={formValues.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    onBlur={() => handleFieldBlur("description")}
                    maxLength={FIELD_LIMITS.description}
                    className={`bg-zinc-900 border-zinc-800 focus:border-white min-h-[100px] rounded-none resize-none ${errors.description && touched.description ? "border-red-500" : ""}`}
                    placeholder="Asset description..." 
                  />
                  <FieldError error={touched.description ? errors.description : undefined} />
                </div>
              </div>

              {/* Group 3: Assets */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">03 // ASSETS</div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed transition-all p-8 text-center cursor-pointer ${
                    isDragging 
                      ? "border-green-500 bg-green-500/10" 
                      : errors.image 
                        ? "border-red-500" 
                        : "border-zinc-800 hover:border-white hover:bg-white/5"
                  }`}
                >
                  {imagePreviewUrl ? (
                    <div className="flex items-center justify-center gap-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreviewUrl} alt="Preview" className="w-24 h-24 object-cover bg-zinc-900 border border-zinc-800" />
                      <div className="text-left space-y-1">
                        <p className="text-sm font-bold">IMAGE_LOADED</p>
                        {imageFile && (
                          <>
                            <p className="text-xs text-zinc-500 font-mono">{formatFileSize(imageFile.size)} / 5 MB max</p>
                            <p className="text-xs text-zinc-500 font-mono">{imageFile.type}</p>
                          </>
                        )}
                        <p className="text-xs text-zinc-600 font-mono mt-2">CLICK_TO_REPLACE</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-zinc-800 mx-auto flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <p className="text-sm font-bold">
                        {isDragging ? "DROP IMAGE HERE" : "UPLOAD IMAGE"}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono">DRAG & DROP OR CLICK</p>
                      <p className="text-xs text-zinc-600 font-mono">MAX_SIZE: 5MB • PNG, JPG, GIF, WEBP</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleFileChange} />
                </div>
                <FieldError error={errors.image} />
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-xs text-zinc-600 font-mono">OR</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                
                <Input 
                  name="imageUrl"
                  value={formValues.imageUrl}
                  onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                  placeholder="Paste image URL (https://...)" 
                  className="bg-zinc-900 border-zinc-800 focus:border-white h-10 text-xs font-mono rounded-none" 
                />
              </div>

              {/* Group 4: Links */}
              <div className="space-y-6">
                <div className="font-mono text-xs text-zinc-500 border-b border-white/10 pb-2">04 // LINKS <span className="text-zinc-600">(OPTIONAL)</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Twitter</Label>
                    <Input 
                      name="twitter"
                      value={formValues.twitter}
                      onChange={(e) => handleFieldChange("twitter", e.target.value)}
                      className="bg-zinc-900 border-zinc-800 focus:border-white h-12 rounded-none" 
                      placeholder="@username" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Telegram</Label>
                    <Input 
                      name="telegram"
                      value={formValues.telegram}
                      onChange={(e) => handleFieldChange("telegram", e.target.value)}
                      className="bg-zinc-900 border-zinc-800 focus:border-white h-12 rounded-none" 
                      placeholder="t.me/group" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">Website</Label>
                    <Input 
                      name="website"
                      value={formValues.website}
                      onChange={(e) => handleFieldChange("website", e.target.value)}
                      onBlur={() => handleFieldBlur("website")}
                      className={`bg-zinc-900 border-zinc-800 focus:border-white h-12 rounded-none ${errors.website && touched.website ? "border-red-500" : ""}`}
                      placeholder="https://..." 
                    />
                    <FieldError error={touched.website ? errors.website : undefined} />
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <Button 
                  type="submit" 
                  disabled={loading || !hasRequiredFields} 
                  className={`w-full h-14 rounded-none font-bold tracking-widest text-sm transition-all ${
                    loading 
                      ? "bg-zinc-700 cursor-not-allowed" 
                      : hasRequiredFields 
                        ? "bg-green-500 text-white hover:bg-green-600" 
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {imageUploadState === "uploading" ? "UPLOADING IMAGE..." : "PROCESSING..."}
                    </span>
                  ) : "SUBMIT ENTRY"}
                </Button>
                
                {!hasRequiredFields && (
                  <p className="text-xs text-center text-zinc-500 font-mono">
                    Fill all required fields to submit
                  </p>
                )}
              </div>

              {status && (
                <Alert className={`rounded-none border-l-4 border-t-0 border-r-0 border-b-0 ${isSuccess ? "border-l-green-500 bg-green-500/10" : "border-l-red-500 bg-red-500/10"}`}>
                  <AlertDescription className={`font-mono text-xs ${isSuccess ? "text-green-400" : "text-red-400"}`}>
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
