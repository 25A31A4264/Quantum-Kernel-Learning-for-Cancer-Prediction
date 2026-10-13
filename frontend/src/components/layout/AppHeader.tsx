"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, FlaskConical, Wifi, WifiOff, Menu, Sparkles } from "lucide-react";
import { fetchHealth } from "@/lib/api";
import { SyntheticDataBadge } from "@/components/common/SyntheticDataBadge";
import { useSidebar } from "./SidebarContext";

export function AppHeader() {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [qiskitVersion, setQiskitVersion] = useState<string>("Qiskit 2.5");

  useEffect(() => {
    fetchHealth()
      .then((h) => {
        setBackendStatus("online");
        if (h.qiskit_version) setQiskitVersion(`Qiskit v${h.qiskit_version}`);
      })
      .catch(() => setBackendStatus("offline"));
  }, []);

  const getBreadcrumbTitle = () => {
    if (pathname === "/app") return "Research Overview";
    if (pathname.startsWith("/app/data")) return "Data Studio";
    if (pathname.startsWith("/app/quantum-lab")) return "Quantum Lab";
    if (pathname.startsWith("/app/experiments/new")) return "Experiment Builder";
    if (pathname.startsWith("/app/benchmarks")) return "Model Benchmarks";
    if (pathname.startsWith("/app/explainability")) return "Research Insights";
    if (pathname.startsWith("/app/reports")) return "Reports & Export";
    if (pathname.startsWith("/docs")) return "Scientific Documentation";
    if (pathname.startsWith("/app/settings")) return "Settings";
    return "Research Workspace";
  };

  return (
    <header className="h-16 border-b border-[#232B27] bg-[#161B19] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={toggle}
          className="lg:hidden p-1.5 rounded-lg text-[#9CA8A3] hover:text-white hover:bg-[#1D2421] transition-colors cursor-pointer"
          aria-label="Open Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-mono text-[#9CA8A3]">QUANTUMON /</span>
          <h1 className="text-sm font-semibold text-white tracking-tight truncate">{getBreadcrumbTitle()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Synthetic Demo Mode Label */}
        <SyntheticDataBadge isSynthetic={true} size="sm" />

        {/* Backend Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101312] border border-[#232B27] text-xs font-mono">
          {backendStatus === "online" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#BAF91A] animate-pulse" />
              <span className="text-[#9CA8A3] text-[11px] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#BAF91A]" />
                <span className="text-white font-medium">{qiskitVersion}</span>
              </span>
            </>
          ) : backendStatus === "offline" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#FF7474]" />
              <span className="text-[#FF7474] text-[11px] flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                Backend Offline
              </span>
            </>
          ) : (
            <span className="text-[#9CA8A3] text-[11px]">Connecting...</span>
          )}
        </div>

        {/* Quick action button */}
        {pathname !== "/app/experiments/new" && (
          <Link
            href="/app/experiments/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#BAF91A] text-[#101312] hover:bg-[#BAF91A]/90 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(186,249,26,0.25)] cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Benchmark</span>
          </Link>
        )}
      </div>
    </header>
  );
}
