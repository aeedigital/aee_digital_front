import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import { apiFetch, apiUrl } from "@/lib/api";
import { getQuestionAnswerFromAnswers } from "@/lib/coordinatorQuestions";
import { Answer, Form } from "@/interfaces/form.interface";

export type RegionalComposition = {
  id: string;
  nome: string;
  pais: string;
  integradas: number;
  inscritas: number;
  pendentes: number;
  total: number;
};

export type CompositionTotals = {
  integradas: number;
  inscritas: number;
  pendentes: number;
  total: number;
};

type RegionalApi = {
  _id: string;
  NOME_REGIONAL?: string;
  PAIS?: string;
};

type CentroApi = {
  _id: string;
  answers?: Answer[];
};

function normalizeDateToIso(value?: string) {
  if (!value) return undefined;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }
  return value;
}

export function formatDateLabel(value?: string) {
  if (!value) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function safePercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

async function fetchJson<T>(path: string) {
  const response = await fetch(apiUrl(path), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Falha ao buscar ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function loadCompositionData() {
  const cadastroInfo = await getCadastroInfo();
  const dateFrom = normalizeDateToIso(cadastroInfo?.start);
  const dateTo = normalizeDateToIso(cadastroInfo?.end);
  const startLabel = formatDateLabel(cadastroInfo?.start || dateFrom);
  const endLabel = formatDateLabel(cadastroInfo?.end || dateTo);
  const periodLabel =
    startLabel || endLabel
      ? `${startLabel || "Início não definido"} até ${endLabel || "sem término"}`
      : null;

  const [regionaisResponse, formData] = await Promise.all([
    apiFetch("/regionais", { cache: "no-store" }),
    fetchJson<Form | Form[]>(`/forms/${cadastroInfo.formId}`),
  ]);

  if (!regionaisResponse.ok) {
    throw new Error(`Falha ao buscar regionais (${regionaisResponse.status})`);
  }

  const regionaisData = (await regionaisResponse.json()) as RegionalApi[];
  const form = (Array.isArray(formData) ? formData[0] : formData) as Form | undefined;
  const centrosByRegional = new Map<string, CentroApi[]>();

  for (const regional of regionaisData) {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    params.append("include", "answers,summaries");
    params.append("limitSummaries", "1");

    const path = params.toString()
      ? `/regionais/${regional._id}/centros-with-answers?${params.toString()}`
      : `/regionais/${regional._id}/centros-with-answers`;

    try {
      const payload = await fetchJson<{ centros?: CentroApi[] }>(path);
      centrosByRegional.set(regional._id, Array.isArray(payload?.centros) ? payload.centros : []);
    } catch (error) {
      console.error("[Composição] Falha ao buscar regional", {
        regionalId: regional._id,
        regionalNome: regional.NOME_REGIONAL,
        path,
        error,
      });
      centrosByRegional.set(regional._id, []);
    }
  }

  const composition = regionaisData
    .map((regional) => {
      const centros = centrosByRegional.get(regional._id) || [];
      const counters = {
        Integrada: 0,
        Inscrita: 0,
        Pendente: 0,
      };

      for (const centro of centros) {
        const situacao = getQuestionAnswerFromAnswers(form, centro.answers, "Situação")?.answer?.ANSWER;
        const normalizedStatus =
          situacao === "Integrada" || situacao === "Inscrita" || situacao === "Pendente"
            ? situacao
            : null;

        if (normalizedStatus) {
          counters[normalizedStatus] += 1;
        }
      }

      const total = counters.Integrada + counters.Inscrita + counters.Pendente;

      return {
        id: regional._id,
        nome: regional.NOME_REGIONAL || "Regional sem nome",
        pais: regional.PAIS || "",
        integradas: counters.Integrada,
        inscritas: counters.Inscrita,
        pendentes: counters.Pendente,
        total,
      };
    })
    .sort((left, right) => {
      if (right.total !== left.total) return right.total - left.total;
      return left.nome.localeCompare(right.nome);
    });

  const totals = composition.reduce(
    (acc, regional) => {
      acc.integradas += regional.integradas;
      acc.inscritas += regional.inscritas;
      acc.pendentes += regional.pendentes;
      acc.total += regional.total;
      return acc;
    },
    { integradas: 0, inscritas: 0, pendentes: 0, total: 0 }
  );

  return {
    composition,
    periodLabel,
    totals,
    ranking: composition.slice(0, 5),
  };
}
