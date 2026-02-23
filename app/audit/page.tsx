"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ProvenanceGraph } from "@/components/ProvenanceGraph";
import { useTranslations } from "next-intl";
import { GitBranch } from "lucide-react";
import { TrustFooter } from "@/components/TrustFooter";

export default function AuditPage() {
    const t = useTranslations("audit");

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 px-4 lg:px-6 py-6 max-w-6xl mx-auto w-full space-y-4">
                    <div className="flex items-center gap-2">
                        <GitBranch size={22} style={{ color: "#a855f7" }} />
                        <div>
                            <h1 className="text-2xl font-extrabold gradient-text">{t("title")}</h1>
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
                        </div>
                    </div>
                    <ProvenanceGraph />
                </main>
                <TrustFooter />
            </div>
        </div>
    );
}
