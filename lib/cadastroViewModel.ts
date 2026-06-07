import { Answer, Form, Page, Question, QuestionGroup, Quiz } from "@/interfaces/form.interface";

export type CadastroAnswersCache = Record<string, Answer[]>;

export type ProjectedCadastroQuestionAnswer = {
  answer: Answer;
  answerIndex: number;
  isPlaceholder: boolean;
  question: Question;
};

export type ProjectedCadastroOccurrence = {
  occurrenceIndex: number;
  questionsAnswered: ProjectedCadastroQuestionAnswer[];
};

export type ProjectedCadastroGroup = {
  groupIndex: number;
  isMultiple: boolean;
  occurrences: ProjectedCadastroOccurrence[];
  questionGroup: QuestionGroup;
};

export type ProjectedCadastroQuiz = {
  category: string;
  groups: ProjectedCadastroGroup[];
  quiz: Quiz;
  quizIndex: number;
};

export type ProjectedCadastroPage = {
  page: Page;
  pageIndex: number;
  quizzes: ProjectedCadastroQuiz[];
  visiblePageIndex: number;
};

export function selectCurrentCadastroForm(forms: Form[] | null | undefined): Form {
  if (!Array.isArray(forms) || !forms[0]) {
    throw new Error("Formulário de cadastro anual não encontrado.");
  }

  return forms[0];
}

export function getCadastroVisiblePages(form: Pick<Form, "PAGES"> | null | undefined): Page[] {
  return (form?.PAGES || []).filter((page) => page.ROLE !== "coord_regional");
}

export function buildCadastroAnswersCache(answers: Answer[] | null | undefined): CadastroAnswersCache {
  const cache: CadastroAnswersCache = {};

  (answers || []).forEach((answer) => {
    if (!answer?.QUESTION_ID) return;
    if (!cache[answer.QUESTION_ID]) {
      cache[answer.QUESTION_ID] = [];
    }
    cache[answer.QUESTION_ID].push(answer);
  });

  return cache;
}

function createEmptyAnswer(question: Question, centroId = ""): Answer {
  return {
    _id: "",
    ANSWER: "",
    CENTRO_ID: centroId,
    QUESTION_ID: question._id,
    QUIZ_ID: "",
  };
}

export function projectCadastroQuestionGroup(
  questionGroup: QuestionGroup,
  answersCache: CadastroAnswersCache,
  options: { centroId?: string; groupIndex?: number } = {}
): ProjectedCadastroGroup {
  const groupCache: CadastroAnswersCache = {};

  questionGroup.GROUP.forEach((question) => {
    if (answersCache[question._id]) {
      groupCache[question._id] = answersCache[question._id];
    }
  });

  const occurrenceCount = questionGroup.IS_MULTIPLE
    ? Math.max(...Object.values(groupCache).map((answers) => answers.length), 1)
    : 1;

  const occurrences = Array.from({ length: occurrenceCount }, (_, occurrenceIndex) => {
    const questionsAnswered = questionGroup.GROUP.map((question) => {
      const answer = groupCache[question._id]?.[occurrenceIndex];

      return {
        answer: answer || createEmptyAnswer(question, options.centroId),
        answerIndex: occurrenceIndex,
        isPlaceholder: !answer,
        question,
      };
    });

    return {
      occurrenceIndex,
      questionsAnswered,
    };
  });

  return {
    groupIndex: options.groupIndex ?? 0,
    isMultiple: Boolean(questionGroup.IS_MULTIPLE),
    occurrences,
    questionGroup,
  };
}

export function projectCadastroPages(
  form: Form,
  answersCache: CadastroAnswersCache,
  options: { centroId?: string } = {}
): ProjectedCadastroPage[] {
  return getCadastroVisiblePages(form).map((page, visiblePageIndex) => {
    const pageIndex = form.PAGES.indexOf(page);

    return {
      page,
      pageIndex,
      visiblePageIndex,
      quizzes: page.QUIZES.map((quiz, quizIndex) => ({
        category: quiz.CATEGORY,
        quiz,
        quizIndex,
        groups: quiz.QUESTIONS.map((questionGroup, groupIndex) =>
          projectCadastroQuestionGroup(questionGroup, answersCache, {
            centroId: options.centroId,
            groupIndex,
          })
        ),
      })),
    };
  });
}
