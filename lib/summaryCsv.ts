import { Form, Question, Summary } from "@/interfaces/form.interface";

export type SummaryCsvRow = {
  centroNome: string;
  latestSummary?: Summary;
  regionalNome?: string;
};

type BuildSummaryCsvOptions = {
  questions: Question[];
  rows: SummaryCsvRow[];
  includeRegional?: boolean;
};

const LEGACY_QUESTION_ID_ALIASES: Record<string, string[]> = {
  // Compatibilidade temporária com summaries antigos do formulário 655d1d52e88893fbf20e6e00.
  "659467792f490be057cc4340": ["61df432fdf23b90014a944a5"], // Seu E-mail
  "659466f02f490be057cc433e": ["61df432fdf23b90014a944a2"], // Seu Nome
  "659467342f490be057cc433f": ["61df432fdf23b90014a944a3"], // Seu Telefone
  "659467a52f490be057cc4341": ["61df432fdf23b90014a944a6"], // Autorização de divulgação
  "659468cb2f490be057cc4344": ["61df432fdf23b90014a94556"], // Ingressaram desde a fundação do centro
  "659468972f490be057cc4343": ["61df432fdf23b90014a94555"], // Ingressaram no último ano
  "6594686b2f490be057cc4342": ["61df432fdf23b90014a94554"], // Encaminhadas para ingresso no último ano
};

export function getOrderedFormQuestions(form?: Partial<Form> | null): Question[] {
  const questions: Question[] = [];

  form?.PAGES?.forEach((page) => {
    page.QUIZES?.forEach((quiz) => {
      quiz.QUESTIONS?.forEach((group) => {
        group.GROUP?.forEach((question) => {
          questions.push(question);
        });
      });
    });
  });

  return questions;
}

function escapeCsvValue(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatAnswerForCsv(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true") {
    return "SIM";
  }

  if (normalizedValue === "false") {
    return "NÃO";
  }

  return value;
}

function getSummaryAnswersMap(summary?: Summary) {
  const answersMap = new Map<string, string>();

  summary?.QUESTIONS?.forEach((item) => {
    if (!item?.QUESTION) return;
    answersMap.set(item.QUESTION, item.ANSWER ?? "");
  });

  return answersMap;
}

function getAnswerForQuestion(answersMap: Map<string, string>, questionId: string) {
  const currentValue = answersMap.get(questionId) ?? "";
  if (currentValue.trim()) {
    return formatAnswerForCsv(currentValue);
  }

  const legacyQuestionIds = LEGACY_QUESTION_ID_ALIASES[questionId] || [];
  for (const legacyQuestionId of legacyQuestionIds) {
    const legacyValue = answersMap.get(legacyQuestionId) ?? "";
    if (legacyValue.trim()) {
      return formatAnswerForCsv(legacyValue);
    }
  }

  return "";
}

export function buildSummaryCsvContent({
  questions,
  rows,
  includeRegional = false,
}: BuildSummaryCsvOptions) {
  const headers = [
    ...(includeRegional ? ["Regional"] : []),
    "Centro",
    "Atualizado em",
    ...questions.map((question) => question.QUESTION),
  ];

  const csvRows = rows.map((row) => {
    const answersMap = getSummaryAnswersMap(row.latestSummary);
    const values = [
      ...(includeRegional ? [row.regionalNome ?? ""] : []),
      row.centroNome,
      row.latestSummary?.updatedAt || row.latestSummary?.createdAt || "",
      ...questions.map((question) => getAnswerForQuestion(answersMap, question._id)),
    ];

    return values.map(escapeCsvValue).join(";");
  });

  return [headers.map(escapeCsvValue).join(";"), ...csvRows].join("\r\n");
}

export function downloadCsvFile(fileName: string, content: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
