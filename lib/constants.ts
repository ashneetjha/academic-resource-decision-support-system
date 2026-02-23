// App-wide constants for ARIA

export const APP_NAME = "ARIA";
export const APP_FULL_NAME = "Agentic Resource Intelligence for Academia";
export const APP_VERSION = "1.0.0";

export const SEVERITY_COLORS = {
    low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    high: "text-rose-400 bg-rose-400/10 border-rose-400/30",
} as const;

export const SEVERITY_DOT_COLORS = {
    low: "bg-emerald-400",
    medium: "bg-amber-400",
    high: "bg-rose-400",
} as const;

export const NAV_LINKS = [
    { href: "/dashboard", labelKey: "nav.dashboard", icon: "LayoutDashboard" },
    { href: "/planning", labelKey: "nav.planning", icon: "FlaskConical" },
    { href: "/chat", labelKey: "nav.chat", icon: "MessageCircle" },
    { href: "/audit", labelKey: "nav.audit", icon: "GitBranch" },
    { href: "/settings", labelKey: "nav.settings", icon: "Settings" },
] as const;

export const PROPOSAL_ACTIONS = {
    ACCEPT: "accept",
    REJECT: "reject",
    MODIFY: "modify",
} as const;

export const SUPPORTED_LOCALES = ["en", "hi"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const CHART_COLORS = {
    primary: "#A855F7",
    secondary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#F43F5E",
    upper: "rgba(168, 85, 247, 0.15)",
    lower: "rgba(168, 85, 247, 0.15)",
};
