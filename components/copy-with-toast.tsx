"use client";

import { useState, ReactNode } from "react";
import { useToast } from "./toast";

interface CopyWithToastProps {
  text: string;
  children?: ReactNode;
  className?: string;
  successMessage?: string;
  showIcon?: boolean;
}

export function CopyWithToast({
  text,
  children,
  className = "",
  successMessage = "Copied to clipboard!",
  showIcon = true,
}: CopyWithToastProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(successMessage, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 transition-all ${className}`}
      title="Click to copy"
    >
      {children}
      {showIcon && (
        <span className={`transition-colors ${copied ? "text-green-500" : "text-zinc-500 hover:text-white"}`}>
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
}
