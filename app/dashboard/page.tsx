"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { AlertFeed } from "@/components/AlertFeed";
import { ForecastCharts } from "@/components/ForecastCharts";
import { ProposalCards } from "@/components/ProposalCards";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { InstitutionHealthScore } from "@/components/InstitutionHealthScore";
import { AgentTimeline } from "@/components/AgentTimeline";
import { InstitutionalMemoryPanel } from "@/components/InstitutionalMemoryPanel";
import { TrustFooter } from "@/components/TrustFooter";
import { useARIAStore } from "@/store/ariaStore";
import { dashboardApi } from "@/lib/api";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useTranslations } from "next-intl";
import mockData from "@/data/mockData.json";
import type { Alert, ForecastDataPoint, Proposal, Metrics } from "@/store/ariaStore";

export default function DashboardPage() {
    const t = useTranslations("dashboard");
    const {
        setAlerts, setForecasts, setProposals, setMetrics,
        loadingStates, setLoading, executiveModeEnabled,
    } = useARIAStore();

    useEffect(() => {
        const load = async () => {
            setLoading("dashboard", true);
            try {
                const res = await dashboardApi.getData();
                const data = res.data;
                setAlerts(data.alerts);
                setForecasts(data.forecasts);
                setProposals(data.proposals);
                setMetrics(data.metrics);
            } catch {
                setAlerts(mockData.alerts as Alert[]);
                setForecasts(mockData.forecasts as ForecastDataPoint[]);
                setProposals(mockData.proposals as Proposal[]);
                setMetrics(mockData.metrics as Metrics);
            } finally {
                setLoading("dashboard", false);
            }
        };
        load();
    }, [setAlerts, setForecasts, setProposals, setMetrics, setLoading]);

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 px-4 lg:px-6 py-6 max-w-screen-xl mx-auto w-full space-y-6">
                    {/* Page header */}
                    <div>
                        <h1 className="text-2xl font-extrabold gradient-text">{t("title")}</h1>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
                    </div>

                    {/* ── Institution Health Score (always visible) ── */}
                    <InstitutionHealthScore />

                    {/* ── Stats Overview ── */}
                    {loadingStates.dashboard ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <LoadingSkeleton variant="stats" count={5} />
                        </div>
                    ) : (
                        <StatsOverview />
                    )}

                    {/* ── Agent Activity Timeline ── */}
                    {!executiveModeEnabled && <AgentTimeline />}

                    {/* ── Alert + Forecast row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {loadingStates.dashboard ? (
                            <>
                                <LoadingSkeleton variant="alert" count={3} />
                                <LoadingSkeleton variant="chart" count={1} />
                            </>
                        ) : (
                            <>
                                <AlertFeed />
                                <ForecastCharts />
                            </>
                        )}
                    </div>

                    {/* ── Proposals + Feedback row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {loadingStates.dashboard ? (
                            <div className="lg:col-span-2">
                                <LoadingSkeleton variant="proposal" count={2} />
                            </div>
                        ) : (
                            <div className="lg:col-span-2">
                                <ProposalCards />
                            </div>
                        )}
                        {!executiveModeEnabled && <FeedbackPanel />}
                    </div>

                    {/* ── Institutional Memory ── (hidden in executive mode) */}
                    {!executiveModeEnabled && <InstitutionalMemoryPanel />}
                </main>
                <TrustFooter />
            </div>
        </div>
    );
}
