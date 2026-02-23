"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useARIAStore } from "@/store/ariaStore";
import { TrendingUp, Shield, BarChart3, ThumbsUp } from "lucide-react";

function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setValue(target);
                clearInterval(timer);
            } else {
                setValue(Math.round(start * 10) / 10);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

function GaugeArc({ score, size = 140 }: { score: number; size?: number }) {
    const r = size / 2 - 16;
    const cx = size / 2;
    const cy = size / 2;
    const startAngle = -210;
    const endAngle = 30;
    const totalAngle = endAngle - startAngle;
    const angle = startAngle + (totalAngle * score) / 100;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const describeArc = (a1: number, a2: number) => {
        const x1 = cx + r * Math.cos(toRad(a1));
        const y1 = cy + r * Math.sin(toRad(a1));
        const x2 = cx + r * Math.cos(toRad(a2));
        const y2 = cy + r * Math.sin(toRad(a2));
        const largeArc = a2 - a1 > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
    };

    const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";
    const needleX = cx + (r - 8) * Math.cos(toRad(angle));
    const needleY = cy + (r - 8) * Math.sin(toRad(angle));

    return (
        <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
            {/* Track */}
            <path
                d={describeArc(startAngle, endAngle)}
                fill="none"
                stroke="rgba(124,58,237,0.15)"
                strokeWidth={10}
                strokeLinecap="round"
            />
            {/* Fill */}
            <motion.path
                d={describeArc(startAngle, startAngle)}
                fill="none"
                stroke={color}
                strokeWidth={10}
                strokeLinecap="round"
                animate={{ d: describeArc(startAngle, angle) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
            />
            {/* Needle dot */}
            <motion.circle
                cx={needleX}
                cy={needleY}
                r={5}
                fill={color}
                animate={{ cx: needleX, cy: needleY }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
        </svg>
    );
}

const SUB_METRICS = [
    { key: "health_forecast", icon: TrendingUp, color: "#a855f7", field: "forecast_accuracy" as const },
    { key: "health_conflict", icon: Shield, color: "#10b981", field: "conflict_load" as const },
    { key: "health_utilisation", icon: BarChart3, color: "#3b82f6", field: "utilisation_variance" as const },
    { key: "health_acceptance", icon: ThumbsUp, color: "#f59e0b", field: "acceptance_rate" as const },
];

export function InstitutionHealthScore() {
    const t = useTranslations("dashboard");
    const { institutionHealthScore, setInstitutionHealthScore } = useARIAStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            setInstitutionHealthScore({
                overall: 82,
                forecast_accuracy: 87,
                conflict_load: 76,
                utilisation_variance: 81,
                acceptance_rate: 84,
            });
        }
    }, [setInstitutionHealthScore]);

    const score = institutionHealthScore?.overall ?? 0;
    const animatedScore = useCountUp(score);

    if (!institutionHealthScore) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="glass p-5 rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(59,130,246,0.04))" }}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Gauge */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <GaugeArc score={score} size={130} />
                    <div className="text-center -mt-6">
                        <div className="text-3xl font-extrabold gradient-text">{animatedScore}</div>
                        <div className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>/ 100</div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                            <h2 className="font-bold text-base gradient-text">{t("health_score_title")}</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("health_score_subtitle")}</p>
                        </div>
                        <div
                            className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                            style={{
                                background: score >= 80 ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                                color: score >= 80 ? "#10b981" : "#f59e0b",
                                border: `1px solid ${score >= 80 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                            }}
                        >
                            {score >= 80 ? "Healthy" : score >= 60 ? "Fair" : "At Risk"}
                        </div>
                    </div>

                    {/* Sub-metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SUB_METRICS.map(({ key, icon: Icon, color, field }) => {
                            const val = institutionHealthScore[field];
                            return (
                                <div key={field} className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Icon size={12} style={{ color }} />
                                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                                            {t(key as Parameters<typeof t>[0])}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(124,58,237,0.1)" }}>
                                        <motion.div
                                            className="h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${val}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                            style={{ background: color }}
                                        />
                                    </div>
                                    <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{val}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
