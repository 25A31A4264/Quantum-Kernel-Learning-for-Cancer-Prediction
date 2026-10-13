"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Table as TableIcon,
  BarChart,
  RefreshCw,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { fetchDatasets, profileDataset, DatasetInfo, DatasetProfile } from "@/lib/api";

export default function DataStudioPage() {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("tcga_luad_egfr.csv");
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewPage, setPreviewPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"preview" | "columns" | "correlations" | "leakage">("preview");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const loadDataCatalog = async () => {
    try {
      const dsets = await fetchDatasets();
      setDatasets(dsets);
      if (dsets.length > 0 && !selectedFile) {
        setSelectedFile(dsets[0].filename);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProfile = async (filename: string) => {
    setLoading(true);
    try {
      const res = await profileDataset(filename);
      setProfile(res);
      setPreviewPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataCatalog();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      loadProfile(selectedFile);
    }
  }, [selectedFile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadStatus("Uploading & validating CSV...");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/datasets/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadStatus(`Uploaded ${data.filename}`);
      await loadDataCatalog();
      setSelectedFile(data.filename);
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    }
  };

  const downloadCleanedConfig = () => {
    if (!profile) return;
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.filename.replace(".csv", "")}_profile.json`;
    a.click();
  };

  const pageSize = 10;
  const filteredPreview = profile?.preview_data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  const paginatedRows = filteredPreview.slice((previewPage - 1) * pageSize, previewPage * pageSize);
  const totalPages = Math.ceil(filteredPreview.length / pageSize) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto selection:bg-[#BAF91A]/20 selection:text-[#BAF91A]">
      {/* Header and Dataset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#161B19] border border-[#232B27]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#BAF91A] font-semibold">
              DATASET REPOSITORY // STUDIO
            </span>
            <SyntheticDataBadge isSynthetic={profile?.is_synthetic ?? true} size="sm" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Data Studio</h1>
          <p className="text-xs font-mono text-[#9CA8A3]">
            Inspect distributions, verify target columns, evaluate class balance, and verify patient-level split protection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono text-white focus:border-[#BAF91A] outline-hidden cursor-pointer"
          >
            {datasets.map((d) => (
              <option key={d.filename} value={d.filename}>
                {d.name} ({d.sample_count} samples)
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono text-[#9CA8A3] hover:text-[#BAF91A] hover:border-[#BAF91A] cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>

          <button
            onClick={() => loadProfile(selectedFile)}
            className="p-2 rounded-xl bg-[#101312] border border-[#232B27] text-[#9CA8A3] hover:text-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#BAF91A]" : ""}`} />
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3.5 rounded-xl bg-[#161B19] border border-[#BAF91A]/40 text-xs font-mono text-[#BAF91A]">
          {uploadStatus}
        </div>
      )}

      {/* Dataset Summary Cards */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-1">
            <span className="text-[10px] font-mono text-[#9CA8A3] uppercase">Dataset Volume</span>
            <div className="font-display text-xl font-bold text-white tabular-nums">
              {profile.row_count} <span className="text-xs text-[#9CA8A3] font-normal">samples</span>
            </div>
            <div className="text-[11px] font-mono text-[#9CA8A3]">
              {profile.column_count} columns ({profile.numeric_columns.length} numeric)
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-1">
            <span className="text-[10px] font-mono text-[#9CA8A3] uppercase">Target Variable</span>
            <div className="font-display text-xl font-bold text-[#BAF91A]">
              {profile.target_col || "Not Configured"}
            </div>
            <div className="text-[11px] font-mono text-[#9CA8A3]">
              {profile.is_valid ? "Binary Classification Ready" : "Validation Required"}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161B19] border border-[#232B27] space-y-1.5">
            <span className="text-[10px] font-mono text-[#9CA8A3] uppercase">Class Distribution</span>
            <div className="flex items-center gap-2">
              {Object.entries(profile.target_distribution).map(([cls, data]) => (
                <span key={cls} className="text-xs font-mono">
                  {cls === "1" ? "Pos" : "Neg"}: <span className={cls === "1" ? "text-[#BAF91A] font-bold" : "text-[#876DFF] font-bold"}>{data.percentage}%</span>
                </span>
              ))}
            </div>
            {/* Visual Balance Bar */}
            <div className="w-full h-2 rounded-full bg-[#101312] overflow-hidden flex">
              {Object.entries(profile.target_distribution).map(([cls, data]) => (
                <div
                  key={cls}
                  style={{ width: `${data.percentage}%` }}
                  className={cls === "1" ? "bg-[#BAF91A]" : "bg-[#876DFF]"}
                  title={`Class ${cls}: ${data.percentage}%`}
                />
              ))}
            </div>
            <div className="text-[10px] font-mono text-[#A1AAA9] truncate">
              {profile.class_balance_warning || "Class representation balanced"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#121619] border border-[#2A3335] space-y-1">
            <span className="text-[10px] font-mono text-[#A1AAA9] uppercase">Patient Split Protection</span>
            <div className="font-display text-base font-bold text-[#C4F36B] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C4F36B]" />
              {profile.patient_stats ? "Active" : "Standard"}
            </div>
            <div className="text-[11px] font-mono text-[#A1AAA9]">
              {profile.patient_stats?.unique_patients
                ? `${profile.patient_stats.unique_patients} unique patients verified`
                : "Single specimen per sample"}
            </div>
          </div>
        </div>
      )}

      {/* Warnings & Integrity Notices */}
      {profile && profile.warnings.length > 0 && (
        <div className="p-4 rounded-lg bg-[#121619] border border-[#F0B86B]/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#F0B86B] font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#F0B86B]" />
            Data Quality & Clinical Partitioning Alerts ({profile.warnings.length})
          </div>
          <ul className="text-xs font-mono text-[#A1AAA9] space-y-1 pl-6 list-disc">
            {profile.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3335] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "preview" ? "bg-[#191F22] text-[#62E6E0] font-bold" : "text-[#A1AAA9] hover:text-[#F2F3EE]"
          }`}
        >
          Table Preview
        </button>
        <button
          onClick={() => setActiveTab("columns")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "columns" ? "bg-[#191F22] text-[#62E6E0] font-bold" : "text-[#A1AAA9] hover:text-[#F2F3EE]"
          }`}
        >
          Column Statistics ({profile?.columns.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("correlations")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "correlations" ? "bg-[#191F22] text-[#62E6E0] font-bold" : "text-[#A1AAA9] hover:text-[#F2F3EE]"
          }`}
        >
          Feature Correlation Matrix
        </button>
        <button
          onClick={() => setActiveTab("leakage")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "leakage" ? "bg-[#191F22] text-[#62E6E0] font-bold" : "text-[#A1AAA9] hover:text-[#F2F3EE]"
          }`}
        >
          Patient Leakage Guard
        </button>

        <div className="ml-auto">
          <button
            onClick={downloadCleanedConfig}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#191F22] border border-[#2A3335] text-[11px] text-[#A1AAA9] hover:text-[#62E6E0] hover:border-[#62E6E0] transition-colors"
          >
            <Download className="w-3 h-3" />
            Export Profile JSON
          </button>
        </div>
      </div>

      {/* Tab 1: Table Preview */}
      {activeTab === "preview" && profile && (
        <div className="p-5 rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A1AAA9]" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPreviewPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 rounded bg-[#0B0D0F] border border-[#2A3335] text-xs font-mono text-[#F2F3EE] outline-hidden focus:border-[#62E6E0]"
              />
            </div>
            <div className="text-xs font-mono text-[#A1AAA9]">
              Showing {paginatedRows.length} of {filteredPreview.length} rows
            </div>
          </div>

          <div className="overflow-x-auto border border-[#2A3335] rounded">
            <table className="w-full text-left text-xs font-mono whitespace-nowrap">
              <thead className="bg-[#0B0D0F] text-[#A1AAA9] border-b border-[#2A3335]">
                <tr>
                  {profile.columns.map((col) => (
                    <th
                      key={col.name}
                      className={`p-2.5 ${col.is_numeric ? "text-right" : "text-left"} ${
                        col.name === profile.target_col
                          ? "text-[#62E6E0] font-bold"
                          : col.name === profile.patient_id_col
                          ? "text-[#C4F36B] font-bold"
                          : ""
                      }`}
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3335]/40">
                {paginatedRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#191F22]/80 transition-colors">
                    {profile.columns.map((col) => {
                      const val = row[col.name];
                      const isTarget = col.name === profile.target_col;
                      return (
                        <td
                          key={col.name}
                          className={`p-2.5 ${col.is_numeric ? "text-right tabular-nums" : "text-left"} ${
                            isTarget
                              ? val === 1
                                ? "text-[#C4F36B] font-bold"
                                : "text-[#A1AAA9]"
                              : ""
                          }`}
                        >
                          {typeof val === "number" ? val.toFixed(2) : String(val ?? "-")}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs font-mono text-[#A1AAA9] pt-2">
            <span>Page {previewPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={previewPage <= 1}
                onClick={() => setPreviewPage(previewPage - 1)}
                className="px-2.5 py-1 rounded bg-[#191F22] border border-[#2A3335] disabled:opacity-40 hover:text-[#F2F3EE]"
              >
                Previous
              </button>
              <button
                disabled={previewPage >= totalPages}
                onClick={() => setPreviewPage(previewPage + 1)}
                className="px-2.5 py-1 rounded bg-[#191F22] border border-[#2A3335] disabled:opacity-40 hover:text-[#F2F3EE]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Column Statistics */}
      {activeTab === "columns" && profile && (
        <div className="p-5 rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
          <div className="overflow-x-auto border border-[#2A3335] rounded">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0B0D0F] text-[#A1AAA9] border-b border-[#2A3335]">
                <tr>
                  <th className="p-2.5">Feature Name</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Missing</th>
                  <th className="p-2.5">Unique</th>
                  <th className="p-2.5 text-right">Min</th>
                  <th className="p-2.5 text-right">Mean</th>
                  <th className="p-2.5 text-right">Std Dev</th>
                  <th className="p-2.5 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3335]/40">
                {profile.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-[#191F22]/80">
                    <td className="p-2.5 font-semibold text-[#F2F3EE]">
                      {col.name}
                      {col.name === profile.target_col && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-[#123438] text-[#62E6E0] text-[10px]">
                          Target
                        </span>
                      )}
                      {col.name === profile.patient_id_col && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-[#1f3014] text-[#C4F36B] text-[10px]">
                          Patient ID
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-[#A1AAA9]">{col.dtype}</td>
                    <td className="p-2.5 text-[#A1AAA9]">
                      {col.missing_count === 0 ? "0 (0%)" : `${col.missing_count} (${col.missing_pct}%)`}
                    </td>
                    <td className="p-2.5 text-[#A1AAA9]">{col.unique_values}</td>
                    <td className="p-2.5 text-right">{col.min != null ? col.min.toFixed(2) : "-"}</td>
                    <td className="p-2.5 text-right">{col.mean != null ? col.mean.toFixed(2) : "-"}</td>
                    <td className="p-2.5 text-right">{col.std != null ? col.std.toFixed(2) : "-"}</td>
                    <td className="p-2.5 text-right">{col.max != null ? col.max.toFixed(2) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Correlation Matrix */}
      {activeTab === "correlations" && profile && profile.correlation_matrix && (
        <div className="p-5 rounded-lg bg-[#121619] border border-[#2A3335] space-y-4">
          <div className="space-y-1">
            <h3 className="font-display text-sm font-bold text-[#F2F3EE]">
              Feature Pairwise Pearson Correlation Matrix
            </h3>
            <p className="text-xs text-[#A1AAA9] font-mono">
              Evaluates linear collinearity between continuous gene expression markers and clinical covariates.
            </p>
          </div>

          <div className="overflow-x-auto border border-[#2A3335] rounded p-2 bg-[#0B0D0F]">
            <table className="w-full text-center text-[10px] font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[#A1AAA9]">Feature</th>
                  {profile.correlation_matrix.features.map((f) => (
                    <th key={f} className="p-2 text-[#A1AAA9] max-w-[70px] truncate" title={f}>
                      {f.replace("_expression", "").replace("_status", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile.correlation_matrix.features.map((fRow, rIdx) => (
                  <tr key={fRow} className="hover:bg-[#191F22]/40">
                    <td className="p-2 text-left font-semibold text-[#F2F3EE] max-w-[120px] truncate" title={fRow}>
                      {fRow}
                    </td>
                    {profile.correlation_matrix!.values[rIdx].map((val, cIdx) => {
                      const abs = Math.abs(val);
                      const bg =
                        val > 0
                          ? `rgba(98, 230, 224, ${abs * 0.7})`
                          : `rgba(255, 116, 116, ${abs * 0.7})`;
                      return (
                        <td
                          key={cIdx}
                          style={{ backgroundColor: bg }}
                          className="p-1.5 text-[#0B0D0F] font-bold rounded-xs"
                          title={`${fRow} vs ${profile.correlation_matrix!.features[cIdx]}: ${val}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Patient Leakage Guard */}
      {activeTab === "leakage" && profile && (
        <div className="p-6 rounded-lg bg-[#121619] border border-[#2A3335] space-y-5">
          <div className="flex items-center gap-2 text-[#C4F36B]">
            <ShieldCheck className="w-5 h-5 text-[#C4F36B]" />
            <h3 className="font-display text-base font-bold text-[#F2F3EE]">
              Patient-Level Split Protection Architecture
            </h3>
          </div>

          <p className="text-xs text-[#A1AAA9] leading-relaxed font-mono">
            In clinical translational oncology, when multiple tissue specimens or temporal biopsies are collected from the same patient, treating rows as independent i.i.d. observations causes severe test set information leakage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded bg-[#0B0D0F] border border-[#2A3335] space-y-2">
              <span className="text-[10px] font-mono text-[#62E6E0] uppercase font-bold">Standard Naive Split</span>
              <p className="text-xs text-[#FF7474] font-mono">
                Random row shuffle splits slices from Patient A into BOTH train and test partitions. The model memorizes patient histology, inflating reported accuracy.
              </p>
            </div>

            <div className="p-4 rounded bg-[#0B0D0F] border border-[#C4F36B]/60 space-y-2">
              <span className="text-[10px] font-mono text-[#C4F36B] uppercase font-bold">QUANTUMON Group Partitioning</span>
              <p className="text-xs text-[#C4F36B] font-mono">
                Uses <code>GroupShuffleSplit</code> keyed on <code>{profile.patient_id_col || "patient_id"}</code>. All slices from any given patient are strictly sequestered into either the train partition OR the test partition.
              </p>
            </div>
          </div>

          {profile.patient_stats && (
            <div className="p-4 rounded bg-[#191F22] border border-[#2A3335] space-y-2 text-xs font-mono text-[#A1AAA9]">
              <div className="text-[#F2F3EE] font-semibold">Active Cohort Patient Audit:</div>
              <div>• Unique Patients: {profile.patient_stats.unique_patients}</div>
              <div>• Total Specimens: {profile.patient_stats.total_samples}</div>
              <div>• Multi-specimen Patients: {profile.patient_stats.patients_with_multiple_samples}</div>
              <div className="text-[#C4F36B]">• Status: {profile.patient_stats.leakage_protection_status}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
