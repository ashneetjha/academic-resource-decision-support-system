"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useARIAStore, AgentTimelineEvent } from "@/store/ariaStore";
import { Clock, Zap, ChevronRight } from "lucide-react";

const AGENT_COLORS: Record<AgentTimelineEvent["agent"], string> = {
    SENTINEL: "#f43f5e",
    ORACLE: "#3b82f6",
    ARBITER: "#a855f7",
    HERMES: "#10b981",
    ADMIN: "#f59e0b",
    ADAPT: "#6366f1",
};

const AGENT_ORDER: AgentTimelineEvent["agent"][] = ["SENTINEL", "ORACLE", "ARBITER", "HERMES", "ADMIN", "ADAPT"];

const MOCK_EVENTS: AgentTimelineEvent[] = [
    {
        id: "evt-1", agent: "SENTINEL", timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
        duration_ms: 124, severity: "high", decision_type: "Anomaly Detected",
        snapshot: { trigger: "enrollment_spike", course: "CS401", delta: "+34%", confidence: 0.94 },
    },
    {
        id: "evt-2", agent: "ORACLE", timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        duration_ms: 842, severity: "medium", decision_type: "Forecast Generated",
        snapshot: { model: "Prophet+LSTM", horizon: "2 semesters", mape: 4.2, intervals: "95%" },
    },
    {
        id: "evt-3", agent: "ARBITER", timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        duration_ms: 2310, severity: "high", decision_type: "Conflict Resolved",
        snapshot: { algorithm: "DSatur + NSGA-II", conflicts_detected: 3, resolved: 3, pareto_front_size: 7 },
    },
    {
        id: "evt-4", agent: "HERMES", timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        duration_ms: 1560, severity: "low", decision_type: "Proposal Explained",
        snapshot: { rag_docs_retrieved: 4, llm_tokens: 512, guardrail: "passed", confidence: 0.88 },
    },
    {
        id: "evt-5", agent: "ADMIN", timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        duration_ms: 0, severity: "medium", decision_type: "Decision Pending",
        snapshot: { proposal_id: "prop-2", action: "awaiting_approval", deadline: "2h" },
    },
    {
        id: "evt-6", agent: "ADAPT", timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
        duration_ms: 390, severity: "low", decision_type: "Preference Updated",
        snapshot: { method: "PPO-RLHF", reward_delta: +0.07, epochs: 12, alignment_score: 0.91 },
    },
];

function TimeAgo({ ts }: { ts: string }) {
    const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    return <span>{mins < 1 ? "just now" : `${mins}m ago`}</span>;
}

export function AgentTimeline() {
    const t = useTranslations("dashboard");
    const { agentTimeline, setAgentTimeline } = useARIAStore();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            setAgentTimeline(MOCK_EVENTS);
        }
    }, [setAgentTimeline]);

    const events = agentTimeline.length > 0 ? agentTimeline : MOCK_EVENTS;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass p-5 rounded-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-bold text-sm gradient-text">{t("agent_timeline_title")}</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("agent_timeline_subtitle")}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Zap size={12} style={{ color: "#10b981" }} />
                    Live
                </div>
            </div>

            {/* Agent labels */}
            <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                {AGENT_ORDER.map((agent, i) => (
                    <div key={agent} className="flex items-center gap-0.5 flex-shrink-0">
                        <div
                            className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                            style={{ background: `${AGENT_COLORS[agent]}18`, color: AGENT_COLORS[agent], border: `1px solid ${AGENT_COLORS[agent]}40` }}
                        >
                            {agent}
                        </div>
                        {i < AGENT_ORDER.length - 1 && (
                            <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Timeline events */}
            <div className="relative overflow-x-auto">
                <div className="flex gap-3 min-w-max pb-2">
                    {events.map((event) => {
                        const color = AGENT_COLORS[event.agent];
                        const isHovered = hoveredId === event.id;
                        return (
                            <div
                                key={event.id}
                                className="relative cursor-pointer"
                                onMouseEnter={() => setHoveredId(event.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-40 p-3 rounded-xl border"
                                    style={{
                                        background: `${color}0a`,
                                        borderColor: isHovered ? `${color}60` : `${color}25`,
                                        boxShadow: isHovered ? `0 0 12px ${color}30` : "none",
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-bold" style={{ color }}>{event.agent}</span>
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                            style={{
                                                background: event.severity === "high" ? "rgba(244,63,94,0.12)" : event.severity === "medium" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                                                color: event.severity === "high" ? "#f43f5e" : event.severity === "medium" ? "#f59e0b" : "#10b981",
                                            }}
                                        >
                                            {event.severity}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold mb-1 truncate" style={{ color: "var(--text-primary)" }}>{event.decision_type}</div>
                                    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                                        <Clock size={10} />
                                        <TimeAgo ts={event.timestamp} />
                                        {event.duration_ms > 0 && <span>· {event.duration_ms}ms</span>}
                                    </div>
                                </motion.div>

                                {/* JSON Snapshot Tooltip */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute top-full left-0 mt-2 z-50 w-56 rounded-xl p-3 text-xs"
                                            style={{
                                                background: "var(--bg-secondary)",
                                                border: `1px solid ${color}40`,
                                                boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
                                            }}
                                        >
                                            <div className="font-semibold mb-2" style={{ color }}>JSON Snapshot</div>
                                            <pre className="overflow-auto max-h-32 font-mono text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                                {JSON.stringify(event.snapshot, null, 2)}
                                            </pre>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
