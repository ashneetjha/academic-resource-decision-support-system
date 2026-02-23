"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
    compact?: boolean;
}

export function LanguageToggle({ compact }: LanguageToggleProps) {
    const [isPending, startTransition] = useTransition();
    const [currentLocale, setCurrentLocale] = useState(() => {
        if (typeof document !== "undefined") {
            return document.cookie.match(/aria-locale=([^;]+)/)?.[1] || "en";
        }
        return "en";
    });

    const toggleLocale = () => {
        const next = currentLocale === "en" ? "hi" : "en";
        startTransition(() => {
            // Set cookie so the server-side layout picks it up on next navigation
            document.cookie = `aria-locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
            setCurrentLocale(next);
            // Full page refresh to re-render server components with new locale
            window.location.reload();
        });
    };

    return (
        <button
            onClick={toggleLocale}
            disabled={isPending}
            className={`rounded-xl transition-all duration-200 hover:bg-purple-900/20 flex items-center gap-1.5 ${compact ? "p-2 flex-1 justify-center" : "px-2.5 py-2"
                }`}
            aria-label={`Switch to ${currentLocale === "en" ? "Hindi" : "English"}`}
            title={currentLocale === "en" ? "Switch to Hindi (हिन्दी)" : "Switch to English"}
        >
            <Globe size={compact ? 16 : 18} style={{ color: "var(--text-secondary)" }} />
            {!compact && (
                <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                >
                    {currentLocale}
                </span>
            )}
        </button>
    );
}
