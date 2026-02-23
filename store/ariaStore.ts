import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Alert {
    id: string;
    type: string;
    severity: "low" | "medium" | "high";
    message: string;
    course?: string;
    timestamp: string;
    details?: Record<string, unknown>;
    acknowledged?: boolean;
}

export interface ForecastDataPoint {
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
    course?: string;
}

export interface Proposal {
    id: string;
    rank: number;
    resource: string;
    summary: string;
    tradeoff: string;
    predicted_impact: {
        utilisation_delta: number;
        conflict_reduction: number;
        cost_change: number;
    };
    status: "pending" | "accepted" | "rejected" | "modified";
}

export interface ChatMessage {
    id: string;
    role: "admin" | "hermes";
    content: string;
    timestamp: string;
    restricted?: boolean;
    confidence?: number;
    sources?: RAGSource[];
}

export interface RAGSource {
    title: string;
    type: "policy" | "historical" | "benchmark";
    excerpt: string;
    relevance: number;
}

export interface AdminDecision {
    proposal_id: string;
    action: "accept" | "reject" | "modify";
    timestamp: string;
    notes?: string;
}

export interface Metrics {
    active_alerts: number;
    high_severity_alerts: number;
    forecasted_demand_change: number;
    conflict_resolution_rate: number;
    recommendation_acceptance_rate: number;
}

export interface EvaluationMetrics {
    mape: number;
    mape_trend: Array<{ semester: string; aria: number; baseline: number; target: number }>;
    conflict_resolution_rate: number;
    conflict_trend: Array<{ semester: string; aria: number; baseline: number; target: number }>;
    acceptance_rate: number;
    acceptance_trend: Array<{ semester: string; aria: number; singleAgent: number; passive: number; manual: number }>;
    rlhf_alignment_score: number;
    rlhf_trend: Array<{ epoch: string; score: number }>;
    gini_index: number;
    gini_trend: Array<{ semester: string; value: number; target: number }>;
    audit_completeness: number;
    audit_trend: Array<{ semester: string; value: number }>;
}

export interface AgentTimelineEvent {
    id: string;
    agent: "SENTINEL" | "ORACLE" | "ARBITER" | "HERMES" | "ADMIN" | "ADAPT";
    timestamp: string;
    duration_ms: number;
    severity: "low" | "medium" | "high";
    decision_type: string;
    snapshot: Record<string, unknown>;
}

export interface InstitutionalMemoryRecord {
    id: string;
    date: string;
    context: string;
    decision: string;
    outcome: string;
    similarity_score: number;
    agent: string;
}

export interface InstitutionHealthScore {
    overall: number;
    forecast_accuracy: number;
    conflict_load: number;
    utilisation_variance: number;
    acceptance_rate: number;
}

export interface LoadingStates {
    dashboard: boolean;
    chat: boolean;
    planning: boolean;
    feedback: boolean;
    evaluation: boolean;
    governance: boolean;
}

export interface PreferenceWeights {
    utilisation: number;
    cost: number;
    equity: number;
    faculty_satisfaction: number;
}

interface ARIAState {
    // Existing state
    alerts: Alert[];
    forecasts: ForecastDataPoint[];
    proposals: Proposal[];
    chatHistory: ChatMessage[];
    adminDecision: AdminDecision | null;
    metrics: Metrics | null;
    loadingStates: LoadingStates;
    preferenceWeights: PreferenceWeights;
    selectedCourse: string;
    preferenceUpdateDetected: boolean;

    // New state
    selectedCampus: string;
    selectedDepartment: string;
    selectedSemester: string;
    executiveModeEnabled: boolean;
    agentTimeline: AgentTimelineEvent[];
    evaluationMetrics: EvaluationMetrics | null;
    institutionalMemory: InstitutionalMemoryRecord[];
    institutionHealthScore: InstitutionHealthScore | null;
    activeSystemComparison: "aria" | "singleAgent" | "passive" | "manual";

    // Existing actions
    setAlerts: (alerts: Alert[]) => void;
    setForecasts: (forecasts: ForecastDataPoint[]) => void;
    setProposals: (proposals: Proposal[]) => void;
    addChatMessage: (message: ChatMessage) => void;
    clearChat: () => void;
    setAdminDecision: (decision: AdminDecision | null) => void;
    setMetrics: (metrics: Metrics) => void;
    setLoading: (key: keyof LoadingStates, value: boolean) => void;
    setPreferenceWeights: (weights: Partial<PreferenceWeights>) => void;
    setSelectedCourse: (course: string) => void;
    setPreferenceUpdateDetected: (detected: boolean) => void;
    updateProposalStatus: (id: string, status: Proposal["status"]) => void;
    acknowledgeAlert: (id: string) => void;

    // New actions
    setSelectedCampus: (campus: string) => void;
    setSelectedDepartment: (department: string) => void;
    setSelectedSemester: (semester: string) => void;
    setExecutiveModeEnabled: (enabled: boolean) => void;
    setAgentTimeline: (events: AgentTimelineEvent[]) => void;
    addAgentTimelineEvent: (event: AgentTimelineEvent) => void;
    setEvaluationMetrics: (metrics: EvaluationMetrics) => void;
    setInstitutionalMemory: (records: InstitutionalMemoryRecord[]) => void;
    setInstitutionHealthScore: (score: InstitutionHealthScore) => void;
    setActiveSystemComparison: (mode: ARIAState["activeSystemComparison"]) => void;
}

export const useARIAStore = create<ARIAState>()(
    persist(
        (set) => ({
            // Existing initial state
            alerts: [],
            forecasts: [],
            proposals: [],
            chatHistory: [],
            adminDecision: null,
            metrics: null,
            selectedCourse: "ALL",
            preferenceUpdateDetected: false,
            loadingStates: {
                dashboard: false,
                chat: false,
                planning: false,
                feedback: false,
                evaluation: false,
                governance: false,
            },
            preferenceWeights: {
                utilisation: 0.4,
                cost: 0.3,
                equity: 0.2,
                faculty_satisfaction: 0.1,
            },

            // New initial state
            selectedCampus: "Main Campus",
            selectedDepartment: "All Departments",
            selectedSemester: "Spring 2026",
            executiveModeEnabled: false,
            agentTimeline: [],
            evaluationMetrics: null,
            institutionalMemory: [],
            institutionHealthScore: null,
            activeSystemComparison: "aria",

            // Existing actions
            setAlerts: (alerts) => set({ alerts }),
            setForecasts: (forecasts) => set({ forecasts }),
            setProposals: (proposals) => set({ proposals }),
            addChatMessage: (message) =>
                set((state) => ({ chatHistory: [...state.chatHistory, message] })),
            clearChat: () => set({ chatHistory: [] }),
            setAdminDecision: (adminDecision) => set({ adminDecision }),
            setMetrics: (metrics) => set({ metrics }),
            setLoading: (key, value) =>
                set((state) => ({
                    loadingStates: { ...state.loadingStates, [key]: value },
                })),
            setPreferenceWeights: (weights) =>
                set((state) => ({
                    preferenceWeights: { ...state.preferenceWeights, ...weights },
                })),
            setSelectedCourse: (selectedCourse) => set({ selectedCourse }),
            setPreferenceUpdateDetected: (preferenceUpdateDetected) =>
                set({ preferenceUpdateDetected }),
            updateProposalStatus: (id, status) =>
                set((state) => ({
                    proposals: state.proposals.map((p) =>
                        p.id === id ? { ...p, status } : p
                    ),
                })),
            acknowledgeAlert: (id) =>
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.id === id ? { ...a, acknowledged: true } : a
                    ),
                })),

            // New actions
            setSelectedCampus: (selectedCampus) => set({ selectedCampus }),
            setSelectedDepartment: (selectedDepartment) => set({ selectedDepartment }),
            setSelectedSemester: (selectedSemester) => set({ selectedSemester }),
            setExecutiveModeEnabled: (executiveModeEnabled) => set({ executiveModeEnabled }),
            setAgentTimeline: (agentTimeline) => set({ agentTimeline }),
            addAgentTimelineEvent: (event) =>
                set((state) => ({ agentTimeline: [...state.agentTimeline, event] })),
            setEvaluationMetrics: (evaluationMetrics) => set({ evaluationMetrics }),
            setInstitutionalMemory: (institutionalMemory) => set({ institutionalMemory }),
            setInstitutionHealthScore: (institutionHealthScore) => set({ institutionHealthScore }),
            setActiveSystemComparison: (activeSystemComparison) => set({ activeSystemComparison }),
        }),
        {
            name: "aria-store",
            partialize: (state) => ({
                preferenceWeights: state.preferenceWeights,
                chatHistory: state.chatHistory,
                adminDecision: state.adminDecision,
                selectedCampus: state.selectedCampus,
                selectedDepartment: state.selectedDepartment,
                selectedSemester: state.selectedSemester,
                executiveModeEnabled: state.executiveModeEnabled,
            }),
        }
    )
);
