"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Search,
  RefreshCw,
  FlaskConical,
  Filter,
  Layers,
  ArrowRight
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { fetchExperiments, fetchExperimentDetail, ExperimentSummary } from "@/lib/api";

export default function ResearchInsightsPage() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>("");
  const [activeExp, setActiveExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sampleFilter, setSampleFilter] = useState<"all" | "disagreements" | "qsvm_correct_only">("all");

  useEffect(() => {
    fetchExperiments()
      .then((exps) => {
        setExperiments(exps);
        if (exps.length > 0) setSelectedExpId(exps[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedExpId) {
      setLoading(true);
      fetchExperimentDetail(selectedExpId)
        .then(setActiveExp)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedExpId]);

  const xgbImportance = activeExp?.results?.models?.xgboost?.metadata?.feature_importance || {};
  const rbfImportance = activeExp?.results?.models?.classical_rbf_svm?.metadata?.feature_importance || {};

  const sortedFeatures = Object.keys(xgbImportance).sort(
    (a, b) => (xgbImportance[b] || 0) - (xgbImportance[a] || 0)
  );

  const sampleErrors = activeExp?.results?.sample_errors || [];
  const filteredSamples = sampleErrors.filter((s: any) => {
    if (sampleFilter === "disagreements") {
      return !(s.qsvm_correct && s.rbf_correct && s.xgb_correct);
    }
    if (sampleFilter === "qsvm_correct_only") {
      return s.qsvm_correct && (!s.rbf_correct || !s.xgb_correct);
    }
    return true;
  });

  // Calculate high-level concordance summary metrics
  const totalSamples = sampleErrors.length;
  const unanimousCorrect = sampleErrors.filter((s: any) => s.qsvm_correct && s.rbf_correct && s.xgb_correct).length;
  const unanimousRatio = totalSamples > 0 ? (unanimousCorrect / totalSamples) * 100 : 0;
  const quantumAdvantageCount = sampleErrors.filter((s: any) => s.qsvm_correct && (!s.rbf_correct || !s.xgb_correct)).length;
  const disagreementsCount = sampleErrors.filter((s: any) => !(s.qsvm_correct && s.rbf_correct && s.xgb_correct)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg bg-[#121619] border border-[#2A3335]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#62E6E0] font-semibold">
              SPECIMEN-LEVEL COHORT CONCORDANCE // DOMAIN 2
            </span>
            {activeExp && <SyntheticDataBadge isSynthetic={activeExp.is_synthetic ?? true} size="sm" />}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F2F3EE]">
            Model Concordance & Genomic Explainability
          </h1>
          <p className="text-xs text-[#A1AAA9] max-w-2xl leading-relaxed">
            Examine high-dimensional feature importance attributions against held-out sample-by-sample discordances across Quantum SVM, Classical RBF, and XGBoost.
          </p>
        </div>

        {experiments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-mono text-[#A1AAA9] uppercase">Active Run:</span>
            <select
              value={selectedExpId}
              onChange={(e) => setSelectedExpId(e.target.value)}
              className="px-3 py-1.5 rounded bg-[#191F22] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0] cursor-pointer"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} ({exp.id.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] animate-pulse space-y-2">
                <div className="h-3 w-20 bg-[#191F22] rounded" />
                <div className="h-6 w-16 bg-[#191F22] rounded" />
              </div>
            ))}
          </div>
          <div className="p-8 rounded-lg bg-[#121619] border border-[#2A3335] animate-pulse h-64" />
        </div>
      )}

      {/* Empty State */}
      {!loading && experiments.length === 0 && (
        <div className="p-12 text-center rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
          <FlaskConical className="w-10 h-10 text-[#62E6E0] mx-auto opacity-70" />
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-[#F2F3EE]">No Active Benchmark Records</h3>
            <p className="text-xs text-[#A1AAA9] max-w-md mx-auto leading-relaxed">
              Execute a tri-model training run in the Experiment Builder to generate feature attribution rankings and specimen concordance matrices.
            </p>
          </div>
          <Link
            href="/app/experiments/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#62E6E0] text-[#0B0D0F] font-mono text-xs font-bold hover:bg-[#62E6E0]/90 transition-colors"
          >
            <span>Launch Experiment Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {!loading && activeExp && (
        <>
          {/* Concordance Summary Dossier Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-1">
              <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Held-Out Test Set</span>
              <div className="font-display text-2xl font-bold text-[#F2F3EE] tabular-nums">
                {totalSamples}
              </div>
              <span className="text-[11px] font-mono text-[#A1AAA9]">patient specimens evaluated</span>
            </div>

            <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-1">
              <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Tri-Model Consensus</span>
              <div className="font-display text-2xl font-bold text-[#C4F36B] tabular-nums">
                {unanimousRatio.toFixed(1)}%
              </div>
              <span className="text-[11px] font-mono text-[#A1AAA9]">{unanimousCorrect} unanimous true</span>
            </div>

            <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-1">
              <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Quantum Advantage Specimens</span>
              <div className="font-display text-2xl font-bold text-[#62E6E0] tabular-nums">
                {quantumAdvantageCount}
              </div>
              <span className="text-[11px] font-mono text-[#A1AAA9]">QSVM true, baseline failed</span>
            </div>

            <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-1">
              <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Boundary Divergences</span>
              <div className="font-display text-2xl font-bold text-[#F0B86B] tabular-nums">
                {disagreementsCount}
              </div>
              <span className="text-[11px] font-mono text-[#A1AAA9]">decision edge discrepancies</span>
            </div>
          </div>

          {/* Asymmetric Section: Feature Attributions & Mathematical Basis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Feature Importance Breakdown */}
            <div className="lg:col-span-7 p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3335] pb-4">
                <div className="space-y-0.5">
                  <h2 className="font-display text-base font-bold text-[#F2F3EE] flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#62E6E0]" />
                    <span>Feature Importance Attribution Breakdown</span>
                  </h2>
                  <p className="text-xs text-[#A1AAA9]">
                    XGBoost Gini Gain vs Classical RBF Permutation Sensitivity
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[#A1AAA9]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#C4F36B]" />
                    XGBoost
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#62E6E0]" />
                    RBF Perm
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {sortedFeatures.map((feat) => {
                  const xgbVal = xgbImportance[feat] || 0;
                  const rbfVal = Math.max(0, rbfImportance[feat] || 0);
                  return (
                    <div
                      key={feat}
                      className="p-3 rounded bg-[#0B0D0F] border border-[#2A3335] hover:border-[#2A3335]/80 transition-colors space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F2F3EE]">{feat}</span>
                        <div className="flex items-center gap-3 text-[11px] tabular-nums">
                          <span className="text-[#C4F36B]">XGB: {(xgbVal * 100).toFixed(1)}%</span>
                          <span className="text-[#2A3335]">|</span>
                          <span className="text-[#62E6E0]">RBF: {(rbfVal * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* Dual-tone Progress bars */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-[#191F22] h-2 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${Math.min(100, Math.max(2, xgbVal * 100))}%` }}
                            className="bg-[#C4F36B] h-full rounded-full transition-all duration-300"
                            title={`XGBoost: ${(xgbVal * 100).toFixed(1)}%`}
                          />
                        </div>
                        <div className="w-full bg-[#191F22] h-1.5 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${Math.min(100, Math.max(2, rbfVal * 100))}%` }}
                            className="bg-[#62E6E0] h-full rounded-full transition-all duration-300"
                            title={`RBF Permutation: ${(rbfVal * 100).toFixed(1)}%`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (5 cols): Quantum Dimensional Encoding Context */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#62E6E0]">
                  <Layers className="w-4 h-4 text-[#62E6E0]" />
                  <span className="font-bold uppercase tracking-wider text-[11px]">Hilbert Feature Mapping</span>
                </div>
                <h3 className="font-display text-sm font-bold text-[#F2F3EE]">
                  Why Quantum Kernels Capture Non-Linear Synergies
                </h3>
                <p className="text-[#A1AAA9] leading-relaxed text-[11px]">
                  Classical gradient boosted trees optimize axis-aligned splits sequentially, whereas ZZ-Feature Maps evaluate multi-qubit phase entanglement:
                </p>
                <div className="p-3 rounded bg-[#0B0D0F] border border-[#2A3335] text-[#C4F36B] text-[11px] text-center">
                  {"U_Φ(x) = exp( i ∑_j x_j Z_j + i ∑_{j,k} (π - x_j)(π - x_k) Z_j Z_k )"}
                </div>
                <p className="text-[#A1AAA9] leading-relaxed text-[11px]">
                  When molecular biomarkers exhibit cooperative pathway activation (e.g. EGFR and ERBB2 co-expression), the two-body phase evolution embeds non-linear cross-correlations directly into the inner product matrix:
                </p>
                <div className="p-2.5 rounded bg-[#0B0D0F] border border-[#2A3335] text-[#62E6E0] text-[10px] text-center">
                  {"K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|²"}
                </div>
              </div>

              {/* Non-Causal Epistemic Guardrail */}
              <div className="p-4 rounded-lg bg-[#121619] border border-[#F0B86B]/30 text-xs font-mono text-[#A1AAA9] space-y-1.5">
                <div className="text-[#F0B86B] font-bold flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-[#F0B86B] shrink-0" />
                  <span>Non-Causal Epistemic Guardrail</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#A1AAA9]">
                  Attribution metrics capture mathematical correlations within the high-dimensional feature space. They do not constitute verified clinical causality or direct biological mechanisms.
                </p>
              </div>
            </div>
          </div>

          {/* Sample Error Review & Discordance Inspector */}
          <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A3335] pb-4">
              <div className="space-y-0.5">
                <h2 className="font-display text-base font-bold text-[#F2F3EE]">
                  Sample-by-Sample Classification Concordance
                </h2>
                <p className="text-xs text-[#A1AAA9]">
                  Inspect individual held-out test specimens to identify cases where quantum and classical decision boundaries disagree.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-1.5 text-xs font-mono self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSampleFilter("all")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    sampleFilter === "all"
                      ? "bg-[#191F22] text-[#62E6E0] font-bold border border-[#62E6E0]/40"
                      : "text-[#A1AAA9] hover:text-[#F2F3EE] border border-transparent"
                  }`}
                >
                  All ({sampleErrors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSampleFilter("disagreements")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    sampleFilter === "disagreements"
                      ? "bg-[#191F22] text-[#F0B86B] font-bold border border-[#F0B86B]/40"
                      : "text-[#A1AAA9] hover:text-[#F2F3EE] border border-transparent"
                  }`}
                >
                  Disagreements ({disagreementsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSampleFilter("qsvm_correct_only")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    sampleFilter === "qsvm_correct_only"
                      ? "bg-[#191F22] text-[#C4F36B] font-bold border border-[#C4F36B]/40"
                      : "text-[#A1AAA9] hover:text-[#F2F3EE] border border-transparent"
                  }`}
                >
                  Quantum Advantage ({quantumAdvantageCount})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#2A3335] rounded-md">
              <table className="w-full text-left text-xs font-mono whitespace-nowrap">
                <thead className="bg-[#0B0D0F] text-[#A1AAA9] border-b border-[#2A3335]">
                  <tr>
                    <th className="p-3">Held-Out Specimen</th>
                    <th className="p-3">True Label</th>
                    <th className="p-3 text-[#62E6E0]">Quantum SVM (Prob)</th>
                    <th className="p-3">Classical RBF (Prob)</th>
                    <th className="p-3 text-[#C4F36B]">XGBoost (Prob)</th>
                    <th className="p-3 text-right">Concordance Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3335]/40 text-[#F2F3EE]">
                  {filteredSamples.map((s: any) => {
                    const isUnanimousTrue = s.qsvm_correct && s.rbf_correct && s.xgb_correct;
                    const isUnanimousFail = !s.qsvm_correct && !s.rbf_correct && !s.xgb_correct;
                    const isQuantumAdv = s.qsvm_correct && (!s.rbf_correct || !s.xgb_correct);

                    return (
                      <tr key={s.index} className="hover:bg-[#191F22]/70 transition-colors">
                        <td className="p-3 font-bold text-[#F2F3EE]">
                          Specimen #{s.index + 1}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.actual === 1
                                ? "bg-[#123438] text-[#62E6E0] border border-[#62E6E0]/30"
                                : "bg-[#191F22] text-[#A1AAA9] border border-[#2A3335]"
                            }`}
                          >
                            {s.actual === 1 ? "Class 1 (Pos / Mutant)" : "Class 0 (Neg / WT)"}
                          </span>
                        </td>
                        <td className="p-3 tabular-nums">
                          <span className={`inline-flex items-center gap-1 ${s.qsvm_correct ? "text-[#C4F36B]" : "text-[#FF7474]"}`}>
                            {s.qsvm_correct ? "✓" : "✗"} Pred {s.qsvm_pred} ({s.qsvm_prob})
                          </span>
                        </td>
                        <td className="p-3 tabular-nums">
                          <span className={`inline-flex items-center gap-1 ${s.rbf_correct ? "text-[#C4F36B]" : "text-[#FF7474]"}`}>
                            {s.rbf_correct ? "✓" : "✗"} Pred {s.rbf_pred} ({s.rbf_prob})
                          </span>
                        </td>
                        <td className="p-3 tabular-nums">
                          <span className={`inline-flex items-center gap-1 ${s.xgb_correct ? "text-[#C4F36B]" : "text-[#FF7474]"}`}>
                            {s.xgb_correct ? "✓" : "✗"} Pred {s.xgb_pred} ({s.xgb_prob})
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isUnanimousTrue ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#1f3014] text-[#C4F36B] border border-[#C4F36B]/30 font-bold">
                              Unanimous True
                            </span>
                          ) : isUnanimousFail ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#2a1313] text-[#FF7474] border border-[#FF7474]/30 font-bold">
                              Unanimous Error
                            </span>
                          ) : isQuantumAdv ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#123438] text-[#62E6E0] border border-[#62E6E0]/40 font-bold">
                              Quantum Advantage
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#2b2413] text-[#F0B86B] border border-[#F0B86B]/30 font-bold">
                              Boundary Divergence
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
