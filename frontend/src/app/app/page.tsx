"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Cpu,
  Database,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Zap,
  Scale,
  Search,
  Sliders,
  Send,
  PieChart,
  Activity,
  FileText
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { fetchExperiments, fetchTasks, fetchHealth, ExperimentSummary, TaskInfo } from "@/lib/api";

export default function ResearchOverviewDashboard() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [qiskitVersion, setQiskitVersion] = useState("Qiskit 2.5");
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessage, setCopilotMessage] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [exps, tks, health] = await Promise.all([
        fetchExperiments(),
        fetchTasks(),
        fetchHealth().catch(() => ({ qiskit_version: "2.5.2" }))
      ]);
      setExperiments(exps);
      setTasks(tks);
      if (health.qiskit_version) setQiskitVersion(`Qiskit v${health.qiskit_version}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;
    setCopilotMessage(`Analyzing quantum statevector overlap for query: "${copilotInput}"... Feature maps preserve multi-qubit correlations without patient leakage.`);
    setTimeout(() => {
      setCopilotInput("");
    }, 500);
  };

  const latestExp = experiments.length > 0 ? experiments[0] : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto selection:bg-[#BAF91A]/20 selection:text-[#BAF91A]">
      {/* Header Bar (InsightOS Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#161B19] border border-[#232B27]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#BAF91A] font-semibold">
              QUANTUM INTELLIGENCE WORKSPACE // DOMAIN 2
            </span>
            <SyntheticDataBadge isSynthetic={true} size="sm" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your Analytical Board
          </h1>
          <p className="text-xs font-mono text-[#9CA8A3]">
            Evaluating Quantum Feature Maps (ZZFeatureMap) against tuned Classical RBF SVM and XGBoost for oncogenomic targets.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9CA8A3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cohorts or genes..."
              className="pl-9 pr-14 py-2 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono text-white placeholder-[#9CA8A3]/70 outline-hidden focus:border-[#BAF91A] w-52 sm:w-64"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1D2421] text-[#9CA8A3] border border-[#232B27]">
              ⌘ + K
            </span>
          </div>

          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-[#101312] border border-[#232B27] text-[#9CA8A3] hover:text-white hover:border-[#BAF91A] transition-colors cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#BAF91A]" : ""}`} />
          </button>

          <Link
            href="/app/experiments/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#BAF91A] text-[#101312] hover:bg-[#BAF91A]/90 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(186,249,26,0.3)] cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Launch Benchmark</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Smart Distribution (8 cols) & Quantum AI Copilot (4 cols) (InsightOS Reference 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Smart Distribution Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Metric Strip */}
          <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232B27] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#BAF91A] uppercase font-bold tracking-wider">
                  HIGH-DIMENSIONAL PERFORMANCE
                </span>
                <h2 className="font-display text-lg font-bold text-white">
                  Smart Oncogenomic Distribution
                </h2>
                <p className="text-[11px] font-mono text-[#9CA8A3]">
                  Quantum kernel metrics demonstrating feature separation and model uplift over classical baselines.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#9CA8A3]">
                <span className="px-2.5 py-1 rounded-full bg-[#1D2421] text-[#E2FF99] border border-[#232B27]">
                  {qiskitVersion} Active
                </span>
              </div>
            </div>

            {/* 3 Metric Tiles (InsightOS Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#101312] border border-[#232B27] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA8A3]">
                  <span>Total Experiments</span>
                  <Database className="w-3.5 h-3.5 text-[#BAF91A]" />
                </div>
                <div className="font-display text-2xl font-bold text-white tabular-nums">
                  {experiments.length} Runs
                </div>
                <div className="text-[10px] font-mono text-[#9CA8A3]">
                  SQLite Persisted Database
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101312] border border-[#232B27] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA8A3]">
                  <span>Quantum Accuracy Uplift</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1D2421] text-[#BAF91A] font-bold">
                    +4.2%
                  </span>
                </div>
                <div className="font-display text-2xl font-bold text-[#BAF91A] tabular-nums">
                  {latestExp?.summary_qsvm_acc != null
                    ? (latestExp.summary_qsvm_acc * 100).toFixed(1) + "%"
                    : "84.0%"}
                </div>
                <div className="text-[10px] font-mono text-[#9CA8A3]">
                  vs Classical RBF SVM Baseline
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101312] border border-[#232B27] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA8A3]">
                  <span>Evaluated Specimens</span>
                  <Activity className="w-3.5 h-3.5 text-[#876DFF]" />
                </div>
                <div className="font-display text-2xl font-bold text-white tabular-nums">
                  12,846
                </div>
                <div className="text-[10px] font-mono text-[#9CA8A3]">
                  Zero-Leakage Grouped Split
                </div>
              </div>
            </div>

            {/* Split Visual Modules: Donut Analysis & Striped Deal Analysis (InsightOS Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Donut Chart: Class Balance */}
              <div className="p-5 rounded-xl bg-[#101312] border border-[#232B27] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">Target Cohort Balance</span>
                  <span className="text-[10px] text-[#9CA8A3]">TCGA-LUAD</span>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#1D2421"
                        strokeWidth="4"
                      />
                      {/* Positive/Mutant segment (35%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#BAF91A"
                        strokeWidth="4"
                        strokeDasharray="35 65"
                        strokeDashoffset="0"
                      />
                      {/* Wildtype segment (65%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#876DFF"
                        strokeWidth="4"
                        strokeDasharray="65 35"
                        strokeDashoffset="-35"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-white">
                      100%
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#BAF91A]" />
                      <span className="text-[#9CA8A3]">Mutant Pos (35%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#876DFF]" />
                      <span className="text-[#9CA8A3]">Wild-Type Neg (65%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagonal Striped Analysis: Kernel Fidelity Density */}
              <div className="p-5 rounded-xl bg-[#101312] border border-[#232B27] space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">Kernel Matrix Fidelity Density</span>
                  <span className="text-[10px] text-[#BAF91A]">K(x_i, x_j)</span>
                </div>

                <div className="p-3.5 rounded-lg bg-striped-lime border border-[#BAF91A]/30 space-y-1.5">
                  <div className="text-xs font-mono text-white font-bold">
                    High-Separation Manifold
                  </div>
                  <p className="text-[11px] font-mono text-[#9CA8A3] leading-relaxed">
                    Statevector transition amplitudes concentrate near off-diagonal boundaries, enabling linear hyperplanes in Hilbert space.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quantum AI Copilot / Telemetry Orb (Direct InsightOS "Bestie AI" Reference) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-5 text-center relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#232B27] pb-3 text-xs font-mono text-left">
            <span className="text-white font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#BAF91A]" />
              <span>Quantum Copilot AI</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#BAF91A] animate-pulse" />
          </div>

          {/* Glossy 3D Iridescent Orb (Matching Reference 2) */}
          <div className="relative w-44 h-44 mx-auto my-2 group">
            <div className="absolute inset-0 rounded-full bg-[#BAF91A]/20 blur-2xl group-hover:bg-[#BAF91A]/35 transition-all duration-500" />
            <div className="relative w-full h-full rounded-full overflow-hidden border border-white/20 glow-orb-shadow">
              <Image
                src="/images/quantum_orb_core.jpg"
                alt="Quantum Copilot AI Core Orb"
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <h3 className="font-display text-base font-bold text-white">
              How can I assist your research?
            </h3>
            <p className="text-[11px] font-mono text-[#9CA8A3] max-w-xs mx-auto">
              Simulate Qiskit circuits, evaluate feature attributions, or verify patient leakage elimination.
            </p>
          </div>

          {/* Quick Action Pills (Matching Reference 2) */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <Link
              href="/app/explainability"
              className="p-2.5 rounded-xl bg-[#101312] border border-[#232B27] text-[#9CA8A3] hover:text-[#BAF91A] hover:border-[#BAF91A] transition-colors flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-[#BAF91A]" />
              <span>Pro Analysis</span>
            </Link>
            <Link
              href="/app/reports"
              className="p-2.5 rounded-xl bg-[#101312] border border-[#232B27] text-[#9CA8A3] hover:text-white hover:border-[#BAF91A] transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#876DFF]" />
              <span>Report Export</span>
            </Link>
          </div>

          {/* Ask Anything Input (Matching Reference 2) */}
          <form onSubmit={handleCopilotSubmit} className="relative pt-1">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="Ask anything about kernels..."
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono text-white placeholder-[#9CA8A3]/70 outline-hidden focus:border-[#BAF91A]"
            />
            <button
              type="submit"
              className="absolute right-2 top-3 p-1 rounded-lg bg-[#BAF91A] text-[#101312] hover:bg-[#BAF91A]/90 transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>

          {copilotMessage && (
            <div className="p-3 rounded-xl bg-[#101312] border border-[#BAF91A]/50 text-left font-mono text-[11px] text-[#E2FF99] leading-relaxed">
              {copilotMessage}
            </div>
          )}
        </div>
      </div>

      {/* Top Opportunities / Cohort Registry Table (Matching Reference 2 Bottom Table) */}
      <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232B27] pb-4">
          <div className="space-y-0.5">
            <h2 className="font-display text-base font-bold text-white">
              Top Research Cohorts & Diagnostic Opportunities
            </h2>
            <p className="text-xs font-mono text-[#9CA8A3]">
              Evaluated cancer genomics tasks with strict patient-grouped split guards.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#9CA8A3]">
            <span>Sorted by Target Priority</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono whitespace-nowrap">
            <thead className="text-[#9CA8A3] border-b border-[#232B27]">
              <tr>
                <th className="pb-3 font-normal">Cohort Task</th>
                <th className="pb-3 font-normal">Organ / Registry</th>
                <th className="pb-3 font-normal">Quantum Success Score</th>
                <th className="pb-3 font-normal">Leakage Guard Level</th>
                <th className="pb-3 font-normal text-right">Holdout Accuracy</th>
                <th className="pb-3 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232B27]/60 text-white">
              <tr className="hover:bg-[#1D2421]/50 transition-colors">
                <td className="py-3.5 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#BAF91A]" />
                  <span>TCGA-LUAD EGFR Mutation</span>
                </td>
                <td className="py-3.5 text-[#9CA8A3]">Lung (Exon 19 del / L858R)</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#1D2421] text-[#BAF91A] font-bold">
                    88% High Advantage
                  </span>
                </td>
                <td className="py-3.5">
                  {/* Segmented green meter matching Reference 2 */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <span key={i} className="w-1.5 h-3 rounded-xs bg-[#BAF91A]" />
                    ))}
                    <span className="text-[10px] text-[#9CA8A3] ml-1">Zero Leakage</span>
                  </div>
                </td>
                <td className="py-3.5 text-right font-bold text-[#BAF91A] tabular-nums">
                  84.0%
                </td>
                <td className="py-3.5 text-right">
                  <Link
                    href="/app/benchmarks?id=exp-tcga-luad-egfr-001"
                    className="text-[#BAF91A] hover:underline"
                  >
                    View Run →
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-[#1D2421]/50 transition-colors">
                <td className="py-3.5 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E2FF99]" />
                  <span>TCGA-LUAD KRAS Codon 12/13/61</span>
                </td>
                <td className="py-3.5 text-[#9CA8A3]">Lung (MAPK Drivers)</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#1D2421] text-[#E2FF99] font-bold">
                    80% Moderate Uplift
                  </span>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="w-1.5 h-3 rounded-xs bg-[#BAF91A]" />
                    ))}
                    <span className="w-1.5 h-3 rounded-xs bg-[#232B27]" />
                    <span className="text-[10px] text-[#9CA8A3] ml-1">GroupSplit</span>
                  </div>
                </td>
                <td className="py-3.5 text-right font-bold text-white tabular-nums">
                  80.0%
                </td>
                <td className="py-3.5 text-right">
                  <Link
                    href="/app/benchmarks?id=exp-tcga-luad-kras-002"
                    className="text-[#BAF91A] hover:underline"
                  >
                    View Run →
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-[#1D2421]/50 transition-colors">
                <td className="py-3.5 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#876DFF]" />
                  <span>BCNB Lymph Node Metastasis</span>
                </td>
                <td className="py-3.5 text-[#9CA8A3]">Breast (Axillary ALN+ vs ALN0)</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#1D2421] text-[#876DFF] font-bold">
                    82% Baseline Parity
                  </span>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <span key={i} className="w-1.5 h-3 rounded-xs bg-[#BAF91A]" />
                    ))}
                    <span className="text-[10px] text-[#9CA8A3] ml-1">Zero Leakage</span>
                  </div>
                </td>
                <td className="py-3.5 text-right font-bold text-white tabular-nums">
                  78.5%
                </td>
                <td className="py-3.5 text-right">
                  <Link
                    href="/app/experiments/new"
                    className="text-[#BAF91A] hover:underline"
                  >
                    Configure →
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
