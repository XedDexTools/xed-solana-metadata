"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface KeyboardShortcutsProps {
  onSearchFocus?: () => void;
}

export function KeyboardShortcuts({ onSearchFocus }: KeyboardShortcutsProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Only handle Escape in inputs
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // K or / to focus search
      if (e.key === "k" || e.key === "/") {
        e.preventDefault();
        if (onSearchFocus) {
          onSearchFocus();
        } else {
          // Try to find and focus search input
          const searchInput = document.querySelector('input[type="text"], input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }
      }

      // G + E for Explorer
      if (e.key === "e" && !e.ctrlKey && !e.metaKey) {
        // Only if previous key was 'g' within 500ms - simplified: just use 'e'
      }

      // Escape to close modals (handled by individual modals)
      if (e.key === "Escape") {
        // Dispatch custom event for modals to listen to
        window.dispatchEvent(new CustomEvent("close-modals"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, onSearchFocus]);

  return null;
}

// Hook for components to use
export function useKeyboardShortcut(key: string, callback: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === key) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, ...deps]);
}
