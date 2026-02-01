import Link from "next/link";
import { notFound } from "next/navigation";

import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import type { Centro, Regional } from "@/interfaces/centro.interface";
import type {
  Answer,
  Form,
  Page,
  Quiz,
  QuestionGroup,
  Question,
} from "@/interfaces/form.interface";
import { apiFetch, apiUrl } from "@/lib/api";
import { filterResponsesForPublic } from "@/lib/publicAnswers";

import PublicCentroReadOnly from "./PublicCentroReadOnly";

type Params = {
  params: {
    regionalId: string;
    centroId: string;
  };
};

type QuestionIndex = Map<string, Question>;
type AnswerWithDates = Answer & { createdAt?: string; updatedAt?: string };

export async function generateStaticParams() {
  try {
    const regionaisRes = await apiFetch(`/regionais`);
    if (!regionaisRes.ok) return [];
    const regionais: Regional[] = await regionaisRes.json();

    const pairs = await Promise.all(
      regionais.map(async (regional) => {
        if (!regional?._id) return [];
        const centrosRes = await apiFetch(
          `/centros?REGIONAL=${regional._id}&STATUS=Pendente,Integrada,Inscrita`
        );
        if (!centrosRes.ok) return [];
        const centros: Centro[] = await centrosRes.json();
        return centros
          .filter((c) => c?._id)
          .map((centro) => ({
            regionalId: regional._id,
            centroId: centro._id,
          }));
      })
    );

    return pairs.flat();
  } catch {
    return [];
  }
}

async function fetchJson<T>(path: string) {
  const response = await fetch(apiUrl(path), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Falha ao buscar ${path} (${response.status})`);
  }
  const payload = await response.json();
  return payload as T;
}

function buildQuestionIndex(form?: Form): QuestionIndex {
  const map: QuestionIndex = new Map();
  if (!form?.PAGES?.length) return map;

  form.PAGES.forEach((page: Page) => {
    page.QUIZES?.forEach((quiz: Quiz) => {
      quiz.QUESTIONS?.forEach((group: QuestionGroup) => {
        group.GROUP?.forEach((question: Question) => {
          if (question?._id) {
            map.set(question._id, question);
          }
        });
      });
    });
  });

  return map;
}

function filterPagesByLGPD(pages: Page[], allowedIds: Set<string>) {
  return pages
    .filter((page) => page.ROLE !== "coord_regional")
    .map((page) => ({
      ...page,
      QUIZES: page.QUIZES?.map((quiz) => ({
        ...quiz,
        QUESTIONS: quiz.QUESTIONS?.map((group) => ({
          ...group,
          GROUP: group.GROUP?.filter((q) => allowedIds.has(q._id)),
        })).filter((group) => group.GROUP && group.GROUP.length > 0),
      })).filter((quiz) => quiz.QUESTIONS && quiz.QUESTIONS.length > 0),
    }))
    .filter((page) => page.QUIZES && page.QUIZES.length > 0);
}

function buildAllowedQuestions(questionIndex: QuestionIndex) {
  const questionList = Array.from(questionIndex.values()).map((q) => ({
    QUESTION: q.QUESTION,
    QUESTION_ID: q._id,
    _id: q._id,
    ANSWER: "",
  }));

  const allowed = filterResponsesForPublic(questionList);
  const allowedIds = new Set(
    allowed
      .map((q) => q._id)
      .filter((id): id is string => Boolean(id))
  );

  return allowedIds;
}

function buildAnswersCache(
  answers: AnswerWithDates[],
  allowedIds: Set<string>
): Record<string, AnswerWithDates[]> {
  const cache: Record<string, AnswerWithDates[]> = {};

  answers.forEach((answer) => {
    if (!allowedIds.has(answer.QUESTION_ID)) return;
    if (!cache[answer.QUESTION_ID]) {
      cache[answer.QUESTION_ID] = [];
    }
    cache[answer.QUESTION_ID].push(answer);
  });

  return cache;
}

export default async function PublicCentroRespostas({ params }: Params) {
  const { regionalId, centroId } = params;

  if (!regionalId || !centroId) {
    return notFound();
  }

  const cadastroInfo = await getCadastroInfo();

  let regional: Regional | null = null;
  let centro: Centro | null = null;
  let form: Form | null = null;
  let answers: AnswerWithDates[] = [];

  try {
    const formPath = cadastroInfo?.formId
      ? `/forms?_id=${cadastroInfo.formId}`
      : "/forms";

    [regional, centro, form, answers] = await Promise.all([
      fetchJson<Regional>(`/regionais/${regionalId}`),
      fetchJson<Centro>(`/centros/${centroId}`),
      fetchJson<Form[]>(formPath).then((forms) => {
        if (!forms) return null;
        return Array.isArray(forms) ? (forms.length ? forms[0] : null) : (forms as unknown as Form);
      }),
      fetchJson<AnswerWithDates[]>(`/answers?CENTRO_ID=${centroId}`),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados públicos do centro", error);
    return notFound();
  }

  if (!regional || !centro || !form) {
    return notFound();
  }

  const questionIndex = buildQuestionIndex(form);
  const allowedIds = buildAllowedQuestions(questionIndex);
  const filteredPages = filterPagesByLGPD(form.PAGES || [], allowedIds);
  const answersCache = buildAnswersCache(answers || [], allowedIds);
  const latestUpdated = (answers || []).reduce<Date | null>((latest, answer) => {
    const candidate = answer.updatedAt || answer.createdAt;
    if (!candidate) return latest;
    const candidateDate = new Date(candidate);
    if (!latest || candidateDate > latest) {
      return candidateDate;
    }
    return latest;
  }, null);
  const updatedLabel = latestUpdated ? latestUpdated.toLocaleString() : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/respostas" className="text-sm text-blue-700 hover:underline">
          ← Regionais
        </Link>
        <Link href={`/respostas/${regionalId}`} className="text-sm text-blue-700 hover:underline">
          ← Centros da regional
        </Link>
        <span className="text-xs uppercase tracking-wide text-gray-500">
          Consulta pública
        </span>
      </div>

      <header className="space-y-2">
        <p className="text-sm text-gray-600">{regional.NOME_REGIONAL}</p>
        <h1 className="text-3xl font-semibold">
          {centro.NOME_CURTO || centro.NOME_CENTRO || "Centro"}
        </h1>
        <p className="text-sm text-gray-600">
          Visualização idêntica ao cadastro, mas sem edição. Alguns dados não são exibidos por
          questão de LGPD.
        </p>
        {updatedLabel && (
          <p className="text-xs text-gray-500">Última atualização: {updatedLabel}</p>
        )}
      </header>

      <PublicCentroReadOnly pages={filteredPages} answersCache={answersCache} />
    </div>
  );
}
export const revalidate = 0;
