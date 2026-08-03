import { Centro } from "@/interfaces/centro.interface";
import { Answer, Form } from "@/interfaces/form.interface";
import { apiFetch } from "@/lib/api";
import {
  buildCadastroAnswersCache,
  projectCadastroPages,
  selectCurrentCadastroForm,
} from "@/lib/cadastroViewModel";
import { buildCadastroCsvContent, CadastroCsvRow } from "@/lib/summaryCsv";

const CADASTRO_FORM_PATH = "/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual";
const DEFAULT_CONCURRENCY = 4;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

class NonRetryableFetchError extends Error {}

export type CadastroCsvCentro = Pick<Centro, "_id" | "NOME_CENTRO" | "NOME_CURTO"> & {
  regionalNome?: string;
};

type BuildCadastroCsvRowsOptions = {
  centros: CadastroCsvCentro[];
  concurrency?: number;
  form?: Form;
  loadAnswers?: (centroId: string) => Promise<Answer[]>;
};

type BuildCadastroCsvContentForCentrosOptions = BuildCadastroCsvRowsOptions & {
  includeRegional?: boolean;
};

function shouldRetryStatus(status: number) {
  return status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

        throw new NonRetryableFetchError(message);
      }

      const text = await response.text();
      return (text ? JSON.parse(text) : null) as T;
    } catch (error) {
      if (error instanceof NonRetryableFetchError) {
        throw error;
      }

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

export async function mapWithConcurrency<T, R>(
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

  const workerCount = Math.min(Math.max(concurrency, 1), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

export async function fetchCurrentCadastroForm() {
  const forms = await fetchJsonWithRetry<Form[]>(CADASTRO_FORM_PATH);
  return selectCurrentCadastroForm(forms);
}

export async function fetchCentroCadastroAnswers(centroId: string) {
  return fetchJsonWithRetry<Answer[]>(`/answers?CENTRO_ID=${encodeURIComponent(centroId)}`);
}

export function buildCadastroCsvRow(centro: CadastroCsvCentro, form: Form, answers: Answer[]): CadastroCsvRow {
  const answersCache = buildCadastroAnswersCache(answers);

  return {
    centroId: centro._id,
    centroNome: centro.NOME_CENTRO || centro.NOME_CURTO || centro._id,
    centroNomeCurto: centro.NOME_CURTO || "",
    form,
    projectedPages: projectCadastroPages(form, answersCache, { centroId: centro._id }),
    regionalNome: centro.regionalNome,
  };
}

export async function buildCadastroCsvRowsForCentros({
  centros,
  concurrency = DEFAULT_CONCURRENCY,
  form,
  loadAnswers = fetchCentroCadastroAnswers,
}: BuildCadastroCsvRowsOptions) {
  const currentForm = form ?? (await fetchCurrentCadastroForm());

  return mapWithConcurrency(centros, concurrency, async (centro) => {
    const answers = await loadAnswers(centro._id);
    return buildCadastroCsvRow(centro, currentForm, answers);
  });
}

export async function buildCadastroCsvContentForCentros({
  includeRegional = false,
  ...options
}: BuildCadastroCsvContentForCentrosOptions) {
  const rows = await buildCadastroCsvRowsForCentros(options);

  return buildCadastroCsvContent({
    includeRegional,
    rows,
  });
}
