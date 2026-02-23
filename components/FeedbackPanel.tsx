"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useARIAStore } from "@/store/ariaStore";
import { CheckCircle, RefreshCw, Brain } from "lucide-react";

export function FeedbackPanel() {
    const t = useTranslations("dashboard");
    const { adminDecision, preferenceUpdateDetected } = useARIAStore();

    if (!adminDecision) {
        return (
            <div className="glass p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Brain size={18} style={{ color: "#a855f7" }} />
                    <h2 className="font-bold text-base gradient-text">{t("feedback_title")}</h2>
                </div>
                <div className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
                    No admin decision recorded yet.
                    <br />
                    Accept, modify, or reject a proposal to see feedback.
                </div>
            </div>
        );
    }

    const actionColor =
        adminDecision.action === "accept"
            ? "#10b981"
            : adminDecision.action === "reject"
                ? "#f43f5e"
                : "#3b82f6";

    const actionLabel =
        adminDecision.action === "accept"
            ? "Accepted"
            : adminDecision.action === "reject"
                ? "Rejected"
                : "Modified";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5 space-y-4"
        >
            <div className="flex items-center gap-2">
                <Brain size={18} style={{ color: "#a855f7" }} />
                <h2 className="font-bold text-base gradient-text">{t("feedback_title")}</h2>
            </div>

            {/* Last decision */}
            <div className="glass px-4 py-3 space-y-2 rounded-xl">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        Last Decision
                    </span>
                    <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                        style={{ background: actionColor + "20", color: actionColor }}
                    >
                        {actionLabel}
                    </span>
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Proposal: <span className="font-mono font-semibold">{adminDecision.proposal_id}</span>
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(adminDecision.timestamp).toLocaleString()}
                </div>
            </div>

            {/* Preference learning notice */}
            <div
                className="px-4 py-3 rounded-xl flex items-start gap-3 text-sm"
                style={{
                    background: "rgba(168,85,247,0.08)",
                    border: "1px solid rgba(168,85,247,0.2)",
                    color: "var(--text-secondary)",
                }}
            >
                <RefreshCw size={16} className="mt-0.5 shrink-0" style={{ color: "#a855f7" }} />
                <div>
                    <div className="font-semibold mb-0.5" style={{ color: "#a855f7" }}>
                        Preference Learning Active
                    </div>
                    ADAPT is updating your preference weights based on this decision.
                </div>
            </div>

            {/* ADAPT update badge */}
            {preferenceUpdateDetected && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl badge-low"
                >
                    <CheckCircle size={14} />
                    <span className="text-xs font-medium">
                        ADAPT preference model updated successfully
                    </span>
                </motion.div>
            )}
        </motion.div>
    );
}
