"use client";

import { useTranslations } from "next-intl";
import { Shield, Clock } from "lucide-react";

export function TrustFooter() {
    const t = useTranslations("common");
    const now = new Date();
    const syncTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    return (
        <footer
            className="py-4 px-4 lg:px-6 border-t mt-8"
            style={{ borderColor: "var(--border-color)" }}
        >
            <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Oversight notice */}
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                    style={{
                        background: "rgba(168,85,247,0.07)",
                        border: "1px solid rgba(168,85,247,0.15)",
                        color: "var(--text-secondary)",
                    }}
                >
                    <Shield size={13} style={{ color: "#a855f7", flexShrink: 0 }} />
                    {t("oversight_notice")}
                </div>

                {/* Sync info */}
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="font-medium" style={{ color: "#10b981" }}>{t("data_fresh")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{t("last_sync")}: {syncTime} · {dateStr}</span>
                    </div>
                    <span className="hidden sm:block" style={{ color: "var(--text-muted)" }}>
                        ARIA v1.0 · Research Preview
                    </span>
                </div>
            </div>
        </footer>
    );
}
