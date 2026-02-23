"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ScenarioSimulator } from "@/components/ScenarioSimulator";
import { useTranslations } from "next-intl";
import { FlaskConical } from "lucide-react";
import { TrustFooter } from "@/components/TrustFooter";

export default function PlanningPage() {
    const t = useTranslations("planning");

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 px-4 lg:px-6 py-6 max-w-4xl mx-auto w-full space-y-4">
                    <div className="flex items-center gap-2">
                        <FlaskConical size={22} style={{ color: "#a855f7" }} />
                        <div>
                            <h1 className="text-2xl font-extrabold gradient-text">{t("title")}</h1>
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
                        </div>
                    </div>
                    <ScenarioSimulator />
                </main>
                <TrustFooter />
            </div>
        </div>
    );
}
