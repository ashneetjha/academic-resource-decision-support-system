"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { TrustFooter } from "@/components/TrustFooter";
import {
    Network, Eye, GitMerge, MessageSquare, RefreshCcw,
    ChevronDown, ChevronUp, Brain, Database, GitBranch,
    Cpu, ArrowRight, Sparkles,
} from "lucide-react";

const AGENTS = [
    {
        id: "sentinel",
        name: "SENTINEL",
        role: "Monitoring & Detection",
        color: "#f43f5e",
        gradient: "rgba(244,63,94,0.08)",
        border: "rgba(244,63,94,0.25)",
        icon: Eye,
        desc: "Continuously monitors institutional data streams for enrollment anomalies, resource bottlenecks, and policy violations. Triggers the ARIA pipeline when threshold conditions are met.",
        methods: ["Rule-based threshold detection", "Z-score anomaly detection", "Real-time data stream monitoring"],
        outputs: ["Anomaly alerts", "Severity classifications", "Trigger signals to ORACLE"],
        position: 0,
    },
    {
        id: "oracle",
        name: "ORACLE",
        role: "Demand Forecasting",
        color: "#3b82f6",
        gradient: "rgba(59,130,246,0.08)",
        border: "rgba(59,130,246,0.25)",
        icon: Brain,
        desc: "Generates multi-horizon enrollment and resource demand forecasts using ensemble time-series models. Produces probabilistic intervals consumed by ARBITER.",
        methods: ["Facebook Prophet (trend + seasonality)", "LSTM neural networks", "Ensemble fusion with confidence intervals (95%)"],
        outputs: ["Enrollment forecasts (ŷ ± CI)", "Demand shift vectors", "MAPE-calibrated uncertainty estimates"],
        position: 1,
    },
    {
        id: "arbiter",
        name: "ARBITER",
        role: "Conflict Resolution & Optimisation",
        color: "#a855f7",
        gradient: "rgba(168,85,247,0.08)",
        border: "rgba(168,85,247,0.25)",
        icon: GitMerge,
        desc: "Resolves resource conflicts using graph colouring and multi-objective optimisation. Produces a Pareto-optimal ranked proposal set for administrator review.",
        methods: ["DSatur graph colouring algorithm", "NSGA-II multi-objective genetic optimisation", "Pareto front ranking + crowding distance"],
        outputs: ["Ranked conflict-free proposals", "Pareto front visualisation", "Trade-off matrices for counterfactual analysis"],
        position: 2,
    },
    {
        id: "hermes",
        name: "HERMES",
        role: "Dialogue & Explanation",
        color: "#10b981",
        gradient: "rgba(16,185,129,0.08)",
        border: "rgba(16,185,129,0.25)",
        icon: MessageSquare,
        desc: "Provides natural language explanations of ARIA decisions using a guardrail-protected LLM grounded in institutional knowledge via RAG retrieval.",
        methods: ["Retrieval-Augmented Generation (RAG)", "GPT-4 class LLM with system prompt guardrails", "Institutional Memory vector similarity search (FAISS)"],
        outputs: ["Human-readable explanations", "RAG-cited source references", "Confidence scores per response"],
        position: 3,
    },
    {
        id: "adapt",
        name: "ADAPT",
        role: "Preference Learning",
        color: "#6366f1",
        gradient: "rgba(99,102,241,0.08)",
        border: "rgba(99,102,241,0.25)",
        icon: RefreshCcw,
        desc: "Learns from administrator accept/reject/modify decisions to update the institutional preference model via RLHF. Continuously improves proposal alignment.",
        methods: ["Proximal Policy Optimisation (PPO)", "Bradley-Terry preference modelling", "Reward model fine-tuning on feedback signals"],
        outputs: ["Updated preference weights", "RLHF alignment score", "Personalised proposal ranking"],
        position: 4,
    },
];

const INFRA_NODES = [
    {
        id: "coordinator",
        name: "COORDINATOR",
        icon: Cpu,
        color: "#f59e0b",
        desc: "Orchestrates the full multi-agent lifecycle. Routes task signals between agents, enforces execution order, and manages inter-agent message passing via an event bus.",
    },
    {
        id: "knowledge_graph",
        name: "Knowledge Graph",
        icon: GitBranch,
        color: "#3b82f6",
        desc: "A typed entity-relationship graph connecting courses, faculty, rooms, timeslots, and policies. Used by ARBITER for constraint satisfaction and by SENTINEL for scope detection.",
    },
    {
        id: "vector_db",
        name: "Vector DB (Institutional Memory)",
        icon: Database,
        color: "#10b981",
        desc: "FAISS-backed vector store containing embeddings of past decisions, policy documents, and peer-institution benchmarks. Retrieved by HERMES via cosine similarity search.",
    },
];

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
    const [expanded, setExpanded] = useState(false);
    const Icon = agent.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: agent.position * 0.08 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl p-5 cursor-pointer transition-all"
            style={{
                background: agent.gradient,
                border: `1px solid ${agent.border}`,
                boxShadow: expanded ? `0 0 20px ${agent.color}20` : "none",
            }}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40` }}
                    >
                        <Icon size={20} style={{ color: agent.color }} />
                    </div>
                    <div>
                        <div className="font-bold text-base" style={{ color: agent.color }}>{agent.name}</div>
                        <div className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{agent.role}</div>
                    </div>
                </div>
                <button className="mt-1 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {agent.desc}
            </p>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: `${agent.color}25` }}>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: agent.color }}>Methods</div>
                                <ul className="space-y-1">
                                    {agent.methods.map((m) => (
                                        <li key={m} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                                            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: agent.color }} />
                                            {m}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: agent.color }}>Outputs</div>
                                <ul className="space-y-1">
                                    {agent.outputs.map((o) => (
                                        <li key={o} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                                            <ArrowRight size={10} style={{ color: agent.color, flexShrink: 0 }} />
                                            {o}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function OrchestrationFlowDiagram() {
    return (
        <div className="glass p-5 rounded-2xl overflow-x-auto">
            <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                Orchestration Pipeline Flow
            </div>
            <div className="flex items-center gap-1 min-w-max pb-1">
                {AGENTS.map((agent, i) => {
                    const Icon = agent.icon;
                    return (
                        <div key={agent.id} className="flex items-center gap-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                className="flex flex-col items-center gap-2 px-3"
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{ background: `${agent.color}15`, border: `1.5px solid ${agent.color}40` }}
                                >
                                    <Icon size={20} style={{ color: agent.color }} />
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold" style={{ color: agent.color }}>{agent.name}</div>
                                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{agent.role.split(" ")[0]}</div>
                                </div>
                            </motion.div>
                            {i < AGENTS.length - 1 && (
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12 + 0.1, duration: 0.3 }}
                                    className="w-8 h-px origin-left"
                                    style={{ background: `linear-gradient(90deg, ${agent.color}, ${AGENTS[i + 1].color})` }}
                                />
                            )}
                        </div>
                    );
                })}
                <div className="flex items-center gap-1">
                    <div className="w-8 h-px" style={{ background: "rgba(168,85,247,0.4)" }} />
                    <div
                        className="flex flex-col items-center gap-2 px-3"
                    >
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(168,85,247,0.12)", border: "1.5px dashed rgba(168,85,247,0.5)" }}
                        >
                            <Sparkles size={18} style={{ color: "#a855f7" }} />
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-bold" style={{ color: "#a855f7" }}>ADMIN</div>
                            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Decision</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SystemPage() {
    const t = useTranslations("system");

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 px-4 lg:px-6 py-6 max-w-screen-xl mx-auto w-full space-y-8">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 mb-1">
                            <Network size={22} style={{ color: "#a855f7" }} />
                            <h1 className="text-2xl font-extrabold gradient-text">{t("title")}</h1>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
                    </motion.div>

                    {/* Orchestration pipeline */}
                    <OrchestrationFlowDiagram />

                    {/* Agent cards */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                            Specialised Agents — click any card to expand technical details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {AGENTS.map((agent) => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    </div>

                    {/* Infrastructure nodes */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                            Supporting Infrastructure
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {INFRA_NODES.map((node, i) => {
                                const Icon = node.icon;
                                return (
                                    <motion.div
                                        key={node.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass p-4 rounded-2xl hover-glow"
                                    >
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                                style={{ background: `${node.color}15` }}
                                            >
                                                <Icon size={16} style={{ color: node.color }} />
                                            </div>
                                            <div className="font-bold text-sm" style={{ color: node.color }}>{node.name}</div>
                                        </div>
                                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{node.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RLHF loop note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="glass p-5 rounded-2xl border-l-4"
                        style={{ borderLeftColor: "#6366f1" }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCcw size={15} style={{ color: "#6366f1" }} />
                            <span className="font-bold text-sm" style={{ color: "#6366f1" }}>RLHF Feedback Loop</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            Administrator accept/reject/modify decisions are captured as preference signals by <strong>ADAPT</strong>.
                            These signals retrain the Proximal Policy Optimisation (PPO) reward model every N interactions,
                            progressively aligning ARIA's recommendations with institutional priorities without retraining
                            the base forecasting or LLM models.
                        </p>
                    </motion.div>
                </main>
                <TrustFooter />
            </div>
        </div>
    );
}
