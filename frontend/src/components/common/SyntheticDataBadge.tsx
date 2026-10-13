"use client";

import React from "react";
import { AlertTriangle, Database } from "lucide-react";

interface Props {
  isSynthetic?: boolean;
  size?: "sm" | "md";
}

export function SyntheticDataBadge({ isSynthetic = true, size = "md" }: Props) {
  if (!isSynthetic) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#123438] border border-[#62E6E0]/40 text-[#62E6E0] text-xs font-mono font-medium">
        <Database className="w-3.5 h-3.5" />
        CLINICAL VALIDATED DATA
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-semibold tracking-wide ${
        size === "sm"
          ? "px-2 py-0.5 text-[10px] bg-[#2E2413] border border-[#F0B86B]/60 text-[#F0B86B]"
          : "px-2.5 py-1 text-xs bg-[#2E2413] border border-[#F0B86B] text-[#F0B86B]"
      }`}
      title="This dataset was generated using deterministic statistical distributions for software pipeline benchmarking and educational evaluation. Not real patient records."
    >
      <AlertTriangle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      SYNTHETIC DEMO DATA
    </span>
  );
}
