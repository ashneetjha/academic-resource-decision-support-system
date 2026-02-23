"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, BrainCircuit, Layers, Users, GitBranch, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

const FEATURES = [
  {
    icon: Layers,
    titleKey: "landing.feature_agents_title",
    descKey: "landing.feature_agents_desc",
    color: "#a855f7",
    gradient: "rgba(168,85,247,0.08)",
  },
  {
    icon: Users,
    titleKey: "landing.feature_rlhf_title",
    descKey: "landing.feature_rlhf_desc",
    color: "#3b82f6",
    gradient: "rgba(59,130,246,0.08)",
  },
  {
    icon: MessageSquare,
    titleKey: "landing.feature_rag_title",
    descKey: "landing.feature_rag_desc",
    color: "#10b981",
    gradient: "rgba(16,185,129,0.08)",
  },
  {
    icon: GitBranch,
    titleKey: "landing.feature_provenance_title",
    descKey: "landing.feature_provenance_desc",
    color: "#f59e0b",
    gradient: "rgba(245,158,11,0.08)",
  },
];

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Animated background blobs */}
      <div
        className="blob absolute -top-40 -left-40 w-96 h-96 opacity-30 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
      />
      <div
        className="blob-2 absolute -bottom-32 -right-32 w-80 h-80 opacity-20 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)" }}
      />
      <div
        className="blob absolute top-1/2 right-1/4 w-64 h-64 opacity-10 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", animationDelay: "3s" }}
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <BrainCircuit size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-lg gradient-text">ARIA</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white hover-glow transition-all"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.25)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 pulse-dot" />
            Research Preview · Multi-Agent AI System
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
            <span className="gradient-text">{t("landing.hero_title")}</span>
            <br />
            <span style={{ color: "var(--text-primary)" }} className="opacity-80 text-4xl sm:text-5xl">
              {t("landing.hero_subtitle")}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {t("landing.hero_description")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-white gradient-bg hover-glow transition-all text-base"
            >
              {t("landing.hero_cta")}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-7 py-3.5 rounded-2xl font-semibold text-sm glass hover-glow transition-all"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("landing.hero_learn")}
            </Link>
          </div>
        </motion.div>

        {/* Hero visual — agent pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="glass-strong p-6 rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {["ORACLE", "ARBITER", "HERMES", "ADAPT"].map((agent, i) => (
                <motion.div
                  key={agent}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="text-center flex-1 min-w-[80px]"
                >
                  <div
                    className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background: [`#7c3aed`, `#3b82f6`, `#10b981`, `#f59e0b`][i],
                    }}
                  >
                    {agent[0]}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{agent}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {["Forecast", "Resolve", "Dialogue", "Adapt"][i]}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-px flex-1" style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }} />
              ))}
            </div>
            <div className="mt-3 text-center text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Autonomous multi-agent orchestration pipeline
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            Built for <span className="gradient-text">research-grade</span> decisions
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
            Every component designed for academic resource governance at scale
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, titleKey, descKey, color, gradient }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 space-y-3 hover-glow group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: gradient }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                {t(titleKey)}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-white gradient-bg hover-glow transition-all text-base"
          >
            {t("landing.hero_cta")}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
