"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Centro } from "@/interfaces/centro.interface";
import {
  buildCenterSummaryFileName,
  downloadSummaryXlsx,
  fetchLatestSummaryRows,
} from '@/lib/summaryXlsxExport';

type ExportCenterCadastroCsvButtonProps = {
  centro: Pick<Centro, "_id" | "NOME_CENTRO" | "NOME_CURTO">;
  disabled?: boolean;
};

export default function ExportCenterCadastroCsvButton({
  centro,
  disabled = false,
}: ExportCenterCadastroCsvButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (disabled || exporting) return;

    try {
      setExporting(true);

      const rows = await fetchLatestSummaryRows([centro]);
      await downloadSummaryXlsx(buildCenterSummaryFileName(centro), rows);
    } catch (error: unknown) {
      console.error("[Cadastro XLSX] Falha ao exportar centro", error);
      const message = error instanceof Error ? error.message : "Não foi possível exportar o XLSX do centro.";
      alert(message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || exporting}
      className="flex-grow min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-3"
      type="button"
    >
      {exporting ? "Exportando..." : "Exportar dados (XLSX)"}
    </Button>
  );
}
