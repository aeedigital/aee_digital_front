"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Centro } from "@/interfaces/centro.interface";
import { buildCadastroCsvContentForCentros } from "@/lib/cadastroCsvExport";
import { downloadCsvFile } from "@/lib/summaryCsv";

type ExportCenterCadastroCsvButtonProps = {
  centro: Pick<Centro, "_id" | "NOME_CENTRO" | "NOME_CURTO">;
  disabled?: boolean;
};

function normalizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export default function ExportCenterCadastroCsvButton({
  centro,
  disabled = false,
}: ExportCenterCadastroCsvButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (disabled || exporting) return;

    try {
      setExporting(true);

      const csvContent = await buildCadastroCsvContentForCentros({
        centros: [centro],
      });
      const fileName = normalizeFileName(centro.NOME_CURTO || centro.NOME_CENTRO || centro._id);

      downloadCsvFile(`cadastro_${fileName || centro._id}.csv`, csvContent);
    } catch (error: unknown) {
      console.error("[Cadastro CSV] Falha ao exportar centro", error);
      const message = error instanceof Error ? error.message : "Não foi possível exportar o CSV do centro.";
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
      {exporting ? "Exportando..." : "Exportar dados exibidos (CSV)"}
    </Button>
  );
}
