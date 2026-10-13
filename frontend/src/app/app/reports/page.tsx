"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  FlaskConical,
  ArrowRight
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { fetchExperiments, fetchExperimentDetail, fetchHtmlReport, ExperimentSummary } from "@/lib/api";

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>(initialId || "");
  const [activeExp, setActiveExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCircuit, setCopiedCircuit] = useState(false);

  useEffect(() => {
    fetchExperiments()
      .then((exps) => {
        setExperiments(exps);
        if (!selectedExpId && exps.length > 0) {
          setSelectedExpId(exps[0].id);
        }
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

  const handleDownloadHtml = async () => {
    if (!activeExp) return;
    try {
      const res = await fetchHtmlReport(activeExp.id);
      const blob = new Blob([res.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QUANTUMON_Report_${activeExp.id.slice(0, 8)}.html`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCircuit = () => {
    const circuitText = activeExp?.results?.models?.quantum_svm?.metadata?.circuit_analysis?.circuit_ascii || "";
    if (circuitText) {
      navigator.clipboard.writeText(circuitText);
      setCopiedCircuit(true);
      setTimeout(() => setCopiedCircuit(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg bg-[#121619] border border-[#2A3335] print:hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#62E6E0] font-semibold">
              SCIENTIFIC AUDIT DOSSIER // EXPORT
            </span>
            {activeExp && <SyntheticDataBadge isSynthetic={activeExp.is_synthetic ?? true} size="sm" />}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F2F3EE]">
            Scientific Audit Reports
          </h1>
          <p className="text-xs text-[#A1AAA9] max-w-xl leading-relaxed">
            Publication-grade experimental dossiers detailing quantum circuit gates, tri-model benchmark metrics, and data leakage safeguards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {experiments.length > 0 && (
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
          )}

          <button
            onClick={handleDownloadHtml}
            disabled={!activeExp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#62E6E0] text-[#0B0D0F] font-mono text-xs font-bold hover:bg-[#62E6E0]/90 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!activeExp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#191F22] border border-[#2A3335] text-xs font-mono text-[#A1AAA9] hover:text-[#F2F3EE] hover:border-[#62E6E0] disabled:opacity-40 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-[#A1AAA9] space-y-3 bg-[#121619] rounded-lg border border-[#2A3335]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#62E6E0]" />
          <p>Compiling scientific audit trail...</p>
        </div>
      ) : !activeExp ? (
        <div className="p-12 text-center rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
          <FlaskConical className="w-10 h-10 text-[#62E6E0] mx-auto opacity-70" />
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-[#F2F3EE]">No Experiment Selected</h3>
            <p className="text-xs text-[#A1AAA9] max-w-md mx-auto leading-relaxed">
              Launch a training run to generate printable audit reports with exact circuit blueprints and comparative metrics.
            </p>
          </div>
          <Link
            href="/app/experiments/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#62E6E0] text-[#0B0D0F] font-mono text-xs font-bold hover:bg-[#62E6E0]/90 transition-colors"
          >
            <span>Create New Experiment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* Report Paper Document */
        <div className="p-8 sm:p-10 rounded-lg bg-[#121619] border border-[#2A3335] space-y-8 max-w-4xl mx-auto text-xs font-mono leading-relaxed print:p-0 print:border-none print:bg-white print:text-black">
          {/* Report Header */}
          <div className="border-b border-[#2A3335] pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-[#62E6E0] font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#62E6E0]" />
                QUANTUMON SCIENTIFIC EXPERIMENT DOSSIER
              </span>
              <SyntheticDataBadge isSynthetic={activeExp.is_synthetic} size="sm" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F2F3EE] tracking-tight">
                {activeExp.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#A1AAA9]">
                <span>Accession ID: <strong className="text-[#F2F3EE]">{activeExp.id}</strong></span>
                <span>•</span>
                <span>Timestamp: {activeExp.created_at}</span>
                <span>•</span>
                <span>Task: <strong className="text-[#62E6E0]">{activeExp.task_name}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary & Verdict */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#2A3335] pb-2">
              <span className="text-xs font-bold text-[#62E6E0] uppercase tracking-wider">
                1. Executive Summary & Integrity Assessment
              </span>
            </div>

            <div className="p-4 rounded-md bg-[#0B0D0F] border border-[#2A3335] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3335] pb-3">
                <span className="text-[#A1AAA9]">Empirical Quantum Verdict:</span>
                <span className="text-sm font-bold text-[#62E6E0]">
                  {activeExp.results.integrity_assessment.quantum_advantage_verdict}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[#A1AAA9]">
                <div>
                  <div className="text-[10px] uppercase">Accuracy vs RBF SVM:</div>
                  <div className="font-bold text-[#F2F3EE] text-sm tabular-nums">
                    {(activeExp.results.integrity_assessment.accuracy_differential_vs_rbf * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">Accuracy vs XGBoost:</div>
                  <div className="font-bold text-[#F2F3EE] text-sm tabular-nums">
                    {(activeExp.results.integrity_assessment.accuracy_differential_vs_xgb * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">Compute Overhead Factor:</div>
                  <div className="font-bold text-[#F2F3EE] text-sm tabular-nums">
                    {activeExp.results.integrity_assessment.computational_overhead_factor}x Classical Baseline
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A3335] text-[11px] text-[#F0B86B]">
                {activeExp.results.integrity_assessment.reproducibility_notes}
              </div>
            </div>
          </div>

          {/* Section 2: Model Performance Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#2A3335] pb-2">
              <span className="text-xs font-bold text-[#62E6E0] uppercase tracking-wider">
                2. Comparative Quantitative Metrics
              </span>
            </div>

            <div className="overflow-x-auto border border-[#2A3335] rounded-md">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#0B0D0F] text-[#A1AAA9] border-b border-[#2A3335]">
                  <tr>
                    <th className="p-3">Model Architecture</th>
                    <th className="p-3 text-right">Accuracy</th>
                    <th className="p-3 text-right">Balanced Acc</th>
                    <th className="p-3 text-right">Precision</th>
                    <th className="p-3 text-right">Recall</th>
                    <th className="p-3 text-right">F1-Score</th>
                    <th className="p-3 text-right">ROC-AUC</th>
                    <th className="p-3 text-right">Train Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3335]/40 text-[#F2F3EE] tabular-nums">
                  {Object.values(activeExp.results.models).map((m: any) => (
                    <tr key={m.name} className="hover:bg-[#191F22]/50">
                      <td className="p-3 font-bold text-[#62E6E0]">{m.name}</td>
                      <td className="p-3 text-right">{(m.metrics.accuracy * 100).toFixed(1)}%</td>
                      <td className="p-3 text-right">{(m.metrics.balanced_accuracy * 100).toFixed(1)}%</td>
                      <td className="p-3 text-right">{(m.metrics.precision * 100).toFixed(1)}%</td>
                      <td className="p-3 text-right">{(m.metrics.recall * 100).toFixed(1)}%</td>
                      <td className="p-3 text-right text-[#C4F36B] font-bold">{m.metrics.f1_score.toFixed(3)}</td>
                      <td className="p-3 text-right text-[#62E6E0] font-bold">{m.metrics.roc_auc.toFixed(3)}</td>
                      <td className="p-3 text-right text-[#A1AAA9]">{m.runtime.train_time_ms.toFixed(1)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Quantum Circuit Representation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A3335] pb-2">
              <span className="text-xs font-bold text-[#62E6E0] uppercase tracking-wider">
                3. Quantum Feature Map Blueprint & Gate Telemetry
              </span>
              <button
                type="button"
                onClick={handleCopyCircuit}
                className="flex items-center gap-1 text-[11px] font-mono text-[#A1AAA9] hover:text-[#62E6E0] transition-colors print:hidden"
              >
                {copiedCircuit ? <Check className="w-3.5 h-3.5 text-[#C4F36B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCircuit ? "Copied" : "Copy ASCII"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[#A1AAA9] text-[11px]">
              <span>Feature Map: <strong className="text-[#F2F3EE]">{activeExp.config.feature_map}</strong></span>
              <span>•</span>
              <span>Qubits: <strong className="text-[#62E6E0]">{activeExp.config.n_qubits}</strong></span>
              <span>•</span>
              <span>Reps: <strong className="text-[#F2F3EE]">{activeExp.config.reps}</strong></span>
              <span>•</span>
              <span>Entanglement: <strong className="text-[#F2F3EE]">{activeExp.config.entanglement}</strong></span>
            </div>

            <div className="p-4 rounded-md bg-[#0B0D0F] border border-[#2A3335] text-[10px] overflow-x-auto text-[#62E6E0] whitespace-pre font-mono leading-tight">
              {activeExp.results.models.quantum_svm?.metadata?.circuit_analysis?.circuit_ascii || "Circuit drawing unavailable"}
            </div>
          </div>

          {/* Section 4: Provenance & Reproducibility Specifications */}
          <div className="space-y-3 border-t border-[#2A3335] pt-5 text-[11px] text-[#A1AAA9]">
            <span className="text-xs font-bold text-[#F2F3EE] uppercase tracking-wider block">
              4. Provenance & Reproducibility Notes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-md bg-[#0B0D0F] border border-[#2A3335]">
              <div>• Dataset: <strong className="text-[#F2F3EE]">{activeExp.config.filename}</strong></div>
              <div>• Samples: <strong className="text-[#F2F3EE]">{activeExp.results.train_sample_count} train / {activeExp.results.test_sample_count} test</strong></div>
              <div>• Deterministic Seed: <strong className="text-[#F2F3EE]">{activeExp.config.random_seed}</strong></div>
              <div>• Normalization: <strong className="text-[#F2F3EE]">{activeExp.config.scaler_type} (Train-fitted strictly)</strong></div>
              <div className="sm:col-span-2">
                • Bound Biomarkers: <strong className="text-[#F2F3EE]">{activeExp.results.features_used.join(", ")}</strong>
              </div>
              <div className="sm:col-span-2">
                • Quantum Framework: <strong className="text-[#62E6E0]">
                  {activeExp.results.models.quantum_svm?.metadata?.circuit_analysis?.qiskit_version
                    ? `Qiskit v${activeExp.results.models.quantum_svm.metadata.circuit_analysis.qiskit_version}`
                    : "Qiskit 2.5"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-[#A1AAA9]">Loading report data...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
