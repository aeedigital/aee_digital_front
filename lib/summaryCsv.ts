import { format } from "date-fns";

import { Answer, Form, Page, Question } from "@/interfaces/form.interface";
import { ProjectedCadastroPage } from "@/lib/cadastroViewModel";

export type CadastroCsvRow = {
  centroId: string;
  centroNome: string;
  centroNomeCurto?: string;
  form: Form;
  projectedPages: ProjectedCadastroPage[];
  regionalNome?: string;
};

type BuildCadastroCsvOptions = {
  includeRegional?: boolean;
  rows: CadastroCsvRow[];
};

type CadastroCsvColumn = {
  header: string;
  groupIndex: number;
  occurrenceIndex: number;
  question: Question;
  questionIndex: number;
  quizIndex: number;
  visiblePageIndex: number;
};

function getPageName(page: Page, fallbackIndex: number) {
  const pageWithLegacyName = page as Page & { NAME?: string };
  return page.PAGE_NAME || pageWithLegacyName.NAME || `Página ${fallbackIndex + 1}`;
}

function neutralizeCsvFormula(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

export function escapeCsvValue(value: unknown) {
  const safeValue = neutralizeCsvFormula(String(value ?? ""));
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function isValidDate(value: Date) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function formatCadastroAnswerForCsv(answer: Answer | undefined, question: Pick<Question, "ANSWER_TYPE">) {
  const rawValue = answer?.ANSWER;

  if (rawValue === null || rawValue === undefined) {
    return "";
  }

  const value = String(rawValue);
  if (!value.trim()) {
    return "";
  }

  if (question.ANSWER_TYPE === "Boolean" || question.ANSWER_TYPE === "Switch") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") {
      return "SIM";
    }

    if (normalizedValue === "false") {
      return "NÃO";
    }
  }

  if (question.ANSWER_TYPE === "Date") {
    const date = new Date(value);
    return isValidDate(date) ? format(date, "dd/MM/yyyy") : value;
  }

  return value;
}

function getMaxOccurrencesForGroup(rows: CadastroCsvRow[], visiblePageIndex: number, quizIndex: number, groupIndex: number) {
  return Math.max(
    1,
    ...rows.map((row) => {
      return (
        row.projectedPages[visiblePageIndex]?.quizzes[quizIndex]?.groups[groupIndex]?.occurrences.length || 1
      );
    })
  );
}

function buildCadastroCsvColumns(rows: CadastroCsvRow[]): CadastroCsvColumn[] {
  const firstRow = rows[0];
  if (!firstRow) return [];

  const columns: CadastroCsvColumn[] = [];

  firstRow.projectedPages.forEach((page, visiblePageIndex) => {
    page.quizzes.forEach((quiz, quizIndex) => {
      quiz.groups.forEach((group, groupIndex) => {
        const maxOccurrences = getMaxOccurrencesForGroup(rows, visiblePageIndex, quizIndex, groupIndex);

        for (let occurrenceIndex = 0; occurrenceIndex < maxOccurrences; occurrenceIndex += 1) {
          group.questionGroup.GROUP.forEach((question, questionIndex) => {
            columns.push({
              groupIndex,
              occurrenceIndex,
              question,
              questionIndex,
              quizIndex,
              visiblePageIndex,
              header: [
                getPageName(page.page, visiblePageIndex),
                quiz.category || `Quiz ${quizIndex + 1}`,
                `Grupo ${groupIndex + 1}`,
                `Ocorrência ${occurrenceIndex + 1}`,
                question.QUESTION,
              ].join(" / "),
            });
          });
        }
      });
    });
  });

  return columns;
}

function getCellValue(row: CadastroCsvRow, column: CadastroCsvColumn) {
  const answer =
    row.projectedPages[column.visiblePageIndex]?.quizzes[column.quizIndex]?.groups[column.groupIndex]?.occurrences[
      column.occurrenceIndex
    ]?.questionsAnswered[column.questionIndex]?.answer;

  return formatCadastroAnswerForCsv(answer, column.question);
}

export function buildCadastroCsvContent({ includeRegional = false, rows }: BuildCadastroCsvOptions) {
  const fixedHeaders = [
    ...(includeRegional ? ["Regional"] : []),
    "Centro ID",
    "Centro",
    "Nome curto",
    "Formulário ID",
    "Formulário",
    "Versão do formulário",
  ];

  const dynamicColumns = buildCadastroCsvColumns(rows);
  const headers = [...fixedHeaders, ...dynamicColumns.map((column) => column.header)];

  const csvRows = rows.map((row) => {
    const values = [
      ...(includeRegional ? [row.regionalNome ?? ""] : []),
      row.centroId,
      row.centroNome,
      row.centroNomeCurto ?? "",
      row.form._id,
      row.form.NAME,
      row.form.VERSION,
      ...dynamicColumns.map((column) => getCellValue(row, column)),
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
