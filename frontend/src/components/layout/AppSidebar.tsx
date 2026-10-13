"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Cpu,
  FlaskConical,
  BarChart3,
  Lightbulb,
  FileText,
  BookOpen,
  Settings,
  ChevronRight,
  X,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { label: "Research Overview", href: "/app", icon: LayoutDashboard },
  { label: "Data Studio", href: "/app/data", icon: Database },
  { label: "Quantum Lab", href: "/app/quantum-lab", icon: Cpu },
  { label: "Experiment Builder", href: "/app/experiments/new", icon: FlaskConical },
  { label: "Model Benchmarks", href: "/app/benchmarks", icon: BarChart3 },
  { label: "Research Insights", href: "/app/explainability", icon: Lightbulb },
  { label: "Reports & Export", href: "/app/reports", icon: FileText },
  { label: "Documentation", href: "/docs", icon: BookOpen },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#161B19] border-r border-[#232B27] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:static"
        }`}
      >
        {/* Logo and Brand Header */}
        <div className="p-5 border-b border-[#232B27] flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#101312] border border-[#BAF91A]/60 flex items-center justify-center text-[#BAF91A] font-mono font-bold text-xs shadow-[0_0_15px_rgba(186,249,26,0.25)] group-hover:border-[#BAF91A] transition-colors">
              Q
            </div>
            <div>
              <div className="font-display font-extrabold tracking-wider text-sm text-white">
                QUANTUMON
              </div>
              <div className="font-mono text-[9px] text-[#BAF91A] tracking-tight uppercase">
                InsightOS Research
              </div>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#9CA8A3] hover:text-white hover:bg-[#1D2421]"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9CA8A3]/60">
            Laboratory Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all ${
                  isActive
                    ? "bg-[#1D2421] text-[#BAF91A] border border-[#BAF91A]/30 font-bold shadow-xs"
                    : "text-[#9CA8A3] hover:text-white hover:bg-[#1D2421]/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#BAF91A]" : "text-[#9CA8A3]"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#BAF91A]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Integrity Disclaimer */}
        <div className="p-3 border-t border-[#232B27] bg-[#101312]/50 space-y-2">
          <div className="p-3 rounded-xl bg-[#101312] border border-[#232B27] text-[10px] font-mono text-[#9CA8A3] leading-relaxed">
            <div className="flex items-center gap-1.5 text-[#E2FF99] font-bold mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#E2FF99]" />
              <span>Research Software Only</span>
            </div>
            <p>Non-causal correlative benchmark. Not for direct patient diagnosis.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
