"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useARIAStore, InstitutionalMemoryRecord } from "@/store/ariaStore";
import { BookOpen, Clock, CheckCircle2 } from "lucide-react";

const MOCK_MEMORY: InstitutionalMemoryRecord[] = [
    {
        id: "mem-1",
        date: "2025-08-14",
        context: "CS department enrollment surge: +28% in CS401, three rooms at capacity, faculty overlap detected.",
        decision: "Approved temporary lab allocation + hired 1 adjunct instructor for CS401.",
        outcome: "Conflict resolved. Student satisfaction index improved +6 pts. No dropout increase.",
        similarity_score: 0.94,
        agent: "ARBITER",
    },
    {
        id: "mem-2",
        date: "2025-01-22",
        context: "MBA program launched mid-semester; MBA Core rooms double-booked with existing Finance seminars.",
        decision: "Rerouted MBA Core to evening slots; Finance seminars retained morning priority.",
        outcome: "Zero room conflicts in following semester. Faculty load balanced within 5% threshold.",
        similarity_score: 0.87,
        agent: "ARBITER",
    },
    {
        id: "mem-3",
        date: "2024-07-03",
        context: "Monsoon semester: 3 faculty on medical leave simultaneously; 6 courses under-staffed.",
        decision: "Cross-departmental faculty sharing agreement invoked; 2 courses moved to async delivery.",
        outcome: "All courses completed. Student complaint rate: 2.1% (below 5% threshold).",
        similarity_score: 0.81,
        agent: "HERMES",
    },
];

export function InstitutionalMemoryPanel() {
    const t = useTranslations("dashboard");
    const { institutionalMemory, setInstitutionalMemory } = useARIAStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            setInstitutionalMemory(MOCK_MEMORY);
        }
    }, [setInstitutionalMemory]);

    const records = institutionalMemory.length > 0 ? institutionalMemory : MOCK_MEMORY;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass p-5 rounded-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-bold text-sm gradient-text">{t("memory_title")}</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("memory_subtitle")}</p>
                </div>
                <div
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                    RAG Grounded
                </div>
            </div>

            <div className="space-y-3">
                {records.map((rec, i) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-xl p-4 border"
                        style={{
                            background: "rgba(168,85,247,0.04)",
                            borderColor: "rgba(168,85,247,0.12)",
                        }}
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen size={13} style={{ color: "#a855f7", flexShrink: 0 }} />
                                <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                                    {rec.context.substring(0, 60)}…
                                </span>
                            </div>
                            <div
                                className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
                            >
                                {t("memory_similarity")}: {Math.round(rec.similarity_score * 100)}%
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div className="text-xs space-y-0.5">
                                <div className="font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>Decision</div>
                                <div style={{ color: "var(--text-secondary)" }} className="leading-snug">{rec.decision}</div>
                            </div>
                            <div className="text-xs space-y-0.5">
                                <div className="font-semibold uppercase tracking-wide flex items-center gap-1" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                                    <CheckCircle2 size={9} style={{ color: "#10b981" }} /> Outcome
                                </div>
                                <div style={{ color: "var(--text-secondary)" }} className="leading-snug">{rec.outcome}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2.5">
                            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                                <Clock size={9} />
                                {new Date(rec.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                            </div>
                            <div
                                className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: "0.6rem", fontWeight: 600 }}
                            >
                                via {rec.agent}
                            </div>

                            {/* Similarity bar */}
                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(168,85,247,0.1)" }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${rec.similarity_score * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
