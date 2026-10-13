"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Cpu,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCw,
  Database,
  Check,
  Sparkles
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { fetchTasks, fetchDatasets, profileDataset, runExperiment, TaskInfo, DatasetInfo, DatasetProfile } from "@/lib/api";

const STEPS = [
  { id: 1, title: "1. Research Task & Cohort" },
  { id: 2, title: "2. Features & Partitioning" },
  { id: 3, title: "3. Algorithm Architectures" },
  { id: 4, title: "4. Resource Budget & Launch" }
];

export default function ExperimentBuilderPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);

  // Form State
  const [expName, setExpName] = useState("Quantum Kernel Cancer Benchmark Run");
  const [selectedTask, setSelectedTask] = useState<string>("tcga_luad_egfr");
  const [selectedFile, setSelectedFile] = useState<string>("tcga_luad_egfr.csv");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "egfr_expression", "erbb2_expression", "met_expression", "tp53_expression", "kras_expression", "smoking_pack_years"
  ]);
  const [testSize, setTestSize] = useState<number>(0.25);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [scalerType, setScalerType] = useState<string>("minmax");
  const [nQubits, setNQubits] = useState<number>(6);
  const [maxSamples, setMaxSamples] = useState<number>(100);

  // Quantum Config
  const [featureMap, setFeatureMap] = useState<string>("ZZFeatureMap");
  const [reps, setReps] = useState<number>(2);
  const [entanglement, setEntanglement] = useState<string>("linear");
  const [alpha, setAlpha] = useState<number>(2.0);
  const [quantumC, setQuantumC] = useState<number>(1.0);

  // Classical Config
  const [rbfC, setRbfC] = useState<number>(1.0);
  const [rbfGamma, setRbfGamma] = useState<string>("scale");
  const [xgbEstimators, setXgbEstimators] = useState<number>(60);
  const [xgbMaxDepth, setXgbMaxDepth] = useState<number>(3);
  const [xgbLearningRate, setXgbLearningRate] = useState<number>(0.08);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks().then(setTasks).catch(console.error);
    fetchDatasets().then(setDatasets).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      profileDataset(selectedFile, selectedTask).then((p) => {
        setProfile(p);
        // Default select top numeric features
        if (p.numeric_columns.length > 0) {
          setSelectedFeatures(p.numeric_columns.slice(0, 6));
        }
      }).catch(console.error);
    }
  }, [selectedFile, selectedTask]);

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      if (selectedFeatures.length > 2) {
        setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleSelectTopN = (n: number) => {
    if (profile?.numeric_columns) {
      const top = profile.numeric_columns.slice(0, n);
      setSelectedFeatures(top);
      setNQubits(Math.min(8, top.length));
    }
  };

  const handleLaunch = async () => {
    setIsRunning(true);
    setRunError(null);
    try {
      const activeTaskInfo = tasks.find((t) => t.id === selectedTask);
      const targetCol = activeTaskInfo?.target_col || (selectedTask.includes("kras") ? "kras_mutation" : selectedTask.includes("lymph") ? "lymph_node_positive" : "egfr_mutation");
      const patientIdCol = activeTaskInfo?.patient_id_col || "patient_id";

      const payload = {
        name: expName,
        task_id: selectedTask,
        filename: selectedFile,
        target_col: targetCol,
        feature_cols: selectedFeatures,
        patient_id_col: patientIdCol,
        test_size: testSize,
        random_seed: randomSeed,
        scaler_type: scalerType,
        n_qubits: nQubits,
        feature_reduction: "select_k_best",
        max_samples: maxSamples,
        feature_map: featureMap,
        reps: reps,
        entanglement: entanglement,
        alpha: alpha,
        quantum_c: quantumC,
        rbf_c: rbfC,
        rbf_gamma: rbfGamma,
        xgb_n_estimators: xgbEstimators,
        xgb_max_depth: xgbMaxDepth,
        xgb_learning_rate: xgbLearningRate,
      };

      const result = await runExperiment(payload);
      router.push(`/app/benchmarks?id=${result.id}`);
    } catch (err: any) {
      setRunError(err.message || "Failed to execute experiment");
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg bg-[#121619] border border-[#2A3335]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#62E6E0] font-semibold">
              EXPERIMENT BUILDER // DOMAIN 2 PIPELINE
            </span>
            <SyntheticDataBadge isSynthetic={true} size="sm" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F2F3EE]">
            Tri-Model Benchmark Configuration
          </h1>
          <p className="text-xs text-[#A1AAA9] max-w-xl leading-relaxed">
            Configure dataset partitioning, feature normalization bounds, and quantum circuit hyper-parameters for rigorous clinical benchmarking.
          </p>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-[#2A3335] pb-4">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`cursor-pointer p-3 rounded text-xs font-mono transition-all border ${
                isActive
                  ? "bg-[#191F22] border-[#62E6E0] text-[#62E6E0] font-bold shadow-[0_0_10px_rgba(98,230,224,0.1)]"
                  : isDone
                  ? "bg-[#121619] border-[#C4F36B]/60 text-[#C4F36B]"
                  : "bg-[#0B0D0F] border-[#2A3335] text-[#A1AAA9] hover:border-[#A1AAA9]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0">
                  {isDone ? "✓" : step.id}
                </span>
                <span className="truncate">{step.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Prediction Task & Cohort */}
      {currentStep === 1 && (
        <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#F2F3EE]">
              Step 1: Choose Research Task & Dataset
            </h2>
            <p className="text-xs text-[#A1AAA9] font-mono">
              Validate clinical task target semantics and assign the baseline cohort.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-[#A1AAA9]">Experiment Identifier / Title</label>
            <input
              type="text"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {tasks.map((task) => {
              const isSelected = selectedTask === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task.id);
                    setSelectedFile(task.default_dataset);
                  }}
                  className={`cursor-pointer p-4 rounded-lg border transition-all space-y-2.5 ${
                    isSelected
                      ? "bg-[#191F22] border-[#62E6E0] shadow-[0_0_15px_rgba(98,230,224,0.15)]"
                      : "bg-[#0B0D0F] border-[#2A3335] hover:border-[#A1AAA9]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#62E6E0] uppercase font-bold tracking-wider">
                      {task.id.replace("_", "-")}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#62E6E0]" />}
                  </div>
                  <h3 className="font-display text-sm font-bold text-[#F2F3EE]">
                    {task.name}
                  </h3>
                  <p className="text-[11px] text-[#A1AAA9] leading-relaxed">
                    {task.description}
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-[#C4F36B] border-t border-[#2A3335]/60">
                    Target: {task.target_col} ({task.positive_label})
                  </div>
                </div>
              );
            })}
          </div>

          {profile && (
            <div className="p-4 rounded-md bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono space-y-2">
              <div className="text-[#62E6E0] font-bold">Selected Dataset Profile:</div>
              <div className="text-[#A1AAA9] space-y-1 leading-relaxed">
                <div>• Cohort File: <strong className="text-[#F2F3EE]">{profile.filename}</strong> ({profile.row_count} specimens, {profile.column_count} features)</div>
                <div>• Research Target: <strong className="text-[#F2F3EE]">{profile.target_col}</strong> | Patient ID: <strong className="text-[#F2F3EE]">{profile.patient_id_col || "None"}</strong></div>
                <div>• Patient-Level Split Guard: <strong className="text-[#C4F36B]">{profile.patient_stats ? "Enforced (Zero Patient Overlap)" : "Standard"}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Feature Selection & Preprocessing */}
      {currentStep === 2 && (
        <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#F2F3EE]">
              Step 2: Features, Partitioning & Scaling
            </h2>
            <p className="text-xs text-[#A1AAA9] font-mono">
              Scalers and feature selectors are fitted strictly on training data to prevent leakage.
            </p>
          </div>

          {/* Feature Selector with Quick Presets */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono text-[#A1AAA9] flex items-center gap-2">
                <span>Eligible Clinical & Molecular Features:</span>
                <span className="text-[#62E6E0] font-bold">
                  {selectedFeatures.length} selected (Maps to {nQubits} Qubits)
                </span>
              </label>

              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleSelectTopN(6)}
                  className="px-2.5 py-1 rounded bg-[#191F22] border border-[#2A3335] text-[#A1AAA9] hover:text-[#62E6E0] hover:border-[#62E6E0] transition-colors"
                >
                  Select Top 6
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (profile?.numeric_columns) {
                      setSelectedFeatures(profile.numeric_columns);
                      setNQubits(Math.min(8, profile.numeric_columns.length));
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-[#191F22] border border-[#2A3335] text-[#A1AAA9] hover:text-[#62E6E0] hover:border-[#62E6E0] transition-colors"
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2.5 rounded-md bg-[#0B0D0F] border border-[#2A3335]">
              {profile?.numeric_columns.map((feat) => {
                const isChecked = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`p-2 rounded text-left text-xs font-mono transition-colors flex items-center justify-between ${
                      isChecked
                        ? "bg-[#191F22] text-[#62E6E0] border border-[#62E6E0]"
                        : "bg-[#121619] text-[#A1AAA9] border border-transparent hover:text-[#F2F3EE]"
                    }`}
                  >
                    <span className="truncate">{feat}</span>
                    {isChecked && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Partition & Preprocessing settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#A1AAA9]">Test Partition Ratio</label>
              <select
                value={testSize}
                onChange={(e) => setTestSize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0]"
              >
                <option value={0.20}>20% Held-Out Test Set</option>
                <option value={0.25}>25% Held-Out Test Set (Standard)</option>
                <option value={0.30}>30% Held-Out Test Set</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#A1AAA9]">Feature Scaling Method</label>
              <select
                value={scalerType}
                onChange={(e) => setScalerType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0]"
              >
                <option value="minmax">MinMax [0, π] (Recommended for Angle Encoding)</option>
                <option value="standard">StandardScaler (Zero Mean, Unit Variance)</option>
                <option value="robust">RobustScaler (Median / IQR)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#A1AAA9]">Deterministic Seed</label>
              <input
                type="number"
                value={randomSeed}
                onChange={(e) => setRandomSeed(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0] tabular-nums"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-[#191F22] border border-[#C4F36B]/40 text-xs font-mono text-[#C4F36B] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>GroupShuffleSplit enforcement active: Zero patient overlap occurs across train and test partitions.</span>
          </div>
        </div>
      )}

      {/* STEP 3: Model Architectures & Budget */}
      {currentStep === 3 && (
        <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#F2F3EE]">
              Step 3: Quantum Circuit & Classical Hyperparameters
            </h2>
            <p className="text-xs text-[#A1AAA9] font-mono">
              Configure parameters for all three competing algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quantum SVM */}
            <div className="p-4 rounded-lg bg-[#0B0D0F] border border-[#62E6E0]/60 space-y-3">
              <span className="text-xs font-mono text-[#62E6E0] font-bold uppercase tracking-wider block">
                1. Quantum-Kernel SVM
              </span>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Qubits (n)</label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={nQubits}
                  onChange={(e) => setNQubits(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Layers (Reps)</label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Entanglement</label>
                <select
                  value={entanglement}
                  onChange={(e) => setEntanglement(e.target.value)}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                >
                  <option value="linear">Linear (Nearest Neighbor)</option>
                  <option value="circular">Circular (Periodic)</option>
                  <option value="full">Full All-to-All</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Regularization C</label>
                <input
                  type="number"
                  step={0.5}
                  value={quantumC}
                  onChange={(e) => setQuantumC(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                />
              </div>
            </div>

            {/* Classical RBF */}
            <div className="p-4 rounded-lg bg-[#0B0D0F] border border-[#2A3335] space-y-3">
              <span className="text-xs font-mono text-[#F2F3EE] font-bold uppercase tracking-wider block">
                2. Classical RBF SVM
              </span>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Soft-Margin Penalty C</label>
                <input
                  type="number"
                  step={0.5}
                  value={rbfC}
                  onChange={(e) => setRbfC(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Kernel Gamma</label>
                <select
                  value={rbfGamma}
                  onChange={(e) => setRbfGamma(e.target.value)}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                >
                  <option value="scale">Scale (1 / (n_features * var))</option>
                  <option value="auto">Auto (1 / n_features)</option>
                </select>
              </div>
            </div>

            {/* XGBoost */}
            <div className="p-4 rounded-lg bg-[#0B0D0F] border border-[#C4F36B]/60 space-y-3">
              <span className="text-xs font-mono text-[#C4F36B] font-bold uppercase tracking-wider block">
                3. XGBoost Classifier
              </span>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Boosting Trees (n_estimators)</label>
                <input
                  type="number"
                  value={xgbEstimators}
                  onChange={(e) => setXgbEstimators(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Max Tree Depth</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={xgbMaxDepth}
                  onChange={(e) => setXgbMaxDepth(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#A1AAA9]">Learning Rate (η)</label>
                <input
                  type="number"
                  step={0.02}
                  value={xgbLearningRate}
                  onChange={(e) => setXgbLearningRate(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#121619] border border-[#2A3335] text-xs font-mono text-[#F2F3EE]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Run */}
      {currentStep === 4 && (
        <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#F2F3EE]">
              Step 4: Computational Budget & Pipeline Review
            </h2>
            <p className="text-xs text-[#A1AAA9] font-mono">
              Confirm runtime parameters before launching the genuine Qiskit and Scikit-learn execution.
            </p>
          </div>

          {/* Pre-flight Computational Budget & Integrity Audit */}
          {(() => {
            const nTrain = Math.round(maxSamples * (1 - testSize));
            const nTest = maxSamples - nTrain;
            const trainEvals = nTrain * nTrain;
            const testEvals = nTest * nTrain;
            const totalEvals = trainEvals + testEvals;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-[#0B0D0F] border border-[#2A3335] space-y-2 text-xs font-mono">
                  <div className="text-[#62E6E0] font-bold uppercase text-[11px]">Execution Plan & Partitioning:</div>
                  <div>• Experiment Name: <strong className="text-[#F2F3EE]">{expName}</strong></div>
                  <div>• Research Target: <strong className="text-[#F2F3EE]">{selectedTask}</strong></div>
                  <div>• Total Cohort Bounding: <strong className="text-[#F2F3EE]">{maxSamples} specimens</strong></div>
                  <div>• Train Partition (N_train): <strong className="text-[#C4F36B]">{nTrain} samples ({(100 - testSize * 100).toFixed(0)}%)</strong></div>
                  <div>• Held-Out Test Partition (N_test): <strong className="text-[#C4F36B]">{nTest} samples ({(testSize * 100).toFixed(0)}%)</strong></div>
                  <div>• Patient Leakage Protection: <strong className="text-[#C4F36B]">GroupShuffleSplit Enforced</strong></div>
                </div>

                <div className="p-4 rounded-md bg-[#0B0D0F] border border-[#62E6E0]/40 space-y-2 text-xs font-mono">
                  <div className="text-[#C4F36B] font-bold uppercase text-[11px]">Quantum Resource Budget:</div>
                  <div>• Feature Space: <strong className="text-[#62E6E0]">{nQubits} Qubits ({Math.pow(2, nQubits)} Statevector Dim)</strong></div>
                  <div>• Feature Map: <strong className="text-[#F2F3EE]">{featureMap} ({reps} reps, {entanglement})</strong></div>
                  <div>• Train Kernel Matrix Evals: <strong className="text-[#F2F3EE]">{trainEvals.toLocaleString()} overlaps</strong></div>
                  <div>• Test Kernel Matrix Evals: <strong className="text-[#F2F3EE]">{testEvals.toLocaleString()} overlaps</strong></div>
                  <div className="pt-2 border-t border-[#2A3335] text-[#62E6E0]">
                    • Total Statevector Overlaps: <strong className="font-bold text-sm">{totalEvals.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            );
          })()}

          {runError && (
            <div className="p-3.5 rounded-md bg-[#2a1313] border border-[#FF7474] text-xs font-mono text-[#FF7474] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{runError}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLaunch}
              disabled={isRunning}
              className="w-full py-3.5 rounded-md bg-[#62E6E0] text-[#0B0D0F] hover:bg-[#62E6E0]/90 disabled:opacity-50 font-mono text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(98,230,224,0.2)] cursor-pointer"
            >
              <Play className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Executing Genuine Quantum Benchmark..." : "Launch Tri-Model Benchmark"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2A3335]">
        <button
          disabled={currentStep === 1 || isRunning}
          onClick={() => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#191F22] border border-[#2A3335] text-xs font-mono text-[#A1AAA9] hover:text-[#F2F3EE] disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex items-center gap-1.5 px-5 py-2 rounded bg-[#62E6E0] text-[#0B0D0F] font-mono text-xs font-bold hover:bg-[#62E6E0]/90 transition-colors cursor-pointer shadow-xs"
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
