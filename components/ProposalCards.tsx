"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useARIAStore, Proposal } from "@/store/ariaStore";
import { feedbackApi } from "@/lib/api";
import { useState } from "react";
import {
    CheckCircle, XCircle, Edit3, Zap, ChevronDown, ChevronUp,
    TrendingDown, TrendingUp, Minus, AlertTriangle,
} from "lucide-react";

function ImpactBadge({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="glass px-2.5 py-1.5 rounded-xl text-center">
            <div className="text-xs font-bold" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
        </div>
    );
}

// Deterministic counterfactual data per proposal
const COUNTERFACTUAL_DATA: Record<string, {
    passRateDelta: number;
    facultyLoad: number;
    utilisationShift: number;
    summary: string;
}> = {
    "prop-1": { passRateDelta: -2.1, facultyLoad: +8.4, utilisationShift: +3.2, summary: "Choosing the alternative would reduce pass rates by 2.1% and increase faculty overload." },
    "prop-2": { passRateDelta: +1.4, facultyLoad: -5.2, utilisationShift: -4.7, summary: "The alternative improves utilisation balance but sacrifices some enrollment flexibility." },
    "prop-3": { passRateDelta: -0.8, facultyLoad: +2.1, utilisationShift: +1.3, summary: "Near-neutral outcome; primary risk is a marginal faculty load increase." },
};

function DeltaIndicator({ value, suffix = "%" }: { value: number; suffix?: string }) {
    const isPos = value > 0;
    const isNeg = value < 0;
    const Icon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;
    const color = isPos ? "#10b981" : isNeg ? "#f43f5e" : "#94a3b8";
    return (
        <span className="flex items-center gap-0.5 font-bold text-sm" style={{ color }}>
            <Icon size={13} />
            {isPos ? "+" : ""}{value.toFixed(1)}{suffix}
        </span>
    );
}

function CounterfactualDrawer({ proposalId }: { proposalId: string }) {
    const t = useTranslations("dashboard");
    const data = COUNTERFACTUAL_DATA[proposalId];
    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
        >
            <div
                className="mt-3 p-4 rounded-xl border space-y-3"
                style={{ background: "rgba(59,130,246,0.04)", borderColor: "rgba(59,130,246,0.18)" }}
            >
                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#3b82f6" }}>
                    <AlertTriangle size={12} />
                    {t("counterfactual_title")}
                    <span className="font-normal" style={{ color: "var(--text-muted)" }}>— {t("counterfactual_subtitle")}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center space-y-1">
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t("counterfactual_pass_rate")}</div>
                        <DeltaIndicator value={data.passRateDelta} />
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t("counterfactual_faculty")}</div>
                        <DeltaIndicator value={data.facultyLoad} />
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t("counterfactual_utilisation")}</div>
                        <DeltaIndicator value={data.utilisationShift} />
                    </div>
                </div>

                <p className="text-xs leading-relaxed border-t pt-2" style={{ borderColor: "rgba(59,130,246,0.15)", color: "var(--text-secondary)" }}>
                    {data.summary}
                </p>
            </div>
        </motion.div>
    );
}

export function ProposalCards() {
    const t = useTranslations("dashboard");
    const { proposals, updateProposalStatus, setLoading, setAdminDecision, loadingStates } = useARIAStore();
    const [error, setError] = useState<string | null>(null);
    const [expandedCounterfactual, setExpandedCounterfactual] = useState<string | null>(null);

    const handleFeedback = async (proposal: Proposal, action: "accept" | "reject" | "modify") => {
        setLoading("feedback", true);
        setError(null);
        try {
            await feedbackApi.submit({ proposal_id: proposal.id, action });
            updateProposalStatus(proposal.id, action === "accept" ? "accepted" : action === "reject" ? "rejected" : "modified");
            setAdminDecision({ proposal_id: proposal.id, action, timestamp: new Date().toISOString() });
        } catch {
            setError("Failed to submit feedback. Please check your connection.");
        } finally {
            setLoading("feedback", false);
        }
    };

    if (proposals.length === 0) {
        return (
            <div className="glass p-6 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                No proposals available
            </div>
        );
    }

    return (
        <div className="glass p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <Zap size={18} style={{ color: "#a855f7" }} />
                <h2 className="font-bold text-base gradient-text">{t("proposals_title")}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
                    {t("proposals_subtitle")}
                </span>
            </div>

            {error && (
                <div className="badge-high px-3 py-2 rounded-xl text-sm">{error}</div>
            )}

            <div className="space-y-3">
                <AnimatePresence>
                    {proposals.map((proposal, i) => {
                        const isActive = proposal.status === "pending";
                        const statusColor =
                            proposal.status === "accepted" ? "#10b981"
                                : proposal.status === "rejected" ? "#f43f5e"
                                    : "#a855f7";
                        const isCounterfactualOpen = expandedCounterfactual === proposal.id;

                        return (
                            <motion.div
                                key={proposal.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass p-4 space-y-3 hover-glow transition-all ${!isActive ? "opacity-70" : ""}`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">
                                            {proposal.rank}
                                        </div>
                                        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                            {proposal.id}
                                        </span>
                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            · {proposal.resource}
                                        </span>
                                    </div>
                                    {!isActive && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                                            style={{ background: statusColor + "20", color: statusColor }}
                                        >
                                            {proposal.status}
                                        </span>
                                    )}
                                </div>

                                {/* Summary */}
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    {proposal.summary}
                                </p>

                                {/* Trade-off */}
                                <div
                                    className="text-xs px-3 py-2 rounded-xl"
                                    style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
                                >
                                    <span className="font-semibold">Trade-off: </span>
                                    {proposal.tradeoff}
                                </div>

                                {/* Impact badges */}
                                <div className="flex gap-2 flex-wrap">
                                    <ImpactBadge
                                        label="Utilisation"
                                        value={`${proposal.predicted_impact.utilisation_delta > 0 ? "+" : ""}${(proposal.predicted_impact.utilisation_delta * 100).toFixed(0)}%`}
                                        color="#10b981"
                                    />
                                    <ImpactBadge
                                        label="Conflicts -"
                                        value={`${proposal.predicted_impact.conflict_reduction}`}
                                        color="#a855f7"
                                    />
                                    <ImpactBadge
                                        label="Cost"
                                        value={`${proposal.predicted_impact.cost_change > 0 ? "+" : ""}${(proposal.predicted_impact.cost_change * 100).toFixed(0)}%`}
                                        color={proposal.predicted_impact.cost_change <= 0 ? "#10b981" : "#f59e0b"}
                                    />
                                </div>

                                {/* Counterfactual toggle */}
                                <button
                                    onClick={() => setExpandedCounterfactual(isCounterfactualOpen ? null : proposal.id)}
                                    className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                                    style={{ color: isCounterfactualOpen ? "#3b82f6" : "var(--text-muted)" }}
                                >
                                    {isCounterfactualOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    {t("counterfactual_title")}
                                </button>

                                <AnimatePresence>
                                    {isCounterfactualOpen && (
                                        <CounterfactualDrawer proposalId={proposal.id} />
                                    )}
                                </AnimatePresence>

                                {/* Actions */}
                                {isActive && (
                                    <div className="flex gap-2 flex-wrap pt-1">
                                        <button
                                            onClick={() => handleFeedback(proposal, "accept")}
                                            disabled={loadingStates.feedback}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                                            aria-label={`Accept proposal ${proposal.id}`}
                                        >
                                            <CheckCircle size={14} />
                                            {t("accept")}
                                        </button>
                                        <button
                                            onClick={() => handleFeedback(proposal, "modify")}
                                            disabled={loadingStates.feedback}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                            style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)" }}
                                            aria-label={`Modify proposal ${proposal.id}`}
                                        >
                                            <Edit3 size={14} />
                                            {t("modify")}
                                        </button>
                                        <button
                                            onClick={() => handleFeedback(proposal, "reject")}
                                            disabled={loadingStates.feedback}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                            style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.25)" }}
                                            aria-label={`Reject proposal ${proposal.id}`}
                                        >
                                            <XCircle size={14} />
                                            {t("reject")}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
