import { Summary, SummaryResponse } from "@/interfaces/form.interface";
import {
  PUBLIC_DATA_HIDE_RULES,
  PublicDataHideRule,
} from "@/config/lgpd-hidden-questions";

type QuestionLike = {
  QUESTION?: string;
  QUESTION_ID?: string;
  _id?: string;
};

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

function matchesRule(question: QuestionLike, rule: PublicDataHideRule) {
  const questionId = normalize(question.QUESTION_ID ?? question._id);
  const questionText = normalize(question.QUESTION);

  if (rule.questionId && questionId === normalize(rule.questionId)) {
    return true;
  }

  if (rule.question && questionText === normalize(rule.question)) {
    return true;
  }

  if (rule.partial && questionText.includes(normalize(rule.partial))) {
    return true;
  }

  return false;
}

function isBlocked(question: QuestionLike, rules: PublicDataHideRule[]) {
  return rules.some((rule) => matchesRule(question, rule));
}

/**
 * Remove perguntas bloqueadas do summary antes de enviar para o cliente.
 */
export function filterSummaryForPublic(
  summary: Summary,
  rules: PublicDataHideRule[] = PUBLIC_DATA_HIDE_RULES
): Summary {
  const allowedQuestions = (summary.QUESTIONS || []).filter(
    (question: SummaryResponse | QuestionLike) => !isBlocked(question, rules)
  );

  return { ...summary, QUESTIONS: allowedQuestions as SummaryResponse[] };
}

/**
 * Remove perguntas bloqueadas de uma lista de respostas isoladas.
 */
export function filterResponsesForPublic(
  responses: SummaryResponse[],
  rules: PublicDataHideRule[] = PUBLIC_DATA_HIDE_RULES
) {
  return responses.filter((question) => !isBlocked(question, rules));
}
