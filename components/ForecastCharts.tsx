"use client";

import { useTranslations } from "next-intl";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useARIAStore } from "@/store/ariaStore";
import { CHART_COLORS } from "@/lib/constants";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const COURSES = ["CS401", "MBA702"];

function CustomTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { value: number; name: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-strong px-3 py-2 text-xs space-y-1">
            <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{label}</div>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span>{p.name}:</span>
                    <span className="font-semibold" style={{ color: "#a855f7" }}>{Math.round(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

export function ForecastCharts() {
    const t = useTranslations("dashboard");
    const { forecasts, selectedCourse, setSelectedCourse } = useARIAStore();

    const filtered = forecasts.filter(
        (f) => selectedCourse === "ALL" || f.course === selectedCourse
    );

    const chartData = filtered.map((f) => ({
        date: new Date(f.ds).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        forecast: Math.round(f.yhat),
        upper: Math.round(f.yhat_upper),
        lower: Math.round(f.yhat_lower),
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="glass p-5 space-y-4"
        >
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <TrendingUp size={18} style={{ color: "#a855f7" }} />
                    <h2 className="font-bold text-base gradient-text">{t("forecast_title")}</h2>
                </div>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="glass px-3 py-1.5 text-sm rounded-xl outline-none cursor-pointer"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                    aria-label="Select course for forecast"
                >
                    {COURSES.map((c) => (
                        <option key={c} value={c} style={{ background: "var(--bg-secondary)" }}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-sm" style={{ color: "var(--text-muted)" }}>
                    No forecast data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradUpper" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.08} />
                                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }} />
                        <Area
                            type="monotone"
                            dataKey="upper"
                            stroke="none"
                            fill={CHART_COLORS.upper}
                            fillOpacity={1}
                            name="Upper bound"
                            legendType="none"
                        />
                        <Area
                            type="monotone"
                            dataKey="lower"
                            stroke="none"
                            fill="transparent"
                            name="Lower bound"
                            legendType="none"
                        />
                        <Area
                            type="monotone"
                            dataKey="forecast"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={2.5}
                            fill="url(#gradForecast)"
                            dot={false}
                            name="Forecast (yhat)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </motion.div>
    );
}
