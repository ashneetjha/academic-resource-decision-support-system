"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, Clock, ChevronRight, CheckCircle } from "lucide-react";
import { useARIAStore, Alert } from "@/store/ariaStore";
import { useState } from "react";

type Severity = "low" | "medium" | "high";

const SEVERITY_STYLES: Record<Severity, { badge: string; dot: string; label: string }> = {
    low: { badge: "badge-low", dot: "bg-emerald-400", label: "Low" },
    medium: { badge: "badge-medium", dot: "bg-amber-400", label: "Med" },
    high: { badge: "badge-high", dot: "bg-rose-400 pulse-dot", label: "High" },
};

function AlertModal({ alert, onClose }: { alert: Alert; onClose: () => void }) {
    const styles = SEVERITY_STYLES[alert.severity];
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-label={`Alert details: ${alert.message}`}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="glass-strong w-full max-w-lg p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={18} style={{ color: alert.severity === "high" ? "#f43f5e" : alert.severity === "medium" ? "#f59e0b" : "#10b981" }} />
                        <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                            Alert {alert.id}
                        </h2>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${styles.badge}`}>
                        {styles.label}
                    </span>
                </div>
                <p style={{ color: "var(--text-secondary)" }}>{alert.message}</p>
                {alert.details && (
                    <pre
                        className="glass p-3 text-xs overflow-auto rounded-xl"
                        style={{ color: "var(--text-secondary)", maxHeight: 200 }}
                    >
                        {JSON.stringify(alert.details, null, 2)}
                    </pre>
                )}
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Clock size={12} />
                    {new Date(alert.timestamp).toLocaleString()}
                </div>
                <button
                    className="w-full py-2.5 rounded-xl text-sm font-medium gradient-bg text-white hover-glow transition-all"
                    onClick={onClose}
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
}

export function AlertFeed() {
    const t = useTranslations("dashboard");
    const { alerts, acknowledgeAlert } = useARIAStore();
    const [selected, setSelected] = useState<Alert | null>(null);

    return (
        <>
            <div className="glass p-5 space-y-3 h-full" aria-label="Alert feed">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="font-bold text-base gradient-text">{t("alert_feed_title")}</h2>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Live
                        </span>
                    </div>
                </div>

                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <CheckCircle size={28} style={{ color: "#10b981" }} />
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                            {t("alert_feed_empty")}
                        </span>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        <AnimatePresence>
                            {alerts.map((alert, i) => {
                                const styles = SEVERITY_STYLES[alert.severity];
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`glass px-4 py-3 cursor-pointer hover-glow group flex items-start gap-3 ${alert.acknowledged ? "opacity-60" : ""
                                            }`}
                                        onClick={() => setSelected(alert)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Alert ${alert.id}: ${alert.message} — Severity: ${alert.severity}`}
                                        onKeyDown={(e) => e.key === "Enter" && setSelected(alert)}
                                    >
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${styles.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <span
                                                    className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${styles.badge}`}
                                                >
                                                    {styles.label}
                                                </span>
                                                {alert.course && (
                                                    <span
                                                        className="text-xs font-mono"
                                                        style={{ color: "var(--text-muted)" }}
                                                    >
                                                        {alert.course}
                                                    </span>
                                                )}
                                                {alert.acknowledged && (
                                                    <CheckCircle size={12} style={{ color: "#10b981" }} />
                                                )}
                                            </div>
                                            <p
                                                className="text-sm leading-snug truncate"
                                                style={{ color: "var(--text-secondary)" }}
                                            >
                                                {alert.message}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Clock size={10} style={{ color: "var(--text-muted)" }} />
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#a855f7" }} />
                                            {!alert.acknowledged && (
                                                <button
                                                    className="text-xs px-2 py-0.5 rounded-lg hover:bg-purple-900/20 transition-colors"
                                                    style={{ color: "var(--text-muted)" }}
                                                    onClick={(e) => { e.stopPropagation(); acknowledgeAlert(alert.id); }}
                                                    aria-label={`Acknowledge alert ${alert.id}`}
                                                >
                                                    ACK
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selected && (
                    <AlertModal alert={selected} onClose={() => setSelected(null)} />
                )}
            </AnimatePresence>
        </>
    );
}
