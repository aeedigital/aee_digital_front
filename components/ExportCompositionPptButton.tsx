"use client";

import { useState } from "react";

import type { CompositionTotals, RegionalComposition } from "@/lib/compositionReport";

type ExportCompositionPptButtonProps = {
  composition: RegionalComposition[];
  periodLabel: string | null;
  totals: CompositionTotals;
};

export default function ExportCompositionPptButton({
  composition,
  periodLabel,
  totals,
}: ExportCompositionPptButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    try {
      setExporting(true);

      const response = await fetch("/api/resumo/alianca/composicao/ppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          composition,
          periodLabel,
          totals,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao exportar PPT (${response.status})`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const fileName = match?.[1] || "composicao-regionais.pptx";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting || composition.length === 0}
      className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {exporting ? "Exportando PPT..." : "Exportar PPT"}
    </button>
  );
}
