import { Answer, Form, Question, QuestionAnswer, Quiz } from "@/interfaces/form.interface";

type PartialForm = Partial<Form> & {
  PAGES?: Array<{
    QUIZES?: Quiz[];
  }>;
};

type PartialFormPage = NonNullable<PartialForm["PAGES"]>[number];

type ExtractedCoordinatorFormData = {
  autoavaliacaoQuestion?: Question;
  questoes: Question[];
};

function getQuizByCategory(formPage: PartialFormPage | undefined, category: string) {
  return formPage?.QUIZES?.find((quiz) => quiz.CATEGORY === category);
}

function normalizeLabel(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function extractCoordinatorFormData(form?: PartialForm | null): ExtractedCoordinatorFormData {
  if (!form?.PAGES?.length) {
    return { autoavaliacaoQuestion: undefined, questoes: [] };
  }

  let autoavaliacaoQuestion: Question | undefined;
  let questoes: Question[] = [];

  for (const page of form.PAGES) {
    const quizAutoAvaliacao = getQuizByCategory(page, "Auto Avaliação");
    const quizCoordenador = getQuizByCategory(page, "Coordenador");

    if (!autoavaliacaoQuestion && quizAutoAvaliacao?.QUESTIONS?.[0]?.GROUP?.[0]) {
      autoavaliacaoQuestion = quizAutoAvaliacao.QUESTIONS[0].GROUP[0];
    }

    if (quizCoordenador?.QUESTIONS?.[0]?.GROUP?.length) {
      questoes = [...questoes, ...quizCoordenador.QUESTIONS[0].GROUP];
    }
  }

  return { autoavaliacaoQuestion, questoes };
}

export function getCoordinatorQuestionsFromAnswers(
  form: PartialForm | null | undefined,
  answers: Answer[] | undefined
): QuestionAnswer[] {
  const { questoes } = extractCoordinatorFormData(form);
  const allAnswers = Array.isArray(answers) ? answers : [];

  return questoes.map((question) => ({
    question,
    answer: allAnswers.find((item) => item.QUESTION_ID === question._id),
  }));
}

export function findQuestionByLabel(
  form: PartialForm | null | undefined,
  label: string
): Question | undefined {
  if (!form?.PAGES?.length) return undefined;

  const normalizedLabel = normalizeLabel(label);

  for (const page of form.PAGES) {
    for (const quiz of page.QUIZES || []) {
      for (const questionGroup of quiz.QUESTIONS || []) {
        for (const question of questionGroup.GROUP || []) {
          if (normalizeLabel(question.QUESTION) === normalizedLabel) {
            return question;
          }
        }
      }
    }
  }

  return undefined;
}

export function getQuestionAnswerFromAnswers(
  form: PartialForm | null | undefined,
  answers: Answer[] | undefined,
  label: string
): QuestionAnswer | undefined {
  const question = findQuestionByLabel(form, label);
  if (!question) return undefined;

  const allAnswers = Array.isArray(answers) ? answers : [];
  return {
    question,
    answer: allAnswers.find((item) => item.QUESTION_ID === question._id),
  };
}
