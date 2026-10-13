"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Layers,
  Play,
  RotateCw,
  Sliders,
  Sparkles,
  Info,
  AlertTriangle,
  Zap,
  BarChart,
  CheckCircle2,
  Maximize2,
  Code2
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { previewCircuit, computeKernelMatrix, fetchDatasets, DatasetInfo } from "@/lib/api";

export default function QuantumLabPage() {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("tcga_luad_egfr.csv");

  // Quantum Feature Map Parameters
  const [featureMapType, setFeatureMapType] = useState<string>("ZZFeatureMap");
  const [numQubits, setNumQubits] = useState<number>(4);
  const [reps, setReps] = useState<number>(2);
  const [entanglement, setEntanglement] = useState<string>("linear");
  const [alpha, setAlpha] = useState<number>(2.0);
  const [nSamples, setNSamples] = useState<number>(16);

  // States
  const [circuitAnalysis, setCircuitAnalysis] = useState<any>(null);
  const [kernelResult, setKernelResult] = useState<any>(null);
  const [analyzingCircuit, setAnalyzingCircuit] = useState(false);
  const [computingKernel, setComputingKernel] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ i: number; j: number; val: number } | null>(null);
  const [viewMode, setViewMode] = useState<"schematic" | "ascii">("schematic");

  // Load datasets
  useEffect(() => {
    fetchDatasets().then((d) => {
      setDatasets(d);
      if (d.length > 0) setSelectedDataset(d[0].filename);
    }).catch(console.error);
  }, []);

  // Analyze circuit whenever parameters change
  const runCircuitAnalysis = async () => {
    setAnalyzingCircuit(true);
    try {
      const res = await previewCircuit({
        feature_dimension: numQubits,
        feature_map_type: featureMapType,
        reps: reps,
        entanglement: entanglement,
      });
      setCircuitAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingCircuit(false);
    }
  };

  useEffect(() => {
    runCircuitAnalysis();
  }, [featureMapType, numQubits, reps, entanglement]);

  // Compute genuine kernel matrix
  const handleComputeKernel = async () => {
    setComputingKernel(true);
    setSelectedCell(null);
    try {
      const featureCols = [
        "egfr_expression", "erbb2_expression", "met_expression", "tp53_expression",
        "kras_expression", "smoking_pack_years", "tumor_purity"
      ].slice(0, numQubits);

      const res = await computeKernelMatrix({
        filename: selectedDataset,
        target_col: selectedDataset.includes("kras") ? "kras_mutation" : selectedDataset.includes("lymph") ? "lymph_node_positive" : "egfr_mutation",
        feature_cols: featureCols,
        n_samples: nSamples,
        feature_map_type: featureMapType,
        reps: reps,
        entanglement: entanglement,
        alpha: alpha,
      });
      setKernelResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setComputingKernel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Laboratory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg bg-[#121619] border border-[#2A3335]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#F2F3EE]">Quantum Lab</h1>
            <span className="px-2 py-0.5 rounded bg-[#123438] border border-[#62E6E0]/40 text-[#62E6E0] text-[10px] font-mono">
              QISKIT 2.5 ENGINE
            </span>
            <SyntheticDataBadge isSynthetic={true} size="sm" />
          </div>
          <p className="text-xs font-mono text-[#A1AAA9]">
            Configure parameterized quantum circuits ($ZZFeatureMap$), analyze gate complexity, and compute Statevector Fidelity Kernel matrices $K(x_i, x_j)$.
          </p>
        </div>

        <button
          onClick={handleComputeKernel}
          disabled={computingKernel}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#62E6E0] text-[#0B0D0F] hover:bg-[#62E6E0]/90 disabled:opacity-50 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(98,230,224,0.2)]"
        >
          <Play className={`w-3.5 h-3.5 ${computingKernel ? "animate-spin" : ""}`} />
          <span>{computingKernel ? "Evaluating Circuits..." : "Compute Kernel Matrix"}</span>
        </button>
      </div>

      {/* Grid: Left Controls & Right Circuit Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Configuration */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#62E6E0] font-bold uppercase">
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Feature Map Parameters
              </span>
              <span className="text-[#A1AAA9] text-[10px] lowercase">interactive</span>
            </div>

            {/* Target Cohort Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#A1AAA9]">Dataset Cohort</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0]"
              >
                {datasets.map((d) => (
                  <option key={d.filename} value={d.filename}>
                    {d.name} ({d.sample_count} specimens)
                  </option>
                ))}
              </select>
            </div>

            {/* Feature Map Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#A1AAA9]">Feature Map Family</label>
              <select
                value={featureMapType}
                onChange={(e) => setFeatureMapType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0]"
              >
                <option value="ZZFeatureMap">ZZFeatureMap (Second-order Pauli-Z Entanglement)</option>
                <option value="ZFeatureMap">ZFeatureMap (First-order Non-entangling)</option>
                <option value="PauliFeatureMap">PauliFeatureMap (Custom [Z, ZZ] Generators)</option>
              </select>
            </div>

            {/* Qubit Count */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-[#A1AAA9]">
                <span>Qubits ($n = \dim(x)$)</span>
                <span className="text-[#62E6E0] font-bold">{numQubits} qubits ({Math.pow(2, numQubits)} state dim)</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={numQubits}
                onChange={(e) => setNumQubits(Number(e.target.value))}
                className="w-full accent-[#62E6E0] bg-[#0B0D0F] h-1.5 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#A1AAA9]">
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8 (bounded runtime)</span>
              </div>
            </div>

            {/* Circuit Repetitions (Reps) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-[#A1AAA9]">
                <span>Circuit Layers (Reps)</span>
                <span className="text-[#C4F36B] font-bold">{reps} reps</span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full accent-[#C4F36B] bg-[#0B0D0F] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Entanglement Strategy */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#A1AAA9]">Entanglement Topology</label>
              <div className="grid grid-cols-3 gap-2">
                {["linear", "circular", "full"].map((ent) => (
                  <button
                    key={ent}
                    onClick={() => setEntanglement(ent)}
                    className={`py-1.5 px-2 rounded text-xs font-mono capitalize transition-colors ${
                      entanglement === ent
                        ? "bg-[#191F22] text-[#62E6E0] border border-[#62E6E0]"
                        : "bg-[#0B0D0F] text-[#A1AAA9] border border-[#2A3335] hover:text-[#F2F3EE]"
                    }`}
                  >
                    {ent}
                  </button>
                ))}
              </div>
            </div>

            {/* Scaling Parameter Alpha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-[#A1AAA9]">
                <span>Phase Angle Multiplier ($\alpha$)</span>
                <span className="text-[#F2F3EE] font-bold">{alpha}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.5}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full accent-[#62E6E0] bg-[#0B0D0F] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Sample Cohort Bounding */}
            <div className="space-y-1.5 pt-2 border-t border-[#2A3335]">
              <div className="flex items-center justify-between text-xs font-mono text-[#A1AAA9]">
                <span>Sample Matrix Size ($N$)</span>
                <span className="text-[#F2F3EE] font-bold">{nSamples} × {nSamples} ({nSamples * nSamples} evaluations)</span>
              </div>
              <input
                type="range"
                min={8}
                max={32}
                step={4}
                value={nSamples}
                onChange={(e) => setNSamples(Number(e.target.value))}
                className="w-full accent-[#62E6E0] bg-[#0B0D0F] h-1.5 rounded cursor-pointer"
              />
              <div className="text-[10px] text-[#A1AAA9] font-mono">
                Enforcing bounded sample limits maintains sub-second simulation responsiveness.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Genuine Circuit Resource Breakdown & Diagram */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#62E6E0] font-bold uppercase">
                <Zap className="w-4 h-4" />
                Compiled Quantum Circuit Analysis
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setViewMode("schematic")}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    viewMode === "schematic" ? "bg-[#191F22] text-[#62E6E0] border border-[#62E6E0]" : "text-[#A1AAA9] hover:text-[#F2F3EE]"
                  }`}
                >
                  Schematic
                </button>
                <button
                  onClick={() => setViewMode("ascii")}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    viewMode === "ascii" ? "bg-[#191F22] text-[#62E6E0] border border-[#62E6E0]" : "text-[#A1AAA9] hover:text-[#F2F3EE]"
                  }`}
                >
                  Raw Basis
                </button>
              </div>
            </div>

            {/* Resource Stats Grid */}
            {circuitAnalysis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-[#0B0D0F] border border-[#2A3335] space-y-0.5">
                  <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Circuit Depth</span>
                  <div className="font-display text-lg font-bold text-[#F2F3EE]">
                    {circuitAnalysis.depth}
                  </div>
                  <span className="text-[10px] font-mono text-[#A1AAA9]">Layers</span>
                </div>

                <div className="p-3 rounded bg-[#0B0D0F] border border-[#2A3335] space-y-0.5">
                  <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Total Gates</span>
                  <div className="font-display text-lg font-bold text-[#62E6E0]">
                    {circuitAnalysis.total_gates}
                  </div>
                  <span className="text-[10px] font-mono text-[#A1AAA9]">Elementary Ops</span>
                </div>

                <div className="p-3 rounded bg-[#0B0D0F] border border-[#2A3335] space-y-0.5">
                  <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">2-Qubit Entanglers</span>
                  <div className="font-display text-lg font-bold text-[#C4F36B]">
                    {circuitAnalysis.two_qubit_gates}
                  </div>
                  <span className="text-[10px] font-mono text-[#A1AAA9]">CX/CZ Gates</span>
                </div>

                <div className="p-3 rounded bg-[#0B0D0F] border border-[#2A3335] space-y-0.5">
                  <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Parameters Bound</span>
                  <div className="font-display text-lg font-bold text-[#F2F3EE]">
                    {circuitAnalysis.num_parameters}
                  </div>
                  <span className="text-[10px] font-mono text-[#A1AAA9]">Continuous Phase</span>
                </div>
              </div>
            )}

            {/* Circuit Visualization Display */}
            {viewMode === "schematic" ? (
              /* High-Quality Interactive SVG Circuit Canvas */
              <div className="p-4 rounded bg-[#0B0D0F] border border-[#2A3335] overflow-x-auto">
                <svg
                  viewBox={`0 0 540 ${numQubits * 48 + 30}`}
                  className="w-full min-w-[500px] h-auto font-mono text-[10px]"
                >
                  {/* Qubit Wires */}
                  {Array.from({ length: numQubits }).map((_, q) => {
                    const y = 30 + q * 48;
                    return (
                      <g key={q}>
                        {/* Qubit Label */}
                        <text x="15" y={y + 4} fill="#62E6E0" fontWeight="bold">
                          q[{q}]
                        </text>
                        {/* Wire line */}
                        <line x1="55" y1={y} x2="520" y2={y} stroke="#2A3335" strokeWidth="1.5" />

                        {/* Hadamard Gate */}
                        <rect x="75" y={y - 12} width="24" height="24" rx="2" fill="#121619" stroke="#62E6E0" />
                        <text x="87" y={y + 4} textAnchor="middle" fill="#F2F3EE">H</text>

                        {/* Rz Parameterized Gate */}
                        <rect x="125" y={y - 12} width="48" height="24" rx="2" fill="#123438" stroke="#62E6E0" />
                        <text x="149" y={y + 4} textAnchor="middle" fill="#62E6E0" fontSize="9">Rz(x_{q})</text>

                        {/* Entanglement Stage Rep 1 */}
                        {q < numQubits - 1 && (
                          <g>
                            {/* CNOT Control dot */}
                            <circle cx="210" cy={y} r="4" fill="#C4F36B" />
                            {/* Bridge vertical line */}
                            <line x1="210" y1={y} x2="210" y2={y + 48} stroke="#C4F36B" strokeWidth="1.5" />
                            {/* Target circle */}
                            <circle cx="210" cy={y + 48} r="6" fill="#0B0D0F" stroke="#C4F36B" strokeWidth="1.5" />
                            <text x="210" y={y + 51} textAnchor="middle" fill="#C4F36B" fontSize="9">+</text>
                          </g>
                        )}

                        {/* Second Rz Rotation Layer */}
                        <rect x="250" y={y - 12} width="52" height="24" rx="2" fill="#191F22" stroke="#2A3335" />
                        <text x="276" y={y + 4} textAnchor="middle" fill="#A1AAA9" fontSize="8">Rzz(x_i·x_j)</text>

                        {/* Entanglement Stage Rep 2 */}
                        {q < numQubits - 1 && reps >= 2 && (
                          <g>
                            <circle cx="340" cy={y} r="4" fill="#C4F36B" />
                            <line x1="340" y1={y} x2="340" y2={y + 48} stroke="#C4F36B" strokeWidth="1.5" />
                            <circle cx="340" cy={y + 48} r="6" fill="#0B0D0F" stroke="#C4F36B" strokeWidth="1.5" />
                            <text x="340" y={y + 51} textAnchor="middle" fill="#C4F36B" fontSize="9">+</text>
                          </g>
                        )}

                        {/* Final Phase Encoding */}
                        <rect x="380" y={y - 12} width="44" height="24" rx="2" fill="#123438" stroke="#62E6E0" />
                        <text x="402" y={y + 4} textAnchor="middle" fill="#62E6E0" fontSize="9">Rz(2x_{q})</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              /* Raw ASCII Drawing View */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#A1AAA9]">
                  <span>Decomposed Elementary Gate Sequence</span>
                  <span className="text-[10px] text-[#62E6E0]">Qiskit 2.5 Text Output</span>
                </div>
                <div className="p-4 rounded bg-[#0B0D0F] border border-[#2A3335] font-mono text-[11px] overflow-x-auto text-[#62E6E0] leading-snug whitespace-pre select-text">
                  {circuitAnalysis?.circuit_ascii || "Loading circuit drawing..."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Fidelity Quantum Kernel Heatmap */}
      <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3335] pb-4">
          <div className="space-y-0.5">
            <h3 className="font-display text-base font-bold text-[#F2F3EE] flex items-center gap-2">
              <span>Fidelity Quantum Kernel Matrix</span>
              <span className="text-xs font-mono text-[#62E6E0]">{"K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|²"}</span>
            </h3>
            <p className="text-xs text-[#A1AAA9]">
              Hover or click any coordinate cell to inspect state overlap fidelity between specimen $i$ and specimen $j$.
            </p>
          </div>

          {kernelResult && (
            <div className="flex items-center gap-4 text-xs font-mono text-[#A1AAA9]">
              <span>Runtime: <strong className="text-[#C4F36B]">{kernelResult.runtime_seconds}s</strong></span>
              <span>Evaluations: <strong className="text-[#F2F3EE]">{kernelResult.total_evaluations}</strong></span>
            </div>
          )}
        </div>

        {!kernelResult ? (
          <div className="py-16 text-center text-[#A1AAA9] space-y-3 font-mono text-xs border border-[#2A3335] rounded bg-[#0B0D0F]">
            <p>Click "Compute Kernel Matrix" above to execute genuine Qiskit statevector simulation.</p>
            <button
              onClick={handleComputeKernel}
              className="px-4 py-2 rounded bg-[#191F22] border border-[#62E6E0] text-[#62E6E0] font-bold hover:bg-[#62E6E0] hover:text-[#0B0D0F] transition-colors"
            >
              Compute Sample Kernel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Heatmap Grid */}
            <div className="lg:col-span-8 overflow-x-auto p-4 rounded bg-[#0B0D0F] border border-[#2A3335]">
              <div
                className="grid gap-1 min-w-[320px]"
                style={{
                  gridTemplateColumns: `repeat(${kernelResult.kernel_matrix[0].length}, minmax(0, 1fr))`,
                }}
              >
                {kernelResult.kernel_matrix.map((row: number[], rIdx: number) =>
                  row.map((val: number, cIdx: number) => {
                    const isDiag = rIdx === cIdx;
                    const isSelected = selectedCell?.i === rIdx && selectedCell?.j === cIdx;
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => setSelectedCell({ i: rIdx, j: cIdx, val })}
                        style={{
                          backgroundColor: isDiag
                            ? "#62E6E0"
                            : `rgba(98, 230, 224, ${val * 0.85})`,
                        }}
                        className={`aspect-square rounded-xs cursor-pointer transition-transform hover:scale-125 ${
                          isSelected ? "ring-2 ring-white scale-125 z-10" : ""
                        }`}
                        title={`K[${rIdx}, ${cIdx}] = ${val.toFixed(4)}`}
                      />
                    );
                  })
                )}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#A1AAA9] pt-4">
                <span>Fidelity 0.0 (Orthogonal States)</span>
                <div className="w-32 h-2.5 rounded bg-gradient-to-r from-transparent via-[#62E6E0]/50 to-[#62E6E0] border border-[#2A3335]" />
                <span className="text-[#62E6E0] font-bold">1.0 (Identical State)</span>
              </div>
            </div>

            {/* Cell Inspection Panel & Concentration Gauge */}
            <div className="lg:col-span-4 p-5 rounded bg-[#191F22] border border-[#2A3335] space-y-4">
              <span className="text-xs font-mono text-[#62E6E0] font-bold uppercase">
                Kernel Coordinate Inspector
              </span>

              {selectedCell ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded bg-[#0B0D0F] border border-[#2A3335] space-y-1">
                    <div className="text-[11px] text-[#A1AAA9]">Selected Specimen Pair:</div>
                    <div className="text-[#F2F3EE] font-bold text-sm">
                      Specimen #{selectedCell.i} ↔ Specimen #{selectedCell.j}
                    </div>
                    <div className="text-base font-bold text-[#62E6E0] pt-1">
                      Fidelity K = {selectedCell.val.toFixed(5)}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#A1AAA9] leading-relaxed">
                    {selectedCell.i === selectedCell.j
                      ? "Self-fidelity diagonal element. Normalization guarantees ⟨ψ|ψ⟩ = 1.0."
                      : `Statevector transition amplitude between sample ${selectedCell.i} and sample ${selectedCell.j}. Evaluates non-linear inner product in ${Math.pow(2, numQubits)}-dimensional Hilbert space.`}
                  </p>
                </div>
              ) : (
                <p className="text-xs font-mono text-[#A1AAA9]">
                  Click any cell in the heatmap to view exact state overlap fidelity and sample details.
                </p>
              )}

              {/* Spectral Variance & Concentration Telemetry */}
              <div className="pt-2 border-t border-[#2A3335] space-y-1.5 font-mono text-[11px] text-[#A1AAA9]">
                <div className="flex justify-between">
                  <span>Off-diagonal Mean:</span>
                  <strong className="text-[#F2F3EE]">{kernelResult.stats.off_diagonal_mean}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Off-diagonal Std Dev:</span>
                  <strong className="text-[#C4F36B]">{kernelResult.stats.off_diagonal_std}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Min / Max Fidelity:</span>
                  <strong className="text-[#F2F3EE]">{kernelResult.stats.min_fidelity} / {kernelResult.stats.max_fidelity}</strong>
                </div>
              </div>

              {/* Concentration Warning */}
              {kernelResult.concentration_warning && (
                <div className="p-3 rounded bg-[#2E2413] border border-[#F0B86B] text-[11px] font-mono text-[#F0B86B] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#F0B86B]" />
                  <span>{kernelResult.concentration_warning}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
