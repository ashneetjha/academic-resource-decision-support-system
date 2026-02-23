"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
    LayoutDashboard,
    FlaskConical,
    MessageCircle,
    GitBranch,
    Settings,
    ChevronRight,
    BrainCircuit,
    Network,
    BarChart2,
    Shield,
    Menu,
    X,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

const WORKSPACE_NAV = [
    { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/planning", key: "nav.planning", icon: FlaskConical },
    { href: "/chat", key: "nav.chat", icon: MessageCircle },
    { href: "/audit", key: "nav.audit", icon: GitBranch },
    { href: "/settings", key: "nav.settings", icon: Settings },
];

const RESEARCH_NAV = [
    { href: "/system", key: "nav.system", icon: Network },
    { href: "/evaluation", key: "nav.evaluation", icon: BarChart2 },
    { href: "/governance", key: "nav.governance", icon: Shield },
];

function NavSection({
    label,
    items,
    pathname,
    t,
    onClose,
}: {
    label: string;
    items: typeof WORKSPACE_NAV;
    pathname: string;
    t: (k: string) => string;
    onClose?: () => void;
}) {
    return (
        <div className="mb-2">
            <div
                className="text-xs font-semibold uppercase tracking-widest px-2 mb-1.5 mt-3"
                style={{ color: "var(--text-muted)" }}
            >
                {label}
            </div>
            {items.map(({ href, key, icon: Icon }) => {
                const isActive = pathname === href || pathname?.startsWith(href + "/");
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`nav-item ${isActive ? "active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={onClose}
                    >
                        <Icon size={17} />
                        <span>{t(key)}</span>
                        {isActive && (
                            <ChevronRight size={13} className="ml-auto" style={{ color: "#a855f7" }} />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const t = useTranslations();
    const pathname = usePathname();
    return (
        <>
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-5 py-5 border-b"
                style={{ borderColor: "var(--border-color)" }}
            >
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                    <BrainCircuit size={20} className="text-white" />
                </div>
                <div>
                    <div className="font-bold text-base tracking-wide gradient-text">ARIA</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Academic AI System
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-auto p-1.5 rounded-lg lg:hidden"
                        style={{ color: "var(--text-muted)" }}
                        aria-label="Close menu"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto" role="navigation">
                <NavSection
                    label="Workspace"
                    items={WORKSPACE_NAV}
                    pathname={pathname}
                    t={t as (k: string) => string}
                    onClose={onClose}
                />
                <NavSection
                    label="Research & Governance"
                    items={RESEARCH_NAV}
                    pathname={pathname}
                    t={t as (k: string) => string}
                    onClose={onClose}
                />
            </nav>

            {/* Bottom */}
            <div
                className="px-3 py-4 border-t space-y-2"
                style={{ borderColor: "var(--border-color)" }}
            >
                <div className="glass px-3 py-2.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        All agents online
                    </span>
                </div>
                <div className="flex items-center gap-2 px-1">
                    <ThemeToggle compact />
                    <LanguageToggle compact />
                </div>
                <div className="px-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    ARIA v1.0 · <span className="gradient-text font-medium">Research Preview</span>
                </div>
            </div>
        </>
    );
}

export function Sidebar() {
    return (
        <aside
            className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0"
            style={{
                background: "var(--bg-card)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRight: "1px solid var(--border-color)",
            }}
            aria-label="Main navigation"
        >
            <SidebarContent />
        </aside>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                className="lg:hidden p-2 rounded-xl transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
            >
                <Menu size={20} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                            onClick={() => setOpen(false)}
                        />
                        {/* Drawer */}
                        <motion.aside
                            key="drawer"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 lg:hidden overflow-y-auto"
                            style={{
                                background: "var(--bg-card)",
                                backdropFilter: "blur(20px)",
                                borderRight: "1px solid var(--border-color)",
                            }}
                            aria-label="Mobile navigation"
                        >
                            <SidebarContent onClose={() => setOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
