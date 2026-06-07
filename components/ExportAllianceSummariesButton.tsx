"use client";

import { useState } from "react";

import { getCadastroInfo, type CadastroInfo } from "@/app/actions/cadastroInfo";
import { Regional, Centro } from "@/interfaces/centro.interface";
import { Form, Summary } from "@/interfaces/form.interface";
import { apiFetch } from "@/lib/api";
import {
  buildSummaryCsvContent,
  downloadCsvFile,
  getOrderedFormQuestions,
  type SummaryCsvRow,
} from "@/lib/summaryCsv";
import { normalizeSummaries, pickLatestSummary } from "@/lib/summaries";

type RegionalLike = Partial<Regional> & {
  id?: string;
  regionalId?: string;
  ID?: string;
  nomeRegional?: string;
  nome?: string;
  name?: string;
};
type CentroWithSummaries = Centro & {
  summaries?: unknown;
};

const REGIONAL_CONCURRENCY = 3;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

function normalizeDateToISO(value?: string) {
  if (!value) return undefined;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }
  return value;
}

function getRegionalId(regional: RegionalLike) {
  return regional._id || regional.id || regional.regionalId || regional.ID || "";
}

function getRegionalName(regional: RegionalLike) {
  return (
    regional.NOME_REGIONAL ||
    regional.nomeRegional ||
    regional.nome ||
    regional.name ||
    "Regional sem nome"
  );
}

function shouldRetryStatus(status: number) {
  return status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchJsonWithRetry<T>(path: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await apiFetch(path, { cache: "no-store" });

      if (!response.ok) {
        const message = `Falha ao buscar ${path} (${response.status})`;

        if (attempt < MAX_RETRIES && shouldRetryStatus(response.status)) {
          await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
          continue;
        }

        throw new Error(message);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
        continue;
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(`Falha ao buscar ${path}`);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

type ExportAllianceSummariesButtonProps = {
  cadastroInfo?: CadastroInfo | null;
  disabled?: boolean;
  regionais: RegionalLike[];
};

export default function ExportAllianceSummariesButton({
  cadastroInfo,
  disabled = false,
  regionais,
}: ExportAllianceSummariesButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (disabled || exporting) return;

    if (!regionais.length) {
      alert("Nenhuma regional disponível para exportação.");
      return;
    }

    try {
      setExporting(true);

      const activeCadastroInfo = cadastroInfo ?? (await getCadastroInfo());
      const dateFrom = normalizeDateToISO(activeCadastroInfo?.start);
      const dateTo = normalizeDateToISO(activeCadastroInfo?.end);

      const formData = await fetchJsonWithRetry<Form | Form[]>(`/forms/${activeCadastroInfo.formId}`);
      const form = (Array.isArray(formData) ? formData[0] : formData) as Form | undefined;
      const questions = getOrderedFormQuestions(form);

      if (!questions.length) {
        alert("Não foi possível encontrar perguntas do formulário para exportação.");
        return;
      }

      const regionalRows = await mapWithConcurrency(
        regionais,
        REGIONAL_CONCURRENCY,
        async (regional) => {
          const regionalId = getRegionalId(regional);
          const regionalNome = getRegionalName(regional);

          if (!regionalId) {
            throw new Error(`A regional "${regionalNome}" não possui identificador para exportação.`);
          }

          const params = new URLSearchParams();
          if (dateFrom) params.append("dateFrom", dateFrom);
          if (dateTo) params.append("dateTo", dateTo);
          params.append("include", "answers,summaries");
          params.append("sortBy", "updatedAt:desc");

          const path = params.toString()
            ? `/regionais/${regionalId}/centros-with-answers?${params.toString()}`
            : `/regionais/${regionalId}/centros-with-answers`;

          const payload = await fetchJsonWithRetry<{ centros?: CentroWithSummaries[] }>(path);
          const centros = Array.isArray(payload?.centros) ? payload.centros : [];

          return centros.map<SummaryCsvRow>((centro) => {
            const latestSummary = pickLatestSummary(
              normalizeSummaries((centro as { summaries?: Summary[] }).summaries)
            );

            return {
              regionalNome,
              centroNome: centro.NOME_CENTRO || centro.NOME_CURTO || centro._id,
              latestSummary,
            };
          });
        }
      );

      const rows = regionalRows.flat();

      if (!rows.length) {
        alert("Nenhum centro encontrado para exportar.");
        return;
      }

      const csvContent = buildSummaryCsvContent({
        questions,
        rows,
        includeRegional: true,
      });

      downloadCsvFile("resumos_alianca.csv", csvContent);
    } catch (error: any) {
      console.error("[Resumo/Aliança] Falha ao exportar CSV", error);
      alert(error?.message || "Não foi possível exportar o CSV da Aliança.");
    } finally {
      setExporting(false);
    }
  }

  const isDisabled = disabled || exporting || regionais.length === 0;

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 14px",
        borderRadius: "999px",
        border: "1px solid",
        borderColor: isDisabled ? "#cbd5e1" : "#2563eb",
        background: isDisabled ? "#e2e8f0" : "#2563eb",
        color: isDisabled ? "#64748b" : "#ffffff",
        fontSize: "14px",
        fontWeight: 600,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      {exporting ? "Exportando CSV..." : "Exportar todos os resumos (CSV)"}
    </button>
  );
}
