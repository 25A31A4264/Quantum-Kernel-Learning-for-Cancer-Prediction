"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Download,
  FileText,
  Clock,
  Cpu,
  ShieldCheck,
  Scale,
  Layers,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { fetchExperiments, fetchExperimentDetail, fetchHtmlReport, ExperimentSummary } from "@/lib/api";

function BenchmarksContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>(initialId || "");
  const [activeExp, setActiveExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>("accuracy");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [curveType, setCurveType] = useState<"roc" | "pr">("roc");

  useEffect(() => {
    fetchExperiments().then((exps) => {
      setExperiments(exps);
      if (!selectedExpId && exps.length > 0) {
        setSelectedExpId(exps[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedExpId) {
      setLoading(true);
      fetchExperimentDetail(selectedExpId)
        .then((detail) => {
          setActiveExp(detail);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedExpId]);

  const handleExportCsv = () => {
    if (!activeExp) return;
    const models = activeExp.results.models;
    const headers = ["Model", "Accuracy", "Balanced_Accuracy", "Precision", "Recall", "F1_Score", "ROC_AUC", "Train_Time_ms", "Infer_Time_ms"];
    const rows = Object.values(models).map((m: any) => [
      m.name,
      m.metrics.accuracy,
      m.metrics.balanced_accuracy,
      m.metrics.precision,
      m.metrics.recall,
      m.metrics.f1_score,
      m.metrics.roc_auc,
      m.runtime.train_time_ms,
      m.runtime.infer_time_ms,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeExp.id}_benchmark_metrics.csv`;
    a.click();
  };

  const modelsList = activeExp ? Object.values(activeExp.results.models) : [];
  const sortedModels = [...modelsList].sort((a: any, b: any) => {
    const valA = a.metrics[sortField] ?? a.runtime[sortField] ?? 0;
    const valB = b.metrics[sortField] ?? b.runtime[sortField] ?? 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto selection:bg-[#BAF91A]/20 selection:text-[#BAF91A]">
      {/* Header and Experiment Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#161B19] border border-[#232B27]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#BAF91A] font-semibold">
              TRI-MODEL EVALUATION // DOMAIN 2
            </span>
            <SyntheticDataBadge isSynthetic={activeExp?.is_synthetic ?? true} size="sm" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Model Benchmarks</h1>
          <p className="text-xs font-mono text-[#9CA8A3]">
            Rigorous tri-model evaluation on identical held-out test partitions: Quantum-Kernel SVM vs Classical RBF SVM vs XGBoost.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedExpId}
            onChange={(e) => setSelectedExpId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono text-white outline-hidden focus:border-[#BAF91A] cursor-pointer"
          >
            {experiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.name} ({exp.task_name})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            disabled={!activeExp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono text-[#9CA8A3] hover:text-[#BAF91A] hover:border-[#BAF91A] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href={`/app/reports?id=${selectedExpId}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#BAF91A] text-[#101312] font-mono text-xs font-bold hover:bg-[#BAF91A]/90 transition-all shadow-[0_0_15px_rgba(186,249,26,0.25)] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full Report</span>
          </Link>
        </div>
      </div>

      {loading || !activeExp ? (
        <div className="py-20 text-center font-mono text-xs text-[#9CA8A3] space-y-2 rounded-2xl bg-[#161B19] border border-[#232B27]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#BAF91A]" />
          <p>Loading benchmark telemetry...</p>
        </div>
      ) : (
        <>
          {/* Integrity Assessment Banner */}
          <div className="p-6 rounded-2xl bg-[#161B19] border border-[#BAF91A]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#BAF91A] font-bold uppercase flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Scientific Assessment & Empirical Verdict
              </span>
              <span className="px-3 py-1 rounded-full bg-[#101312] border border-[#BAF91A]/40 font-mono text-[11px] text-[#BAF91A] font-bold">
                {activeExp.results.integrity_assessment.quantum_advantage_verdict}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-[#9CA8A3]">
              <div>
                Accuracy Delta vs RBF:{" "}
                <strong className="text-[#BAF91A]">
                  {activeExp.results.integrity_assessment.accuracy_differential_vs_rbf > 0 ? "+" : ""}
                  {(activeExp.results.integrity_assessment.accuracy_differential_vs_rbf * 100).toFixed(2)}%
                </strong>
              </div>
              <div>
                Accuracy Delta vs XGBoost:{" "}
                <strong className="text-white">
                  {activeExp.results.integrity_assessment.accuracy_differential_vs_xgb > 0 ? "+" : ""}
                  {(activeExp.results.integrity_assessment.accuracy_differential_vs_xgb * 100).toFixed(2)}%
                </strong>
              </div>
              <div>
                Quantum Runtime Overhead:{" "}
                <strong className="text-[#876DFF]">
                  {activeExp.results.integrity_assessment.computational_overhead_factor}x Classical Time
                </strong>
              </div>
            </div>

            <div className="pt-1 text-[11px] font-mono text-[#9CA8A3] leading-relaxed">
              <strong>Notice:</strong> {activeExp.results.integrity_assessment.reproducibility_notes}
            </div>
          </div>

          {/* Sortable Model Metrics Comparison Table */}
          <div className="p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-white">
                Model Performance Suite
              </h2>
              <span className="text-xs font-mono text-[#9CA8A3]">
                Click column headers to sort metrics
              </span>
            </div>

            <div className="overflow-x-auto border border-[#232B27] rounded-xl">
              <table className="w-full text-left text-xs font-mono whitespace-nowrap">
                <thead className="bg-[#101312] text-[#9CA8A3] border-b border-[#232B27]">
                  <tr>
                    <th className="p-3.5">Model Architecture</th>
                    <th
                      onClick={() => { setSortField("accuracy"); setSortAsc(!sortAsc); }}
                      className="p-3.5 cursor-pointer hover:text-[#BAF91A]"
                    >
                      Accuracy ↕
                    </th>
                    <th
                      onClick={() => { setSortField("balanced_accuracy"); setSortAsc(!sortAsc); }}
                      className="p-3.5 cursor-pointer hover:text-[#BAF91A]"
                    >
                      Balanced Acc ↕
                    </th>
                    <th
                      onClick={() => { setSortField("precision"); setSortAsc(!sortAsc); }}
                      className="p-3.5 cursor-pointer hover:text-[#BAF91A]"
                    >
                      Precision ↕
                    </th>
                    <th
                      onClick={() => { setSortField("recall"); setSortAsc(!sortAsc); }}
                      className="p-3.5 cursor-pointer hover:text-[#BAF91A]"
                    >
                      Recall ↕
                    </th>
                    <th
                      onClick={() => { setSortField("f1_score"); setSortAsc(!sortAsc); }}
                      className="p-3.5 cursor-pointer hover:text-[#BAF91A]"
                    >
                      F1-Score ↕
                    </th>
                    <th
                      onClick={() => { setSortField("roc_auc"); setSortAsc(!sortAsc); }}
                      className="p-3.5 cursor-pointer hover:text-[#BAF91A]"
                    >
                      ROC-AUC ↕
                    </th>
                    <th className="p-3.5 text-right">Train Time</th>
                    <th className="p-3.5 text-right">Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232B27]/60">
                  {sortedModels.map((m: any) => {
                    const isQuantum = m.type === "quantum";
                    return (
                      <tr key={m.name} className="hover:bg-[#1D2421]/60 transition-colors">
                        <td className="p-3.5 font-semibold text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isQuantum ? "bg-[#BAF91A]" : m.name.includes("XGBoost") ? "bg-[#876DFF]" : "bg-white"
                            }`}
                          />
                          <span className={isQuantum ? "text-[#BAF91A] font-bold" : ""}>{m.name}</span>
                        </td>
                        <td className="p-3.5 font-bold text-white tabular-nums">
                          {(m.metrics.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="p-3.5 text-[#9CA8A3] tabular-nums">
                          {(m.metrics.balanced_accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="p-3.5 text-[#9CA8A3] tabular-nums">
                          {(m.metrics.precision * 100).toFixed(1)}%
                        </td>
                        <td className="p-3.5 text-[#9CA8A3] tabular-nums">
                          {(m.metrics.recall * 100).toFixed(1)}%
                        </td>
                        <td className="p-3.5 text-[#BAF91A] font-bold tabular-nums">
                          {m.metrics.f1_score.toFixed(3)}
                        </td>
                        <td className="p-3.5 text-[#E2FF99] font-bold tabular-nums">
                          {m.metrics.roc_auc.toFixed(3)}
                        </td>
                        <td className="p-3.5 text-right text-[#9CA8A3] tabular-nums">
                          {m.runtime.train_time_ms.toFixed(1)} ms
                        </td>
                        <td className="p-3.5 text-right text-[#9CA8A3] tabular-nums">
                          {m.runtime.infer_time_ms.toFixed(1)} ms
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrices Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modelsList.map((m: any) => {
              const cm = m.confusion_matrix;
              return (
                <div key={m.name} className="p-5 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-white truncate">{m.name}</h3>
                    <span className="text-[10px] font-mono text-[#9CA8A3]">Confusion Matrix</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs pt-1">
                    <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27]">
                      <div className="text-[10px] text-[#9CA8A3]">TN (True Neg)</div>
                      <div className="text-base font-bold text-[#BAF91A] tabular-nums">{cm.true_negative}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27]">
                      <div className="text-[10px] text-[#9CA8A3]">FP (False Pos)</div>
                      <div className="text-base font-bold text-[#FF7474] tabular-nums">{cm.false_positive}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27]">
                      <div className="text-[10px] text-[#9CA8A3]">FN (False Neg)</div>
                      <div className="text-base font-bold text-[#FF7474] tabular-nums">{cm.false_negative}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27]">
                      <div className="text-[10px] text-[#9CA8A3]">TP (True Pos)</div>
                      <div className="text-base font-bold text-[#E2FF99] tabular-nums">{cm.true_positive}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA8A3] pt-1">
                    <span>Recall: <strong className="text-white">{(m.metrics.recall * 100).toFixed(1)}%</strong></span>
                    <span>Specificity: <strong className="text-white">{(m.metrics.specificity * 100).toFixed(1)}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SVG ROC Curves & Resource Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ROC & PR Curve Graph */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-display text-sm font-bold text-white">
                    {curveType === "roc" ? "Receiver Operating Characteristic (ROC)" : "Precision-Recall (PR) Curve"}
                  </h3>
                  <span className="text-[10px] font-mono text-[#9CA8A3]">
                    {curveType === "roc" ? "False Positive Rate vs True Positive Rate" : "Recall (Sensitivity) vs Precision (PPV)"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => setCurveType("roc")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer ${
                      curveType === "roc" ? "bg-[#1D2421] text-[#BAF91A] border border-[#BAF91A]/40 font-bold" : "text-[#9CA8A3] hover:text-white"
                    }`}
                  >
                    ROC Curve
                  </button>
                  <button
                    onClick={() => setCurveType("pr")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer ${
                      curveType === "pr" ? "bg-[#1D2421] text-[#BAF91A] border border-[#BAF91A]/40 font-bold" : "text-[#9CA8A3] hover:text-white"
                    }`}
                  >
                    PR Curve
                  </button>
                </div>
              </div>

              {/* Scalable SVG Coordinate Plot */}
              <div className="p-4 rounded-xl bg-[#101312] border border-[#232B27]">
                <svg viewBox="0 0 300 240" className="w-full h-56 font-mono text-[9px]">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="280" y2="20" stroke="#232B27" strokeDasharray="2,2" />
                  <line x1="40" y1="75" x2="280" y2="75" stroke="#232B27" strokeDasharray="2,2" />
                  <line x1="40" y1="130" x2="280" y2="130" stroke="#232B27" strokeDasharray="2,2" />
                  <line x1="40" y1="185" x2="280" y2="185" stroke="#232B27" />
                  <line x1="40" y1="20" x2="40" y2="185" stroke="#232B27" />

                  {/* Reference line */}
                  {curveType === "roc" && (
                    <line x1="40" y1="185" x2="280" y2="20" stroke="#9CA8A3" strokeDasharray="4,4" opacity="0.3" />
                  )}

                  {/* Axis Labels */}
                  <text x="35" y="190" textAnchor="end" fill="#9CA8A3">0.0</text>
                  <text x="35" y="105" textAnchor="end" fill="#9CA8A3">0.5</text>
                  <text x="35" y="25" textAnchor="end" fill="#9CA8A3">1.0</text>
                  <text x="40" y="202" fill="#9CA8A3">0.0</text>
                  <text x="155" y="202" fill="#9CA8A3">0.5</text>
                  <text x="270" y="202" fill="#9CA8A3">1.0</text>
                  <text x="160" y="222" textAnchor="middle" fill="#9CA8A3">
                    {curveType === "roc" ? "False Positive Rate (1 - Specificity)" : "Recall (True Positive Rate)"}
                  </text>

                  {/* Render Curves for each model */}
                  {modelsList.map((m: any) => {
                    const pts = curveType === "roc" ? m.curves?.roc_curve : m.curves?.pr_curve;
                    if (!pts || pts.length < 2) return null;
                    const strokeColor =
                      m.type === "quantum" ? "#BAF91A" : m.name.includes("XGBoost") ? "#876DFF" : "#FFFFFF";
                    const pathData = pts
                      .map((p: any, pIdx: number) => {
                        const xVal = curveType === "roc" ? p.fpr : p.recall;
                        const yVal = curveType === "roc" ? p.tpr : p.precision;
                        const x = 40 + (xVal || 0) * 240;
                        const y = 185 - (yVal || 0) * 165;
                        return `${pIdx === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ");

                    return (
                      <path
                        key={m.name}
                        d={pathData}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-3 border-t border-[#232B27]">
                  <div className="flex items-center gap-1.5 text-[#BAF91A]">
                    <span className="w-3 h-0.5 bg-[#BAF91A]" />
                    <span>Quantum SVM (ROC-AUC: {activeExp.results.models.quantum_svm?.metrics.roc_auc})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="w-3 h-0.5 bg-white" />
                    <span>Classical RBF (ROC-AUC: {activeExp.results.models.classical_rbf_svm?.metrics.roc_auc})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#876DFF]">
                    <span className="w-3 h-0.5 bg-[#876DFF]" />
                    <span>XGBoost (ROC-AUC: {activeExp.results.models.xgboost?.metrics.roc_auc})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Circuit Resource Summary Box */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-4">
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#BAF91A]" />
                <span>Quantum Circuit Budget Breakdown</span>
              </h3>

              <div className="p-4 rounded-xl bg-[#101312] border border-[#232B27] font-mono text-xs space-y-2.5 text-[#9CA8A3]">
                <div>
                  • Feature Map: <strong className="text-[#BAF91A]">{activeExp.config.feature_map}</strong>
                </div>
                <div>
                  • Qubits: <strong className="text-white">{activeExp.config.n_qubits} qubits</strong>
                </div>
                <div>
                  • Layers (Reps): <strong className="text-white">{activeExp.config.reps}</strong>
                </div>
                <div>
                  • Entanglement: <strong className="text-white">{activeExp.config.entanglement}</strong>
                </div>
                <div>
                  • Kernel Train Time: <strong className="text-[#E2FF99]">{activeExp.results.models.quantum_svm?.metadata.kernel_train_time_ms} ms</strong>
                </div>
                <div>
                  • Kernel Test Time: <strong className="text-[#E2FF99]">{activeExp.results.models.quantum_svm?.metadata.kernel_test_time_ms} ms</strong>
                </div>
                <div>
                  • Support Vectors Identified: <strong className="text-[#BAF91A]">{activeExp.results.models.quantum_svm?.metadata.support_vectors_count} samples</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ModelBenchmarksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-[#9CA8A3]">Loading benchmark data...</div>}>
      <BenchmarksContent />
    </Suspense>
  );
}
