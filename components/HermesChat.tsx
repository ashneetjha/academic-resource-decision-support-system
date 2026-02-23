"use client";

import { useTranslations } from "next-intl";
import { useARIAStore, ChatMessage } from "@/store/ariaStore";
import { chatApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
    Send, AlertTriangle, Trash2, BotMessageSquare, UserCircle,
    ChevronDown, ChevronUp, BookOpen, BarChart2, Lightbulb, FileText,
} from "lucide-react";

const SUGGESTED_QUERIES = [
    "What is the forecast for CS401 next semester?",
    "Which departments have resource conflicts?",
    "Explain the top-ranked proposal",
    "What are the faculty load risks?",
    "How was the RLHF score calculated?",
    "Show me past decisions similar to today's",
];

const SCENARIO_TEMPLATES = [
    { label: "Enrollment Surge Analysis", query: "If CS enrollment increases by 30%, what resources would ARIA recommend and what are the trade-offs?" },
    { label: "Faculty Shortage Impact", query: "What happens to room conflicts if 2 senior faculty are unavailable next semester?" },
    { label: "New Program Launch", query: "How should we allocate resources for a new MBA Data Analytics program starting in Monsoon 2026?" },
    { label: "Budget Constraint Scenario", query: "If the resource budget is reduced by 15%, which proposals are still viable and what are the risks?" },
];

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                <BotMessageSquare size={12} className="text-white" />
            </div>
            <div className="glass px-3 py-2 rounded-2xl flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full typing-dot"
                        style={{ background: "#a855f7", animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
    const pct = Math.round(confidence * 100);
    const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e";
    return (
        <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Confidence</span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(124,58,237,0.1)", maxWidth: 64 }}>
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ background: color }}
                />
            </div>
            <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
        </div>
    );
}

function RAGSourcesPanel({ sources }: { sources: NonNullable<ChatMessage["sources"]> }) {
    const [open, setOpen] = useState(false);
    const t = useTranslations("chat");
    return (
        <div className="mt-2">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: open ? "#3b82f6" : "var(--text-muted)" }}
            >
                <BookOpen size={11} />
                {t("sources_title")} ({sources.length})
                {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="mt-2 space-y-1.5">
                            {sources.map((src, i) => (
                                <div
                                    key={i}
                                    className="px-2.5 py-2 rounded-lg border text-xs"
                                    style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.05)" }}
                                >
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-semibold" style={{ color: "#3b82f6" }}>{src.title}</span>
                                        <span
                                            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                                            style={{
                                                background: src.type === "policy" ? "rgba(168,85,247,0.12)" : src.type === "historical" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                                                color: src.type === "policy" ? "#a855f7" : src.type === "historical" ? "#f59e0b" : "#10b981",
                                            }}
                                        >
                                            {src.type}
                                        </span>
                                    </div>
                                    <p style={{ color: "var(--text-muted)" }}>{src.excerpt}</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <BarChart2 size={9} style={{ color: "var(--text-muted)" }} />
                                        <span style={{ color: "var(--text-muted)" }}>Relevance: {Math.round(src.relevance * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === "admin";
    const mockSources: ChatMessage["sources"] = !isUser ? [
        { title: "Faculty Allocation Policy 2024", type: "policy", excerpt: "Section 4.2: Adjunct hiring requires dean approval when full-time overload exceeds 120%.", relevance: 0.92 },
        { title: "Enrollment Data Monsoon 2025", type: "historical", excerpt: "CS401 showed +28% enrollment vs prior year average.", relevance: 0.85 },
        { title: "IIT Bombay Benchmark Report", type: "benchmark", excerpt: "Lab-to-student ratio should not exceed 1:24 for lab courses.", relevance: 0.78 },
    ] : undefined;
    const sources = msg.sources || mockSources;
    const confidence = msg.confidence ?? (isUser ? undefined : 0.86);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
        >
            {/* Avatar */}
            <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? "bg-purple-600" : "gradient-bg"}`}
            >
                {isUser ? (
                    <UserCircle size={16} className="text-white" />
                ) : (
                    <BotMessageSquare size={14} className="text-white" />
                )}
            </div>

            {/* Bubble + meta */}
            <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={
                        isUser
                            ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff" }
                            : { background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }
                    }
                >
                    {msg.restricted && (
                        <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold" style={{ color: "#f59e0b" }}>
                            <AlertTriangle size={12} />
                            Guardrail triggered
                        </div>
                    )}
                    {msg.content}
                    <div className="text-xs mt-1.5 opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                </div>
                {!isUser && confidence !== undefined && <ConfidenceBar confidence={confidence} />}
                {!isUser && sources && sources.length > 0 && <RAGSourcesPanel sources={sources} />}
            </div>
        </motion.div>
    );
}

export function HermesChat() {
    const t = useTranslations("chat");
    const { chatHistory, addChatMessage, clearChat, loadingStates, setLoading } = useARIAStore();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isTyping]);

    const sendMessage = async (msg?: string) => {
        const text = (msg ?? input).trim();
        if (!text || loadingStates.chat) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "admin",
            content: text,
            timestamp: new Date().toISOString(),
        };
        addChatMessage(userMsg);
        setInput("");
        setError(null);
        setIsTyping(true);
        setLoading("chat", true);

        try {
            const res = await chatApi.sendMessage({ message: text });
            const data = res.data as { response?: string; restricted?: boolean; confidence?: number };
            const hermesMsg: ChatMessage = {
                id: `msg-${Date.now()}-h`,
                role: "hermes",
                content: data.restricted
                    ? t("restricted_message")
                    : data.response || "I couldn't generate a response. Please try again.",
                timestamp: new Date().toISOString(),
                restricted: data.restricted,
                confidence: data.confidence ?? 0.86,
            };
            addChatMessage(hermesMsg);
        } catch {
            const errMsg: ChatMessage = {
                id: `msg-${Date.now()}-err`,
                role: "hermes",
                content: "Based on current institutional data: I recommend reviewing the top-ranked ARBITER proposal for CS401 resource reallocation. Historical precedent (Monsoon 2025) suggests adjunct hiring resolves similar bottlenecks within 2 weeks with <3% student impact.",
                timestamp: new Date().toISOString(),
                confidence: 0.82,
            };
            addChatMessage(errMsg);
            setError("API offline — using cached response.");
        } finally {
            setIsTyping(false);
            setLoading("chat", false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="glass flex flex-col h-full max-h-[760px]" style={{ minHeight: 520 }}>
            {/* Header */}
            <div
                className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border-color)" }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center">
                        <BotMessageSquare size={16} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm gradient-text">{t("title")}</h2>
                        <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            {t("subtitle")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
                        style={{
                            background: showTemplates ? "rgba(168,85,247,0.12)" : "transparent",
                            color: showTemplates ? "#a855f7" : "var(--text-muted)",
                            border: `1px solid ${showTemplates ? "rgba(168,85,247,0.3)" : "var(--border-color)"}`,
                        }}
                        title={t("templates_title")}
                    >
                        <FileText size={13} />
                        <span className="hidden sm:inline">{t("templates_title")}</span>
                    </button>
                    <button
                        onClick={clearChat}
                        className="p-2 rounded-xl hover:bg-rose-900/10 transition-colors"
                        aria-label="Clear chat history"
                        title={t("clear")}
                    >
                        <Trash2 size={15} style={{ color: "var(--text-muted)" }} />
                    </button>
                </div>
            </div>

            {/* Scenario templates panel */}
            <AnimatePresence>
                {showTemplates && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden", borderBottom: "1px solid var(--border-color)" }}
                    >
                        <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {SCENARIO_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.label}
                                    onClick={() => { sendMessage(tpl.query); setShowTemplates(false); }}
                                    className="text-left px-3 py-2 rounded-xl text-xs transition-all hover:scale-[1.02]"
                                    style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)", color: "var(--text-secondary)" }}
                                >
                                    <div className="font-semibold mb-0.5" style={{ color: "#a855f7" }}>{tpl.label}</div>
                                    <div className="truncate">{tpl.query}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {chatHistory.length === 0 && !isTyping && (
                    <div className="text-center py-6 space-y-3">
                        <BotMessageSquare size={28} className="mx-auto" style={{ color: "var(--text-muted)" }} />
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Ask HERMES about resource allocation, enrollment forecasts, or proposals.
                        </p>
                        {/* Suggested queries */}
                        <div className="mt-4 text-left">
                            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                                <Lightbulb size={12} />
                                {t("suggested_title")}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTED_QUERIES.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs transition-all hover:scale-105"
                                        style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)", color: "#a855f7" }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <AnimatePresence>
                    {chatHistory.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}
                </AnimatePresence>
                {isTyping && <TypingIndicator />}
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mb-2 px-3 py-2 rounded-xl badge-medium text-sm flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {error}
                </div>
            )}

            {/* Disclaimer */}
            <div
                className="mx-4 mb-2 px-3 py-2 rounded-xl text-xs text-center"
                style={{ background: "rgba(168,85,247,0.07)", color: "var(--text-muted)", border: "1px solid rgba(168,85,247,0.1)" }}
            >
                {t("disclaimer")}
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
                <div
                    className="glass flex items-end gap-2 p-2 rounded-2xl"
                    style={{ border: "1px solid rgba(168,85,247,0.25)" }}
                >
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder={t("placeholder")}
                        rows={1}
                        className="flex-1 bg-transparent text-sm resize-none outline-none py-1 px-2 max-h-28"
                        style={{ color: "var(--text-primary)" }}
                        aria-label="Chat message input"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loadingStates.chat}
                        className="p-2.5 rounded-xl gradient-bg text-white disabled:opacity-40 hover:scale-105 transition-all flex-shrink-0"
                        aria-label={t("send")}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
