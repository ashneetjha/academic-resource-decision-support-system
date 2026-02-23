"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Bell, X, ChevronDown, Presentation } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { MobileSidebar } from "./Sidebar";
import { useARIAStore } from "@/store/ariaStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CAMPUSES = ["Main Campus", "North Campus", "South Campus", "Online"];
const DEPARTMENTS = ["All Departments", "Computer Science", "Engineering", "MBA", "Sciences", "Humanities"];
const SEMESTERS = ["Spring 2026", "Monsoon 2025", "Winter 2025", "Spring 2025"];

function ContextDropdown({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                    background: open ? "rgba(168,85,247,0.12)" : "transparent",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                }}
            >
                <span className="hidden sm:inline" style={{ color: "var(--text-muted)" }}>{label}:</span>
                <span style={{ color: "var(--text-primary)" }} className="max-w-[80px] truncate">{value}</span>
                <ChevronDown size={11} style={{ color: "var(--text-muted)" }} />
            </button>
            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 2, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1.5 z-40 min-w-[160px] py-1 rounded-xl shadow-xl"
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { onChange(opt); setOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                                    style={{
                                        color: opt === value ? "#a855f7" : "var(--text-secondary)",
                                        background: opt === value ? "rgba(168,85,247,0.08)" : "transparent",
                                        fontWeight: opt === value ? 600 : 400,
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export function Navbar() {
    const t = useTranslations();
    const pathname = usePathname();
    const {
        alerts,
        selectedCampus, setSelectedCampus,
        selectedDepartment, setSelectedDepartment,
        selectedSemester, setSelectedSemester,
        executiveModeEnabled, setExecutiveModeEnabled,
    } = useARIAStore();
    const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

    const isInsideDashboard = ["/dashboard", "/planning", "/chat", "/audit", "/settings", "/system", "/evaluation", "/governance"].some(
        (p) => pathname === p || pathname?.startsWith(p + "/")
    );

    return (
        <header
            className="sticky top-0 z-40 w-full"
            style={{
                background: "var(--bg-card)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: "1px solid var(--border-color)",
            }}
        >
            <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
                {/* Mobile sidebar trigger */}
                <MobileSidebar />

                {/* Logo (shown on mobile) */}
                <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="ARIA Home">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                    >
                        <BrainCircuit size={15} className="text-white" />
                    </div>
                    <span className="font-bold text-sm gradient-text">ARIA</span>
                </Link>

                {/* Context selectors — only on dashboard pages */}
                {isInsideDashboard && (
                    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-1 min-w-0">
                        <ContextDropdown
                            label={t("common.campus")}
                            value={selectedCampus}
                            options={CAMPUSES}
                            onChange={setSelectedCampus}
                        />
                        <ContextDropdown
                            label={t("common.department")}
                            value={selectedDepartment}
                            options={DEPARTMENTS}
                            onChange={setSelectedDepartment}
                        />
                        <ContextDropdown
                            label={t("common.semester")}
                            value={selectedSemester}
                            options={SEMESTERS}
                            onChange={setSelectedSemester}
                        />
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Executive Mode Toggle */}
                {isInsideDashboard && (
                    <button
                        onClick={() => setExecutiveModeEnabled(!executiveModeEnabled)}
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                            background: executiveModeEnabled ? "rgba(168,85,247,0.15)" : "transparent",
                            border: `1px solid ${executiveModeEnabled ? "rgba(168,85,247,0.4)" : "var(--border-color)"}`,
                            color: executiveModeEnabled ? "#a855f7" : "var(--text-muted)",
                        }}
                        aria-label="Toggle Executive Mode"
                        title={t("common.executive_mode")}
                    >
                        <Presentation size={13} />
                        <span className="hidden md:inline">{t("common.executive_mode")}</span>
                        {executiveModeEnabled && <X size={11} />}
                    </button>
                )}

                {/* Alerts */}
                <button
                    className="relative p-2 rounded-xl transition-all hover:bg-purple-900/20 flex-shrink-0"
                    aria-label={`Notifications — ${unreadAlerts} unread`}
                >
                    <Bell size={17} style={{ color: "var(--text-secondary)" }} />
                    {unreadAlerts > 0 && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                            {unreadAlerts > 9 ? "9+" : unreadAlerts}
                        </span>
                    )}
                </button>

                <ThemeToggle />
                <LanguageToggle />
            </div>
        </header>
    );
}
