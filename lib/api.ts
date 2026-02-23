import axios, { AxiosError, AxiosResponse } from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("aria_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Handle unauthorized
            console.error("[ARIA] Unauthorized — token may be invalid");
        }
        if (error.response?.status === 503) {
            console.error("[ARIA] Service unavailable — backend may be down");
        }
        return Promise.reject(error);
    }
);

// API methods
export const dashboardApi = {
    getData: () => api.get("/api/dashboard"),
};

export const chatApi = {
    sendMessage: (payload: { message: string; session_id?: string }) =>
        api.post("/api/chat", payload),
};

export const cycleApi = {
    runCycle: (payload: {
        course?: string;
        enrollment_change?: number;
        new_program?: boolean;
        faculty_change?: number;
        simulation?: boolean;
    }) => api.post("/api/run-cycle", payload),
};

export const feedbackApi = {
    submit: (payload: {
        proposal_id: string;
        action: "accept" | "reject" | "modify";
        modifications?: Record<string, unknown>;
    }) => api.post("/api/feedback", payload),
};

export default api;
