"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { TrustFooter } from "@/components/TrustFooter";
import {
    Shield, CheckCircle, Download, AlertTriangle,
    EyeOff, Users, Hand, Lock, ClipboardCheck, ScrollText, FileText,
} from "lucide-react";

const PRIVACY_PRINCIPLES = [
    {
        key: "privacy_pii",
        descKey: "privacy_pii_desc",
        icon: EyeOff,
        color: "#10b981",
    },
    {
        key: "privacy_faculty",
        descKey: "privacy_faculty_desc",
        icon: Users,
        color: "#3b82f6",
    },
    {
        key: "privacy_hitl",
        descKey: "privacy_hitl_desc",
        icon: Hand,
        color: "#a855f7",
    },
    {
        key: "privacy_guardrail",
        descKey: "privacy_guardrail_desc",
        icon: Lock,
        color: "#f59e0b",
    },
    {
        key: "privacy_rlhf",
        descKey: "privacy_rlhf_desc",
        icon: CheckCircle,
        color: "#6366f1",
    },
    {
        key: "privacy_provenance",
        descKey: "privacy_provenance_desc",
        icon: ClipboardCheck,
        color: "#f43f5e",
    },
];

const MODEL_CARD = {
    name: "ARIA v1.0",
    version: "1.0.0-research-preview",
    date: "2026-02-23",
    authors: ["ARIA Research Team"],
    license: "Institutional Use Only — Not for Commercial Redistribution",
    description: "ARIA is a research-grade multi-agent AI system for academic resource intelligence.",
    capabilities: {
        forecasting: "Facebook Prophet + LSTM ensemble for enrollment demand forecasting",
        conflict_resolution: "DSatur graph colouring + NSGA-II multi-objective optimisation",
        dialogue: "GPT-4 class LLM with RAG grounding and content guardrails",
        preference_learning: "PPO-based RLHF with Bradley-Terry preference modelling",
    },
    limitations: [
        "Forecasts carry inherent uncertainty; 95% CI provided but not guaranteed",
        "RLHF model may reflect historical allocation biases present in training data",
        "LLM outputs may contain factual errors despite RAG grounding — always verify",
        "System is a decision-support tool; human administrator approval is mandatory",
    ],
    ethical_considerations: {
        privacy: "No student PII is processed. Faculty data is aggregated at department level.",
        fairness: "Bias monitoring is ongoing. DSatur colouring is NP-hard approx; edge cases may exist.",
        transparency: "Full provenance logging for all AI-generated recommendations.",
        accountability: "Human-in-the-loop guarantee. No autonomous resource commitments.",
    },
    intended_use: "Academic resource allocation decision-support for institutional administrators.",
    out_of_scope: "Not intended for student-facing use, financial commitments, or HR decisions.",
};

function downloadModelCard() {
    const blob = new Blob([JSON.stringify(MODEL_CARD, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ARIA_Model_Card_v1.0.json";
    a.click();
    URL.revokeObjectURL(url);
}

function downloadProvenanceLog() {
    const log = {
        exported_at: new Date().toISOString(),
        system: "ARIA v1.0",
        entries: [
            { id: "prov-001", timestamp: "2026-02-23T10:14:00Z", agent: "SENTINEL", action: "anomaly_detected", decision: "triggered_pipeline", data_sources: ["enrollment_db", "room_schedule"] },
            { id: "prov-002", timestamp: "2026-02-23T10:15:22Z", agent: "ORACLE", action: "forecast_generated", model: "Prophet+LSTM", mape: 4.2, data_sources: ["historical_enrollment"] },
            { id: "prov-003", timestamp: "2026-02-23T10:17:45Z", agent: "ARBITER", action: "proposals_ranked", algorithm: "DSatur+NSGA-II", proposals: 3, data_sources: ["knowledge_graph"] },
            { id: "prov-004", timestamp: "2026-02-23T10:22:10Z", agent: "ADMIN", action: "proposal_accepted", proposal_id: "prop-1", notes: "Aligns with budget constraints" },
            { id: "prov-005", timestamp: "2026-02-23T10:22:45Z", agent: "ADAPT", action: "preference_updated", rlhf_delta: 0.07, epochs: 12 },
        ],
    };
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ARIA_Provenance_Log.json";
    a.click();
    URL.revokeObjectURL(url);
}

type TKey = Parameters<ReturnType<typeof useTranslations>>[0];

export default function GovernancePage() {
    const t = useTranslations("governance");
    const [modelCardExpanded, setModelCardExpanded] = useState(false);

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 px-4 lg:px-6 py-6 max-w-screen-xl mx-auto w-full space-y-8">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={22} style={{ color: "#a855f7" }} />
                            <h1 className="text-2xl font-extrabold gradient-text">{t("title")}</h1>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
                    </motion.div>

                    {/* Privacy-by-Design */}
                    <section>
                        <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                            {t("privacy_title")}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {PRIVACY_PRINCIPLES.map(({ key, descKey, icon: Icon, color }, i) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    className="glass p-4 rounded-2xl hover-glow"
                                >
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div
                                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${color}15` }}
                                        >
                                            <Icon size={16} style={{ color }} />
                                        </div>
                                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                            {t(key as TKey)}
                                        </div>
                                        <CheckCircle size={13} className="ml-auto flex-shrink-0" style={{ color: "#10b981" }} />
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                        {t(descKey as TKey)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Model Card + Downloads */}
                    <section>
                        <div className="glass p-5 rounded-2xl">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-base font-bold gradient-text">{t("model_card_title")}</h2>
                                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                        ARIA v1.0 · Research Preview · {MODEL_CARD.date}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={downloadModelCard}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                                        style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}
                                    >
                                        <Download size={13} />
                                        {t("model_card_download")}
                                    </button>
                                    <button
                                        onClick={downloadProvenanceLog}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                                        style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6" }}
                                    >
                                        <FileText size={13} />
                                        {t("export_provenance")}
                                    </button>
                                </div>
                            </div>

                            {/* Model card summary */}
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>Capabilities</div>
                                    {Object.entries(MODEL_CARD.capabilities).map(([k, v]) => (
                                        <div key={k} className="mb-1.5">
                                            <span className="text-xs font-semibold capitalize" style={{ color: "#a855f7" }}>{k.replace("_", " ")}: </span>
                                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>Known Limitations</div>
                                    {MODEL_CARD.limitations.map((lim, i) => (
                                        <div key={i} className="flex items-start gap-1.5 mb-1.5">
                                            <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{lim}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Risk, Bias, Compliance row */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* AI Risk Disclosure */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass p-5 rounded-2xl border-l-4"
                            style={{ borderLeftColor: "#f43f5e" }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={15} style={{ color: "#f43f5e" }} />
                                <h3 className="font-bold text-sm" style={{ color: "#f43f5e" }}>{t("risk_title")}</h3>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t("risk_desc")}</p>
                        </motion.div>

                        {/* Bias Awareness */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.08 }}
                            className="glass p-5 rounded-2xl border-l-4"
                            style={{ borderLeftColor: "#f59e0b" }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <ScrollText size={15} style={{ color: "#f59e0b" }} />
                                <h3 className="font-bold text-sm" style={{ color: "#f59e0b" }}>{t("bias_title")}</h3>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t("bias_desc")}</p>
                        </motion.div>

                        {/* Compliance */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.16 }}
                            className="glass p-5 rounded-2xl border-l-4"
                            style={{ borderLeftColor: "#10b981" }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle size={15} style={{ color: "#10b981" }} />
                                <h3 className="font-bold text-sm" style={{ color: "#10b981" }}>{t("compliance_title")}</h3>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t("compliance_desc")}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {["UGC", "AICTE", "IEEE AI Ethics", "ACM FAccT", "NAAC Ready"].map((badge) => (
                                    <span
                                        key={badge}
                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                        style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    {/* Ethical considerations from model card */}
                    <section className="glass p-5 rounded-2xl">
                        <h2 className="text-sm font-bold mb-4 gradient-text">Ethical Considerations (from Model Card)</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(MODEL_CARD.ethical_considerations).map(([k, v]) => (
                                <div key={k} className="flex items-start gap-2.5">
                                    <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#10b981" }} />
                                    <div>
                                        <div className="text-xs font-bold capitalize" style={{ color: "var(--text-primary)" }}>{k}</div>
                                        <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{v}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
                <TrustFooter />
            </div>
        </div>
    );
}
