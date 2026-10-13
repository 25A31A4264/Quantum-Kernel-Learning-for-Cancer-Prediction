"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Scale,
  ExternalLink,
  ChevronRight,
  Terminal,
  Copy,
  Check
} from "lucide-react";

export default function DocumentationPage() {
  const [copiedCode, setCopiedCode] = useState(false);

  const qiskitCodeSnippet = `# Qiskit 2.5 Quantum Kernel Formulation
from qiskit.circuit.library import zz_feature_map
from qiskit.quantum_info import Statevector

feature_map = zz_feature_map(
    feature_dimension=6,
    reps=2,
    entanglement="linear"
)

# Evaluating transition fidelity K(x_i, x_j) = |<psi(x_i)|psi(x_j)>|^2
sv_i = Statevector.from_instruction(feature_map.assign_parameters(x_i))
sv_j = Statevector.from_instruction(feature_map.assign_parameters(x_j))
fidelity = abs(sv_i.inner(sv_j)) ** 2`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qiskitCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F2F3EE] flex flex-col selection:bg-[#62E6E0]/20 selection:text-[#62E6E0]">
      {/* Header */}
      <header className="border-b border-[#2A3335] bg-[#121619]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0B0D0F] border border-[#62E6E0] flex items-center justify-center text-[#62E6E0] font-mono font-bold text-sm">
              Q
            </div>
            <span className="font-display font-extrabold tracking-wider text-base">QUANTUMON</span>
            <span className="text-xs font-mono text-[#A1AAA9]">/ Scientific Docs</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#62E6E0] text-[#0B0D0F] hover:bg-[#62E6E0]/90 font-mono text-xs font-bold transition-all"
            >
              <span>Launch Research Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout with Sticky Quick-Nav */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Quick Nav / Table of Contents (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="sticky top-24 p-5 rounded-lg bg-[#121619] border border-[#2A3335] space-y-3 font-mono text-xs">
            <div className="text-[10px] text-[#A1AAA9] uppercase font-bold tracking-wider">
              DOCUMENTATION INDEX
            </div>
            <nav className="space-y-1.5 text-[#A1AAA9]">
              <a href="#theory" className="block hover:text-[#62E6E0] transition-colors py-1">
                1. Quantum Kernel Theory
              </a>
              <a href="#qiskit-pipeline" className="block hover:text-[#62E6E0] transition-colors py-1">
                2. Qiskit Implementation
              </a>
              <a href="#leakage-safeguards" className="block hover:text-[#62E6E0] transition-colors py-1">
                3. Data Leakage Elimination
              </a>
              <a href="#cohorts" className="block hover:text-[#62E6E0] transition-colors py-1">
                4. Supported Cancer Cohorts
              </a>
              <a href="#guardrails" className="block hover:text-[#62E6E0] transition-colors py-1">
                5. Epistemic Scope
              </a>
            </nav>
          </div>
        </aside>

        {/* Content Body (9 cols) */}
        <main className="lg:col-span-9 space-y-12">
          {/* Title Dossier */}
          <div className="space-y-3 border-b border-[#2A3335] pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#62E6E0]">
              QISKIT FALL FEST 2026 — DOMAIN 2 SPECIFICATION
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#F2F3EE] tracking-tight">
              Quantum Kernel Intelligence for Cancer Research
            </h1>
            <p className="text-sm font-mono text-[#A1AAA9] leading-relaxed max-w-2xl">
              Rigorous mathematical formulation, patient-grouped leakage elimination protocols, and tri-model comparative benchmarking for oncogenomic classification.
            </p>
          </div>

          {/* Section 1: Theory of Quantum Kernels */}
          <section id="theory" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F2F3EE] flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-[#62E6E0]" />
              <span>1. Quantum Feature Maps & The Fidelity Kernel</span>
            </h2>
            <div className="text-xs font-mono text-[#A1AAA9] space-y-3 leading-relaxed">
              <p>
                {"In quantum machine learning, classical data vectors x are encoded into quantum states |ψ(x)⟩ within a 2^n-dimensional Hilbert space via a parameterized unitary circuit:"}
              </p>
              <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] text-[#62E6E0] text-center text-sm font-mono font-bold">
                {"|ψ(x)⟩ = U_Φ(x) |0⟩^⊗n"}
              </div>
              <p>
                The Quantum Kernel function evaluates the quantum transition probability (state fidelity) between any two data encodings:
              </p>
              <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] text-[#C4F36B] text-center text-sm font-mono font-bold">
                {"K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|² = |⟨0| U_Φ†(x_j) U_Φ(x_i) |0⟩|²"}
              </div>
              <p>
                Under Qiskit&apos;s <code>ZZFeatureMap</code>, data enters both single-qubit rotations and pairwise two-qubit entangling gates:
              </p>
              <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] text-[#F2F3EE] text-center text-xs font-mono">
                {"R_z(2x_k) \\quad \\text{and} \\quad R_{zz}(2(π - x_k)(π - x_l))"}
              </div>
              <p>
                This constructs non-linear feature interactions in Hilbert space that are analytically intractable to compute classically as the number of qubits scales.
              </p>
            </div>
          </section>

          {/* Section 2: Qiskit Pipeline */}
          <section id="qiskit-pipeline" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F2F3EE] flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-[#62E6E0]" />
                <span>2. Qiskit 2.5 Pipeline Implementation</span>
              </h2>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121619] border border-[#2A3335] text-[11px] font-mono text-[#A1AAA9] hover:text-[#62E6E0] transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#C4F36B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] text-[#62E6E0] text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{qiskitCodeSnippet}</code>
            </pre>
          </section>

          {/* Section 3: Clinical Data Leakage Safeguards */}
          <section id="leakage-safeguards" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F2F3EE] flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#C4F36B]" />
              <span>3. Patient-Grouped Partitioning & Leakage Elimination</span>
            </h2>
            <div className="text-xs font-mono text-[#A1AAA9] space-y-3 leading-relaxed">
              <p>
                Biomedical datasets frequently contain multiple biopsies, specimen cores, or temporal slices from the same individual patient. Standard random k-fold or train-test splits cause severe patient overlap leakage, resulting in inflated performance that collapses in clinical validation.
              </p>
              <div className="p-5 rounded-lg bg-[#121619] border border-[#2A3335] space-y-2.5">
                <div className="text-[#F2F3EE] font-bold text-sm">QUANTUMON Enforcement Rules:</div>
                <div>1. <strong className="text-[#62E6E0]">Strict Group Partitioning:</strong> Enforces <code>GroupShuffleSplit</code> keyed on <code>patient_id</code> so zero patients cross partition boundaries.</div>
                <div>2. <strong className="text-[#62E6E0]">Leak-Free Preprocessing:</strong> Feature normalizers (MinMaxScaler, StandardScaler) and selectors are fitted strictly on training data only.</div>
                <div>3. <strong className="text-[#62E6E0]">Angle Encoding Boundedness:</strong> Features are mapped to $[0, \pi]$ to prevent periodicity phase aliasing.</div>
              </div>
            </div>
          </section>

          {/* Section 4: Supported Cohorts */}
          <section id="cohorts" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F2F3EE] flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#62E6E0]" />
              <span>4. Supported Cancer Research Cohorts</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-2 text-xs font-mono">
                <span className="text-[#62E6E0] font-bold">TCGA-LUAD EGFR</span>
                <p className="text-[#A1AAA9] text-[11px] leading-relaxed">
                  Predicts EGFR activating mutations (Exon 19 del / L858R) against wild-type in lung adenocarcinoma using multi-gene transcriptomics and smoking PackYears.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-2 text-xs font-mono">
                <span className="text-[#62E6E0] font-bold">TCGA-LUAD KRAS</span>
                <p className="text-[#A1AAA9] text-[11px] leading-relaxed">
                  Differentiates KRAS codon 12/13/61 oncogenic driver mutations using MAPK pathway signaling and tobacco pack-years signatures.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-2 text-xs font-mono">
                <span className="text-[#62E6E0] font-bold">BCNB Lymph Node</span>
                <p className="text-[#A1AAA9] text-[11px] leading-relaxed">
                  Preoperative prediction of axillary lymph node metastasis (ALN+ vs ALN0) in breast cancer using Nottingham grade, receptor status, and Ki-67 index.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Epistemic Guardrail */}
          <section id="guardrails" className="p-6 rounded-lg bg-[#121619] border border-[#F0B86B]/40 space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2 text-[#F0B86B] font-mono font-bold text-sm">
              <Scale className="w-4 h-4 text-[#F0B86B]" />
              <span>Scientific Reproducibility & Educational Scope</span>
            </div>
            <p className="text-xs font-mono text-[#A1AAA9] leading-relaxed">
              QUANTUMON is designed as an open research and educational testbed for evaluating quantum kernel learning algorithms against established machine-learning methods. It is not approved as a medical device and must never be utilized for direct patient diagnosis or clinical management decisions.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
