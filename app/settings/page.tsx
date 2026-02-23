"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslations } from "next-intl";
import { useARIAStore } from "@/store/ariaStore";
import { Settings, ShieldCheck, BookOpen, Server, Palette, Globe } from "lucide-react";
import { TrustFooter } from "@/components/TrustFooter";
import { useState } from "react";
import { motion } from "framer-motion";

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5 space-y-4"
        >
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <span style={{ color: "#a855f7" }}>{icon}</span>
                <h2 className="font-bold text-sm gradient-text">{title}</h2>
            </div>
            {children}
        </motion.div>
    );
}

export default function SettingsPage() {
    const t = useTranslations("settings");
    const { preferenceWeights, setPreferenceWeights } = useARIAStore();
    const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // In a real implementation, this would persist via API or env
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 px-4 lg:px-6 py-6 max-w-3xl mx-auto w-full space-y-5">
                    <div className="flex items-center gap-2">
                        <Settings size={22} style={{ color: "#a855f7" }} />
                        <div>
                            <h1 className="text-2xl font-extrabold gradient-text">{t("title")}</h1>
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
                        </div>
                    </div>

                    {/* Appearance */}
                    <SectionCard title={t("appearance_title")} icon={<Palette size={16} />}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                    {t("dark_mode_label")}
                                </div>
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Toggle between dark and light interface themes
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                    </SectionCard>

                    {/* Language */}
                    <SectionCard title={t("language_title")} icon={<Globe size={16} />}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                    {t("language_label")}
                                </div>
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Switch between English and Hindi (हिन्दी)
                                </div>
                            </div>
                            <LanguageToggle />
                        </div>
                    </SectionCard>

                    {/* API Configuration */}
                    <SectionCard title={t("api_title")} icon={<Server size={16} />}>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                {t("api_url_label")}
                            </label>
                            <input
                                type="url"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                placeholder={t("api_url_placeholder")}
                                className="glass w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                                style={{ color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                                aria-label={t("api_url_label")}
                            />
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Set the ARIA backend URL. Restart the frontend to apply changes.
                            </div>
                        </div>
                    </SectionCard>

                    {/* Preference Weights */}
                    <SectionCard title="Preference Weights (ADAPT)" icon={<Settings size={16} />}>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Adjust how ADAPT weights your decision preferences. These are updated automatically via RLHF but can be overridden here.
                        </p>
                        {(Object.keys(preferenceWeights) as Array<keyof typeof preferenceWeights>).map((key) => (
                            <div key={key} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="capitalize font-medium" style={{ color: "var(--text-secondary)" }}>
                                        {key.replace("_", " ")}
                                    </span>
                                    <span className="font-bold" style={{ color: "#a855f7" }}>
                                        {(preferenceWeights[key] * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={preferenceWeights[key]}
                                    onChange={(e) => setPreferenceWeights({ [key]: parseFloat(e.target.value) })}
                                    className="w-full accent-purple-500"
                                    aria-label={`${key} preference weight`}
                                />
                            </div>
                        ))}
                    </SectionCard>

                    {/* Model Card */}
                    <SectionCard title={t("model_card_title")} icon={<BookOpen size={16} />}>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {t("model_card_desc")}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Forecasting", value: "Prophet", color: "#7c3aed" },
                                { label: "Preference", value: "PPO-RLHF", color: "#3b82f6" },
                                { label: "Retrieval", value: "RAG", color: "#10b981" },
                            ].map((m) => (
                                <div key={m.label} className="glass p-3 text-center rounded-xl">
                                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{m.label}</div>
                                    <div className="font-bold text-sm mt-1" style={{ color: m.color }}>{m.value}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Ethics */}
                    <SectionCard title={t("ethics_title")} icon={<ShieldCheck size={16} />}>
                        <div
                            className="px-4 py-3 rounded-xl text-sm leading-relaxed"
                            style={{
                                background: "rgba(16,185,129,0.06)",
                                border: "1px solid rgba(16,185,129,0.2)",
                                color: "var(--text-secondary)",
                            }}
                        >
                            <ShieldCheck size={16} className="inline mr-2" style={{ color: "#10b981" }} />
                            {t("ethics_notice")}
                        </div>
                    </SectionCard>

                    {/* Save Button */}
                    <div className="flex justify-end pb-8">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-xl font-semibold text-white gradient-bg hover-glow transition-all text-sm flex items-center gap-2"
                        >
                            {saved ? "✓ Saved!" : t("save")}
                        </button>
                    </div>
                </main>
                <TrustFooter />
            </div>
        </div>
    );
}
