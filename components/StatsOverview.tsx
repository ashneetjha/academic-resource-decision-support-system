"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, TrendingUp, CheckCheck, Shield } from "lucide-react";
import { useARIAStore } from "@/store/ariaStore";
import { useEffect, useRef, useState } from "react";

function CountUp({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
    const [val, setVal] = useState(0);
    const frameRef = useRef<number>(0);
    const startTime = useRef<number>(0);

    useEffect(() => {
        const duration = 1400;
        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(eased * target);
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target]);

    return (
        <span>
            {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}
            {suffix}
        </span>
    );
}

interface StatCardProps {
    label: string;
    value: number;
    suffix?: string;
    decimals?: number;
    icon: React.ReactNode;
    color: string;
    delay?: number;
}

function StatCard({ label, value, suffix, decimals, icon, color, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="glass p-5 hover-glow"
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: color + "20" }}
                >
                    <span style={{ color }}>{icon}</span>
                </div>
            </div>
            <div
                className="text-3xl font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
            >
                <CountUp target={value} suffix={suffix} decimals={decimals} />
            </div>
            <div
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
            >
                {label}
            </div>
        </motion.div>
    );
}

export function StatsOverview() {
    const t = useTranslations("dashboard");
    const { metrics } = useARIAStore();

    const stats = [
        {
            label: t("active_alerts"),
            value: metrics?.active_alerts ?? 0,
            icon: <AlertTriangle size={18} />,
            color: "#f43f5e",
        },
        {
            label: t("high_severity"),
            value: metrics?.high_severity_alerts ?? 0,
            icon: <Shield size={18} />,
            color: "#f59e0b",
        },
        {
            label: t("demand_change"),
            value: metrics?.forecasted_demand_change ?? 0,
            suffix: "%",
            decimals: 1,
            icon: <TrendingUp size={18} />,
            color: "#a855f7",
        },
        {
            label: t("conflict_rate"),
            value: (metrics?.conflict_resolution_rate ?? 0) * 100,
            suffix: "%",
            decimals: 0,
            icon: <CheckCheck size={18} />,
            color: "#10b981",
        },
        {
            label: t("acceptance_rate"),
            value: (metrics?.recommendation_acceptance_rate ?? 0) * 100,
            suffix: "%",
            decimals: 0,
            icon: <CheckCheck size={18} />,
            color: "#3b82f6",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((stat, i) => (
                <StatCard key={stat.label} {...stat} delay={i * 0.08} />
            ))}
        </div>
    );
}
