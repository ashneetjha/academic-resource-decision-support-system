"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { TrustFooter } from "@/components/TrustFooter";
import {
    BarChart2, TrendingDown, Target, Info,
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ─── Mock evaluation data ────────────────────────────────────────────────────
const MAPE_DATA = [
    { semester: "Spr 24", aria: 8.2, baseline: 14.1, target: 5.0 },
    { semester: "Mon 24", aria: 6.8, baseline: 13.4, target: 5.0 },
    { semester: "Win 24", aria: 5.9, baseline: 12.9, target: 5.0 },
    { semester: "Spr 25", aria: 5.1, baseline: 12.2, target: 5.0 },
    { semester: "Mon 25", aria: 4.6, baseline: 11.8, target: 5.0 },
    { semester: "Win 25", aria: 4.2, baseline: 11.3, target: 5.0 },
];

const CONFLICT_DATA = [
    { semester: "Spr 24", aria: 61, baseline: 38, target: 90 },
    { semester: "Mon 24", aria: 68, baseline: 40, target: 90 },
    { semester: "Win 24", aria: 74, baseline: 41, target: 90 },
    { semester: "Spr 25", aria: 81, baseline: 43, target: 90 },
    { semester: "Mon 25", aria: 86, baseline: 44, target: 90 },
    { semester: "Win 25", aria: 91, baseline: 45, target: 90 },
];

const ACCEPTANCE_DATA = [
    { semester: "Spr 24", aria: 63, singleAgent: 52, passive: 41, manual: 35 },
    { semester: "Mon 24", aria: 68, singleAgent: 54, passive: 42, manual: 36 },
    { semester: "Win 24", aria: 74, singleAgent: 55, passive: 43, manual: 35 },
    { semester: "Spr 25", aria: 79, singleAgent: 57, passive: 43, manual: 37 },
    { semester: "Mon 25", aria: 83, singleAgent: 58, passive: 44, manual: 36 },
    { semester: "Win 25", aria: 87, singleAgent: 59, passive: 44, manual: 37 },
];

const RLHF_DATA = [
    { epoch: "E1", score: 0.51 },
    { epoch: "E4", score: 0.58 },
    { epoch: "E8", score: 0.65 },
    { epoch: "E12", score: 0.72 },
    { epoch: "E16", score: 0.79 },
    { epoch: "E20", score: 0.84 },
    { epoch: "E24", score: 0.88 },
    { epoch: "E28", score: 0.91 },
];

const GINI_DATA = [
    { semester: "Spr 24", value: 0.38, target: 0.20 },
    { semester: "Mon 24", value: 0.33, target: 0.20 },
    { semester: "Win 24", value: 0.28, target: 0.20 },
    { semester: "Spr 25", value: 0.24, target: 0.20 },
    { semester: "Mon 25", value: 0.21, target: 0.20 },
    { semester: "Win 25", value: 0.19, target: 0.20 },
];

const AUDIT_DATA = [
    { semester: "Spr 24", value: 72 },
    { semester: "Mon 24", value: 79 },
    { semester: "Win 24", value: 85 },
    { semester: "Spr 25", value: 90 },
    { semester: "Mon 25", value: 95 },
    { semester: "Win 25", value: 98 },
];

const SYSTEMS = ["aria", "singleAgent", "passive", "manual"] as const;
type System = typeof SYSTEMS[number];

const SYSTEM_COLORS: Record<System, string> = {
    aria: "#a855f7",
    singleAgent: "#3b82f6",
    passive: "#f59e0b",
    manual: "#94a3b8",
};

const CHART_THEME = {
    cartesian: { stroke: "var(--border-color)", strokeDasharray: "3 3" },
    axis: { style: { fontSize: 11, fill: "var(--text-muted)" } },
    tooltip: {
        contentStyle: {
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--text-primary)",
        },
    },
};

function KPICard({
    title, desc, value, unit = "%", color, icon: Icon, trend,
}: {
    title: string; desc: string; value: number; unit?: string;
    color: string; icon: React.ElementType; trend?: "up" | "down";
}) {
    return (
        <div
            className="glass p-4 rounded-2xl hover-glow"
            style={{ borderColor: `${color}25` }}
        >
            <div className="flex items-start justify-between mb-2">
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15` }}
                >
                    <Icon size={16} style={{ color }} />
                </div>
                {trend && (
                    <TrendingDown
                        size={14}
                        style={{ color: trend === "down" ? "#10b981" : "#f43f5e", transform: trend === "up" ? "scaleY(-1)" : "none" }}
                    />
                )}
            </div>
            <div className="text-2xl font-extrabold mt-1" style={{ color }}>
                {value}{unit}
            </div>
            <div className="font-semibold text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>{title}</div>
            <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</div>
        </div>
    );
}

type SystemKey = "aria" | "singleAgent" | "passive" | "manual";

export default function EvaluationPage() {
    const t = useTranslations("evaluation");
    const [activeSystem, setActiveSystem] = useState<SystemKey>("aria");

    const systemLabels: Record<SystemKey, string> = {
        aria: t("compare_aria"),
        singleAgent: t("compare_single"),
        passive: t("compare_passive"),
        manual: t("compare_manual"),
    };

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 px-4 lg:px-6 py-6 max-w-screen-xl mx-auto w-full space-y-8">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart2 size={22} style={{ color: "#a855f7" }} />
                            <h1 className="text-2xl font-extrabold gradient-text">{t("title")}</h1>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
                    </motion.div>

                    {/* KPI summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <KPICard title="MAPE" desc="Forecast error" value={4.2} unit="%" color="#a855f7" icon={Target} trend="down" />
                        <KPICard title="Conflict Rate" desc="Resolved by ARBITER" value={91} unit="%" color="#10b981" icon={BarChart2} />
                        <KPICard title="Acceptance" desc="Admin approval rate" value={87} unit="%" color="#3b82f6" icon={BarChart2} />
                        <KPICard title="RLHF Score" desc="Preference alignment" value={91} unit="%" color="#6366f1" icon={Target} />
                        <KPICard title="Gini Index" desc="Utilisation balance" value={0.19} unit="" color="#f59e0b" icon={BarChart2} trend="down" />
                        <KPICard title="Audit %" desc="Provenance completeness" value={98} unit="%" color="#f43f5e" icon={BarChart2} />
                    </div>

                    {/* System comparison toggle */}
                    <div className="glass p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={14} style={{ color: "var(--text-muted)" }} />
                            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{t("compare_label")}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SYSTEMS.map((sys) => (
                                <button
                                    key={sys}
                                    onClick={() => setActiveSystem(sys as SystemKey)}
                                    className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        background: activeSystem === sys ? `${SYSTEM_COLORS[sys]}20` : "transparent",
                                        border: `1px solid ${activeSystem === sys ? SYSTEM_COLORS[sys] : "var(--border-color)"}`,
                                        color: activeSystem === sys ? SYSTEM_COLORS[sys] : "var(--text-muted)",
                                    }}
                                >
                                    {systemLabels[sys as SystemKey]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Charts grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* MAPE */}
                        <div className="glass p-5 rounded-2xl">
                            <div className="mb-3">
                                <h3 className="font-bold text-sm gradient-text">{t("mape_title")}</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("mape_desc")}</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={MAPE_DATA}>
                                    <CartesianGrid {...CHART_THEME.cartesian} />
                                    <XAxis dataKey="semester" tick={CHART_THEME.axis} />
                                    <YAxis tick={CHART_THEME.axis} />
                                    <Tooltip {...CHART_THEME.tooltip} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <ReferenceLine y={5} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Target", fill: "#10b981", fontSize: 10 }} />
                                    <Line type="monotone" dataKey="aria" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} name="ARIA" />
                                    <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Baseline" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Conflict Resolution */}
                        <div className="glass p-5 rounded-2xl">
                            <div className="mb-3">
                                <h3 className="font-bold text-sm gradient-text">{t("conflict_rate_title")}</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("conflict_rate_desc")}</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={CONFLICT_DATA}>
                                    <CartesianGrid {...CHART_THEME.cartesian} />
                                    <XAxis dataKey="semester" tick={CHART_THEME.axis} />
                                    <YAxis domain={[30, 100]} tick={CHART_THEME.axis} />
                                    <Tooltip {...CHART_THEME.tooltip} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Target", fill: "#10b981", fontSize: 10 }} />
                                    <Line type="monotone" dataKey="aria" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="ARIA" />
                                    <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Baseline" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Acceptance Rate – 4-system comparison */}
                        <div className="glass p-5 rounded-2xl">
                            <div className="mb-3">
                                <h3 className="font-bold text-sm gradient-text">{t("acceptance_title")}</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("acceptance_desc")}</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={ACCEPTANCE_DATA}>
                                    <CartesianGrid {...CHART_THEME.cartesian} />
                                    <XAxis dataKey="semester" tick={CHART_THEME.axis} />
                                    <YAxis domain={[30, 100]} tick={CHART_THEME.axis} />
                                    <Tooltip {...CHART_THEME.tooltip} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    {(["aria", "singleAgent", "passive", "manual"] as const)
                                        .filter((s) => activeSystem === "aria" || s === activeSystem || s === "aria")
                                        .map((sys) => (
                                            <Line
                                                key={sys}
                                                type="monotone"
                                                dataKey={sys}
                                                stroke={SYSTEM_COLORS[sys]}
                                                strokeWidth={sys === "aria" ? 2.5 : 1.5}
                                                strokeDasharray={sys !== "aria" ? "4 4" : undefined}
                                                dot={sys === "aria" ? { r: 3 } : false}
                                                name={systemLabels[sys]}
                                            />
                                        ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* RLHF Alignment */}
                        <div className="glass p-5 rounded-2xl">
                            <div className="mb-3">
                                <h3 className="font-bold text-sm gradient-text">{t("rlhf_title")}</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("rlhf_desc")}</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={RLHF_DATA}>
                                    <CartesianGrid {...CHART_THEME.cartesian} />
                                    <XAxis dataKey="epoch" tick={CHART_THEME.axis} />
                                    <YAxis domain={[0.4, 1]} tick={CHART_THEME.axis} tickFormatter={(v) => v.toFixed(1)} />
                                    <Tooltip {...CHART_THEME.tooltip} />
                                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} name="Alignment Score" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gini Index */}
                        <div className="glass p-5 rounded-2xl">
                            <div className="mb-3">
                                <h3 className="font-bold text-sm gradient-text">{t("gini_title")}</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("gini_desc")}</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={GINI_DATA}>
                                    <CartesianGrid {...CHART_THEME.cartesian} />
                                    <XAxis dataKey="semester" tick={CHART_THEME.axis} />
                                    <YAxis domain={[0.1, 0.45]} tick={CHART_THEME.axis} tickFormatter={(v) => v.toFixed(2)} />
                                    <Tooltip {...CHART_THEME.tooltip} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <ReferenceLine y={0.20} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Target", fill: "#10b981", fontSize: 10 }} />
                                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} name="Gini (ARIA)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Audit Completeness */}
                        <div className="glass p-5 rounded-2xl">
                            <div className="mb-3">
                                <h3 className="font-bold text-sm gradient-text">{t("audit_title")}</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("audit_desc")}</p>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={AUDIT_DATA}>
                                    <CartesianGrid {...CHART_THEME.cartesian} />
                                    <XAxis dataKey="semester" tick={CHART_THEME.axis} />
                                    <YAxis domain={[60, 100]} tick={CHART_THEME.axis} />
                                    <Tooltip {...CHART_THEME.tooltip} />
                                    <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} name="Audit %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </main>
                <TrustFooter />
            </div>
        </div>
    );
}
