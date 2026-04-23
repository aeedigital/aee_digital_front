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

function getSummaryAnswersMap(summary?: Summary) {
  const answersMap = new Map<string, string>();

  summary?.QUESTIONS?.forEach((item) => {
    if (!item?.QUESTION) return;
    answersMap.set(item.QUESTION, item.ANSWER ?? "");
  });

  return answersMap;
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
      ...questions.map((question) => answersMap.get(question._id) ?? ""),
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
