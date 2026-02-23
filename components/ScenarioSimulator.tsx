"use client";

import { useTranslations } from "next-intl";
import { useARIAStore } from "@/store/ariaStore";
import { cycleApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FlaskConical, ArrowRight, TrendingUp, AlertTriangle, Gauge } from "lucide-react";

interface SimulationResult {
    forecast_shift: number;
    conflict_change: number;
    utilisation_delta: number;
    before: { forecast: number; conflicts: number; utilisation: number };
    after: { forecast: number; conflicts: number; utilisation: number };
}

function ComparisonCard({ label, before, after, suffix = "", icon }: {
    label: string;
    before: number;
    after: number;
    suffix?: string;
    icon: React.ReactNode;
}) {
    const delta = after - before;
    const positive = delta >= 0;

    return (
        <div className="glass p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                {icon}
                {label}
            </div>
            <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                    <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Before</div>
                    <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {typeof before === "number" ? before.toFixed(1) : before}{suffix}
                    </div>
                </div>
                <ArrowRight size={16} style={{ color: "#a855f7" }} />
                <div className="flex-1 text-center">
                    <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>After</div>
                    <div className="text-2xl font-bold" style={{ color: positive ? "#10b981" : "#f43f5e" }}>
                        {typeof after === "number" ? after.toFixed(1) : after}{suffix}
                    </div>
                </div>
            </div>
            <div
                className="text-center text-xs font-semibold px-2 py-1 rounded-lg"
                style={{
                    background: positive ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                    color: positive ? "#10b981" : "#f43f5e",
                }}
            >
                {positive ? "+" : ""}{delta.toFixed(1)}{suffix}
            </div>
        </div>
    );
}

const COURSES = ["CS401", "MBA702", "AI-501", "MATH301", "PHY201"];

export function ScenarioSimulator() {
    const t = useTranslations("planning");
    const { setLoading, loadingStates } = useARIAStore();

    const [form, setForm] = useState({
        course: "CS401",
        enrollment_change: 0,
        new_program: false,
        faculty_change: 0,
    });

    const [result, setResult] = useState<SimulationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading("planning", true);
        setError(null);

        try {
            const res = await cycleApi.runCycle({ ...form, simulation: true });
            setResult(res.data as SimulationResult);
        } catch {
            // Use mock result for demo when API is unavailable
            const mockBefore = { forecast: 1240, conflicts: 4, utilisation: 0.62 };
            const factor = 1 + form.enrollment_change / 100;
            setResult({
                forecast_shift: form.enrollment_change,
                conflict_change: form.new_program ? 2 : -1,
                utilisation_delta: form.enrollment_change * 0.005,
                before: mockBefore,
                after: {
                    forecast: Math.round(mockBefore.forecast * factor),
                    conflicts: Math.max(0, mockBefore.conflicts + (form.new_program ? 2 : -1)),
                    utilisation: Math.min(1, mockBefore.utilisation + form.enrollment_change * 0.005),
                },
            });
            setError("API unavailable — showing simulated results.");
        } finally {
            setLoading("planning", false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 space-y-5"
            >
                <div className="flex items-center gap-2 mb-1">
                    <FlaskConical size={18} style={{ color: "#a855f7" }} />
                    <h2 className="font-bold text-base gradient-text">{t("title")}</h2>
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Course */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                            {t("course_label")}
                        </label>
                        <select
                            value={form.course}
                            onChange={(e) => setForm({ ...form, course: e.target.value })}
                            className="glass w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                            style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                            aria-label={t("course_label")}
                        >
                            {COURSES.map((c) => (
                                <option key={c} value={c} style={{ background: "var(--bg-secondary)" }}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Enrollment change */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                            {t("enrollment_label")}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="-50"
                                max="100"
                                value={form.enrollment_change}
                                onChange={(e) => setForm({ ...form, enrollment_change: Number(e.target.value) })}
                                className="flex-1 accent-purple-500"
                                aria-label={t("enrollment_label")}
                            />
                            <span
                                className="w-14 text-right text-sm font-bold"
                                style={{ color: form.enrollment_change >= 0 ? "#10b981" : "#f43f5e" }}
                            >
                                {form.enrollment_change >= 0 ? "+" : ""}{form.enrollment_change}%
                            </span>
                        </div>
                    </div>

                    {/* Faculty change */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                            {t("faculty_label")}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={form.faculty_change}
                                onChange={(e) => setForm({ ...form, faculty_change: Number(e.target.value) })}
                                className="flex-1 accent-purple-500"
                                aria-label={t("faculty_label")}
                            />
                            <span
                                className="w-14 text-right text-sm font-bold"
                                style={{ color: form.faculty_change >= 0 ? "#10b981" : "#f43f5e" }}
                            >
                                {form.faculty_change >= 0 ? "+" : ""}{form.faculty_change}%
                            </span>
                        </div>
                    </div>

                    {/* New program toggle */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                            {t("new_program_label")}
                        </label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, new_program: !form.new_program })}
                            className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${form.new_program
                                    ? "border-purple-500 text-purple-400"
                                    : "border-transparent"
                                }`}
                            style={{
                                background: form.new_program ? "rgba(168,85,247,0.12)" : "var(--bg-card)",
                                color: form.new_program ? "#a855f7" : "var(--text-muted)",
                            }}
                            aria-pressed={form.new_program}
                        >
                            {form.new_program ? "✓ New Program Enabled" : "Enable New Program"}
                        </button>
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={loadingStates.planning}
                            className="w-full py-3 rounded-xl font-semibold text-white gradient-bg hover-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            aria-label={t("run_simulation")}
                        >
                            {loadingStates.planning ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    {t("loading_simulation")}
                                </>
                            ) : (
                                <>
                                    <FlaskConical size={16} />
                                    {t("run_simulation")}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <h3 className="font-bold text-sm gradient-text">{t("results_title")}</h3>
                        {error && (
                            <div className="badge-medium px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                                <AlertTriangle size={12} />
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <ComparisonCard
                                label={t("forecast_shift")}
                                before={result.before.forecast}
                                after={result.after.forecast}
                                icon={<TrendingUp size={14} />}
                            />
                            <ComparisonCard
                                label={t("conflict_change")}
                                before={result.before.conflicts}
                                after={result.after.conflicts}
                                icon={<AlertTriangle size={14} />}
                            />
                            <ComparisonCard
                                label={t("utilisation_delta")}
                                before={result.before.utilisation * 100}
                                after={result.after.utilisation * 100}
                                suffix="%"
                                icon={<Gauge size={14} />}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
