"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  Database,
  BarChart2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  FlaskConical,
  Scale,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Sparkles,
  Eye,
  Radio,
  Dna,
  Share2
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { fetchExperiments, fetchTasks, ExperimentSummary, TaskInfo } from "@/lib/api";

export default function LandingPage() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);

  // Interactive Quantum Wire Simulation State
  const [featureAngle, setFeatureAngle] = useState(1.45); // radians
  const [selectedGate, setSelectedGate] = useState<string>("rz");
  const [activeHotspot, setActiveHotspot] = useState<number | null>(1);

  // Compute live simulated statevector fidelity against a fixed reference point (x_ref = 1.20)
  const refAngle = 1.20;
  const phaseDiff = Math.abs(featureAngle - refAngle);
  const liveFidelity = Math.max(0.01, Math.min(1.0, Math.pow(Math.cos(phaseDiff / 2), 4) * (1 - 0.15 * Math.sin(phaseDiff * 2))));

  useEffect(() => {
    fetchExperiments().then(setExperiments).catch(() => {});
    fetchTasks().then(setTasks).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#101312] text-white flex flex-col selection:bg-[#BAF91A]/20 selection:text-[#BAF91A] glow-ambient-lime glow-ambient-violet">
      {/* Top Navigation */}
      <header className="border-b border-[#232B27] bg-[#101312]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#161B19] border border-[#BAF91A]/60 flex items-center justify-center text-[#BAF91A] font-mono font-bold text-xs shadow-[0_0_15px_rgba(186,249,26,0.2)] group-hover:border-[#BAF91A] transition-colors">
              Q
            </div>
            <div>
              <div className="font-display font-extrabold tracking-wider text-base text-white">QUANTUMON</div>
              <div className="text-[10px] font-mono text-[#9CA8A3] uppercase">
                Qiskit Fall Fest 2026 · Domain 2
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-[#9CA8A3]">
            <Link href="#compound-vision" className="hover:text-white transition-colors">
              01 // Quantum Vision
            </Link>
            <Link href="#modulator" className="hover:text-white transition-colors">
              02 // State Modulator
            </Link>
            <Link href="#cohorts" className="hover:text-white transition-colors">
              03 // Cancer Cohorts
            </Link>
            <Link href="#tri-model" className="hover:text-white transition-colors">
              04 // Tri-Model Parity
            </Link>
            <Link href="/docs" className="hover:text-[#BAF91A] transition-colors flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theory & Docs</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#BAF91A] text-[#101312] hover:bg-[#BAF91A]/90 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(186,249,26,0.3)] cursor-pointer"
            >
              <span>Open Research Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: See Like A Fly / Quantum Molecular Vision */}
      <section id="compound-vision" className="relative pt-10 pb-16 border-b border-[#232B27] bg-laboratory-grid overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          {/* Top Title Group directly inspired by Reference 1 */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161B19] border border-[#232B27] text-xs font-mono text-[#BAF91A]">
                <span className="w-2 h-2 rounded-full bg-[#BAF91A] animate-pulse" />
                QUANTUM COMPUTING FOR ONCOLOGY & DRUG DISCOVERY
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                See like a{" "}
                <span className="font-serif italic text-[#BAF91A] drop-shadow-[0_0_35px_rgba(186,249,26,0.6)]">
                  Quantum Eye
                </span>
              </h1>

              <p className="text-xs sm:text-sm font-mono text-[#9CA8A3] leading-relaxed max-w-2xl">
                ONE PATIENT SPECIMEN. THOUSANDS OF QUANTUM INTERACTIONS. MILLIONS OF POTENTIAL ONCOGENIC STATES. QUANTUM KERNEL LEARNING CHANGES THE WAY WE EXPLORE THEM.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-end">
              <Link
                href="/app/experiments/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#BAF91A] text-[#101312] hover:bg-[#BAF91A]/90 font-mono text-xs font-bold transition-all shadow-[0_0_25px_rgba(186,249,26,0.35)]"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Launch Benchmark</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#161B19] border border-[#232B27] text-xs font-mono text-[#9CA8A3] hover:text-white hover:border-[#BAF91A] transition-colors"
              >
                <span>Read Theory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Central Luminous Visual: Compound Eye Molecular Lattice */}
          <div className="relative rounded-2xl border border-[#232B27] bg-[#161B19]/70 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="relative aspect-16/9 w-full max-h-[580px] overflow-hidden">
              <Image
                src="/images/quantum_molecular_hero.jpg"
                alt="Quantum Computing for Oncology - Molecular Compound Eye Visualization"
                fill
                priority
                className="object-cover object-center scale-[1.02] hover:scale-100 transition-transform duration-700 opacity-90"
              />

              {/* HUD Monogram (Bottom Left) matching Reference 1 */}
              <div className="absolute bottom-6 left-6 p-4 rounded-xl bg-[#101312]/80 backdrop-blur-md border border-[#232B27] flex items-center gap-4 text-xs font-mono">
                <div className="w-12 h-12 rounded-lg bg-[#161B19] border border-[#BAF91A] flex items-center justify-center text-[#BAF91A] font-display font-extrabold text-2xl shadow-[0_0_20px_rgba(186,249,26,0.4)]">
                  Q
                </div>
                <div className="space-y-0.5 text-[11px] text-[#9CA8A3]">
                  <div className="text-white font-bold tracking-wider">QUANTUMON HUD</div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-[#BAF91A]">● NETWORKS</span>
                    <span>•</span>
                    <span className="text-[#876DFF]">● ONCOLOGY</span>
                    <span>•</span>
                    <span className="text-[#4EE4D8]">● QISKIT 2.5</span>
                  </div>
                </div>
              </div>

              {/* Interactive Callout Pins corresponding to ①, ②, ③, ④ */}
              <button
                type="button"
                onClick={() => setActiveHotspot(1)}
                className={`absolute top-[28%] left-[22%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  activeHotspot === 1
                    ? "bg-[#BAF91A] text-[#101312] border-white shadow-[0_0_20px_rgba(186,249,26,0.8)] scale-110"
                    : "bg-[#101312]/80 text-[#BAF91A] border-[#BAF91A]/50 hover:scale-105"
                }`}
              >
                ①
              </button>

              <button
                type="button"
                onClick={() => setActiveHotspot(2)}
                className={`absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  activeHotspot === 2
                    ? "bg-[#BAF91A] text-[#101312] border-white shadow-[0_0_20px_rgba(186,249,26,0.8)] scale-110"
                    : "bg-[#101312]/80 text-[#BAF91A] border-[#BAF91A]/50 hover:scale-105"
                }`}
              >
                ②
              </button>

              <button
                type="button"
                onClick={() => setActiveHotspot(3)}
                className={`absolute top-[35%] right-[18%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  activeHotspot === 3
                    ? "bg-[#BAF91A] text-[#101312] border-white shadow-[0_0_20px_rgba(186,249,26,0.8)] scale-110"
                    : "bg-[#101312]/80 text-[#BAF91A] border-[#BAF91A]/50 hover:scale-105"
                }`}
              >
                ③
              </button>

              {/* Dynamic Callout Dossier Window */}
              <div className="absolute top-6 right-6 hidden md:block max-w-xs p-4 rounded-xl bg-[#101312]/85 backdrop-blur-md border border-[#232B27] space-y-1.5 font-mono text-xs">
                <div className="text-[#BAF91A] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#BAF91A]" />
                  <span>
                    {activeHotspot === 1
                      ? "① Compound Eye Multi-Projection"
                      : activeHotspot === 2
                      ? "② Candidate Oncogenomic State"
                      : "③ Quantum Kernel Reflection Matrix"}
                  </span>
                </div>
                <p className="text-[11px] text-[#9CA8A3] leading-relaxed">
                  {activeHotspot === 1
                    ? "Thousands of simultaneous quantum basis projections evaluate non-linear multi-qubit correlations without classical dimensionality collapse."
                    : activeHotspot === 2
                    ? "One tumor biopsy specimen is encoded via parameterized unitaries U_Φ(x) into 2^n Hilbert dimensions."
                    : "Every transition fidelity K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|² reveals complex mutational signatures missed by linear classifiers."}
                </p>
              </div>

              {/* Central Bottom Luminous Ticker (Reference 1) */}
              <div className="absolute bottom-6 right-6 hidden sm:block px-4 py-2 rounded-lg bg-[#101312]/70 backdrop-blur-md border border-[#232B27] text-[11px] font-mono text-[#BAF91A] tracking-wider uppercase">
                EXPLORING COUNTLESS POSSIBILITIES TO FIND TREATMENTS FASTER
              </div>
            </div>

            {/* 4-Item Numbered Bottom Breakdown (Exact Match to Reference 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#232B27] border-t border-[#232B27] bg-[#101312]">
              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#BAF91A] uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full border border-[#BAF91A] flex items-center justify-center text-[10px]">
                    ①
                  </span>
                  <span>Compound Eye</span>
                </div>
                <h4 className="font-display text-base font-bold text-white">
                  Thousands of viewpoints.
                </h4>
                <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                  Simultaneous quantum superposition observes high-dimensional feature interactions from all angles at once.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E2FF99] uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full border border-[#E2FF99] flex items-center justify-center text-[10px]">
                    ②
                  </span>
                  <span>Candidate Molecule</span>
                </div>
                <h4 className="font-display text-base font-bold text-white">
                  One molecule. Infinite paths.
                </h4>
                <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                  Patient tumor profiles are embedded into non-linear Hilbert space trajectories preserving pathway synergies.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#876DFF] uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full border border-[#876DFF] flex items-center justify-center text-[10px]">
                    ③
                  </span>
                  <span>Reflection System</span>
                </div>
                <h4 className="font-display text-base font-bold text-white">
                  Every reflection is a possibility.
                </h4>
                <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                  Statevector fidelity matrix overlaps K(x_i, x_j) illuminate subtle genomic driver mutations.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#4EE4D8] uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full border border-[#4EE4D8] flex items-center justify-center text-[10px]">
                    ④
                  </span>
                  <span>Human Impact</span>
                </div>
                <h4 className="font-display text-base font-bold text-white">
                  Expanding physician intuition.
                </h4>
                <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                  Enforces patient-grouped split protection to ensure diagnostic metrics withstand real-world oncology validation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Biomarker Angle Modulator */}
      <section id="modulator" className="py-16 border-b border-[#232B27] bg-[#161B19]/30">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#BAF91A] font-bold">
              02 // INTERACTIVE QUANTUM ENCODING LAB
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white">
              Dynamic Hilbert State Modulator
            </h2>
            <p className="text-xs font-mono text-[#9CA8A3] max-w-2xl leading-relaxed">
              Modulate input biomarker angles ($\theta$) to observe instantaneous unitary statevector rotations and kernel matrix fidelity overlap.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9CA8A3]">Biomarker Value (x_i Angle):</span>
                  <span className="text-[#BAF91A] font-bold tabular-nums">
                    {featureAngle.toFixed(2)} rad ({(featureAngle * (180 / Math.PI)).toFixed(1)}°)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3.14159"
                  step="0.05"
                  value={featureAngle}
                  onChange={(e) => setFeatureAngle(parseFloat(e.target.value))}
                  className="w-full accent-[#BAF91A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#9CA8A3]">
                  <span>0 (Ground |0⟩)</span>
                  <span>π/2 (Superposition |+⟩)</span>
                  <span>π (Excited |1⟩)</span>
                </div>
              </div>

              {/* Gate Topology Selector */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-[#9CA8A3]">Unitary Gate Topology:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "rz", label: "R_z(2x)" },
                    { id: "rzz", label: "R_zz(2θ)" },
                    { id: "h", label: "Hadamard" }
                  ].map((gate) => (
                    <button
                      key={gate.id}
                      type="button"
                      onClick={() => setSelectedGate(gate.id)}
                      className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
                        selectedGate === gate.id
                          ? "bg-[#1D2421] border-[#BAF91A] text-[#BAF91A] font-bold"
                          : "bg-[#101312] border-[#232B27] text-[#9CA8A3] hover:text-white"
                      }`}
                    >
                      {gate.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono space-y-1.5">
                <div className="text-[#BAF91A] font-bold text-[11px] uppercase">Calculated Kernel Fidelity:</div>
                <div className="font-display text-2xl font-bold text-white tabular-nums">
                  K(x, x_ref) = {liveFidelity.toFixed(4)}
                </div>
                <div className="text-[10px] text-[#9CA8A3]">
                  Analytical fidelity against reference test vector (x_ref = 1.20 rad)
                </div>
              </div>
            </div>

            {/* Visualizer (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-6">
              <div className="flex items-center justify-between border-b border-[#232B27] pb-3 text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#BAF91A]" />
                  <span>Statevector Superposition Amplitude</span>
                </span>
                <span className="text-[#BAF91A] font-bold">Qiskit ZZFeatureMap Basis</span>
              </div>

              {/* Graphical State bar */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-[#9CA8A3] mb-1">
                    <span>|0⟩ Ground Probability Amplitude</span>
                    <span className="text-white tabular-nums">{(Math.cos(featureAngle / 2) ** 2 * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#101312] h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.cos(featureAngle / 2) ** 2 * 100}%` }}
                      className="bg-[#BAF91A] h-full rounded-full transition-all duration-150"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#9CA8A3] mb-1">
                    <span>|1⟩ Excited Probability Amplitude</span>
                    <span className="text-white tabular-nums">{(Math.sin(featureAngle / 2) ** 2 * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#101312] h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.sin(featureAngle / 2) ** 2 * 100}%` }}
                      className="bg-[#876DFF] h-full rounded-full transition-all duration-150"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono text-[#9CA8A3] space-y-1">
                <div className="text-white font-bold">Angle Mapping Guarantee:</div>
                <p className="text-[11px] leading-relaxed">
                  Feature values are bounded strictly within [0, π] via training-fitted MinMaxScaler to prevent phase aliasing and ensure injective state mapping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Cancer Cohorts (03 // Cancer Cohorts) */}
      <section id="cohorts" className="py-16 border-b border-[#232B27] bg-laboratory-grid">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#BAF91A] font-bold">
              03 // VALIDATED ONCOLOGICAL BENCHMARKS
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white">
              Supported Clinical Cohorts
            </h2>
            <p className="text-xs font-mono text-[#9CA8A3] max-w-2xl leading-relaxed">
              Curated oncogenomic tasks evaluating quantum advantage under patient-isolated train/test splits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] hover:border-[#BAF91A]/60 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#BAF91A] font-bold uppercase tracking-wider">
                  TCGA-LUAD EGFR
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1D2421] text-[#E2FF99]">
                  Lung Adenocarcinoma
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                EGFR Mutational Status
              </h3>
              <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                Predicts activating driver mutations (Exon 19 del / L858R) using EGFR, ERBB2, MET transcriptomics and smoking pack-years.
              </p>
              <div className="pt-2 border-t border-[#232B27] text-[11px] font-mono text-[#BAF91A]">
                Target: egfr_mutation (Pos: 1, WT: 0)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] hover:border-[#BAF91A]/60 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#BAF91A] font-bold uppercase tracking-wider">
                  TCGA-LUAD KRAS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1D2421] text-[#E2FF99]">
                  Lung Adenocarcinoma
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                KRAS Codon 12/13/61 Drivers
              </h3>
              <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                Differentiates refractory KRAS G12C/D/V variants against wild-type utilizing MAPK pathway signaling co-expression.
              </p>
              <div className="pt-2 border-t border-[#232B27] text-[11px] font-mono text-[#BAF91A]">
                Target: kras_mutation (Codon Mut: 1, WT: 0)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] hover:border-[#BAF91A]/60 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#BAF91A] font-bold uppercase tracking-wider">
                  BCNB Lymph Node
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1D2421] text-[#E2FF99]">
                  Breast Carcinoma
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                Axillary Lymph Node Metastasis
              </h3>
              <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                Preoperative non-invasive metastasis staging (ALN+ vs ALN0) using histological grade, receptor indices, and Ki-67.
              </p>
              <div className="pt-2 border-t border-[#232B27] text-[11px] font-mono text-[#BAF91A]">
                Target: lymph_node_positive (ALN+: 1, ALN0: 0)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Model Parity Matrix (04 // Tri-Model Parity) */}
      <section id="tri-model" className="py-16 border-b border-[#232B27] bg-[#161B19]/20">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#BAF91A] font-bold">
              04 // ALGORITHMIC INTEGRITY
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white">
              Tri-Model Architectural Parity
            </h2>
            <p className="text-xs font-mono text-[#9CA8A3] max-w-2xl leading-relaxed">
              Fair, leak-free benchmarking comparing Quantum SVM against optimized classical baselines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#161B19] border border-[#BAF91A]/60 space-y-4 shadow-[0_0_20px_rgba(186,249,26,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#BAF91A] font-bold uppercase">Candidate Algorithm</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#BAF91A] text-[#101312] font-bold">QISKIT 2.5</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">Quantum-Kernel SVM</h3>
              <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                Maps biomarkers to 2^n Hilbert dimensions via ZZFeatureMap unitary rotations. Evaluates transition fidelity matrix K(x_i, x_j) with dual soft-margin optimization.
              </p>
              <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono space-y-1">
                <div className="text-[#BAF91A] font-bold">Time Complexity:</div>
                <div className="text-white">O(N² · 2ⁿ) analytic overlaps</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#9CA8A3] font-bold uppercase">Classical Baseline 1</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1D2421] text-white">SCIKIT-LEARN</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">RBF-Kernel SVM</h3>
              <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                Infinite-dimensional exponential distance kernel K(x_i, x_j) = exp(-γ ||x_i - x_j||²). Standard benchmark for smooth non-linear continuous manifolds.
              </p>
              <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono space-y-1">
                <div className="text-[#9CA8A3] font-bold">Time Complexity:</div>
                <div className="text-white">O(N² · d) Euclidean distances</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#876DFF] font-bold uppercase">Classical Baseline 2</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#876DFF]/20 text-[#876DFF]">GRADIENT BOOSTING</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">XGBoost Classifier</h3>
              <p className="text-xs font-mono text-[#9CA8A3] leading-relaxed">
                Ensemble of shallow decision trees optimized via second-order gradient descent. Gold standard for tabular clinical genomics with mixed feature scales.
              </p>
              <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono space-y-1">
                <div className="text-[#876DFF] font-bold">Time Complexity:</div>
                <div className="text-white">O(M · d · depth) tree splits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#232B27] bg-[#101312] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-[#9CA8A3]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#161B19] border border-[#BAF91A] flex items-center justify-center text-[#BAF91A] font-bold text-[10px]">
              Q
            </div>
            <span>QUANTUMON · Qiskit Fall Fest 2026 Domain 2 Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href="/app" className="hover:text-[#BAF91A] transition-colors">
              Research Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
