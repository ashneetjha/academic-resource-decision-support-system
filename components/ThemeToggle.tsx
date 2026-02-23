"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
    compact?: boolean;
}

export function ThemeToggle({ compact }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`rounded-xl transition-all duration-200 hover:bg-purple-900/20 ${compact ? "p-2 flex-1" : "p-2"
                }`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
        >
            {isDark ? (
                <Sun size={compact ? 16 : 18} style={{ color: "#f59e0b" }} />
            ) : (
                <Moon size={compact ? 16 : 18} style={{ color: "#7c3aed" }} />
            )}
        </button>
    );
}
