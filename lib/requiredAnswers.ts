type AnswerLike = {
  _id?: string;
  ANSWER?: unknown;
  updatedAt?: string;
  createdAt?: string;
};

type QuestionLike = {
  _id: string;
  IS_REQUIRED?: boolean;
};

const getObjectIdTimestamp = (id?: string): number | null => {
  if (!id || id.length < 8) return null;

  const prefix = id.substring(0, 8);
  if (!/^[0-9a-fA-F]{8}$/.test(prefix)) return null;

  const seconds = Number.parseInt(prefix, 16);
  if (Number.isNaN(seconds)) return null;

  return seconds * 1000;
};

export const getAnswerTimestamp = (answer?: AnswerLike): number | null => {
  if (!answer) return null;

  if (answer.updatedAt) {
    const updatedAt = new Date(answer.updatedAt).getTime();
    if (!Number.isNaN(updatedAt)) return updatedAt;
  }

  if (answer.createdAt) {
    const createdAt = new Date(answer.createdAt).getTime();
    if (!Number.isNaN(createdAt)) return createdAt;
  }

  return getObjectIdTimestamp(answer._id);
};

export const pickCurrentAnswer = <T extends AnswerLike>(answers: T[] = []): T | undefined => {
  if (!answers.length) return undefined;

  const decorated = answers.map((answer, index) => ({
    answer,
    index,
    timestamp: getAnswerTimestamp(answer),
  }));

  decorated.sort((a, b) => {
    if (a.timestamp !== null && b.timestamp !== null) {
      if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
      return b.index - a.index;
    }

    if (a.timestamp !== null) return -1;
    if (b.timestamp !== null) return 1;
    return b.index - a.index;
  });

  return decorated[0]?.answer;
};

export const isRequiredAnswerFilled = (answer?: AnswerLike): boolean => {
  if (!answer) return false;

  if (typeof answer.ANSWER === "string") {
    return answer.ANSWER.trim().length > 0;
  }

  if (answer.ANSWER === null || answer.ANSWER === undefined) {
    return false;
  }

  return String(answer.ANSWER).trim().length > 0;
};

export const hasAnyFilledAnswer = <T extends AnswerLike>(answers: T[] = []): boolean => {
  return answers.some((answer) => isRequiredAnswerFilled(answer));
};

export const pickBestRequiredAnswer = <T extends AnswerLike>(answers: T[] = []): T | undefined => {
  if (!answers.length) return undefined;

  const filledAnswers = answers.filter((answer) => isRequiredAnswerFilled(answer));
  if (filledAnswers.length > 0) {
    return pickCurrentAnswer(filledAnswers);
  }

  return pickCurrentAnswer(answers);
};

export type RequiredValidationDebugItem = {
  questionId: string;
  required: boolean;
  answersCount: number;
  hasAnyFilled: boolean;
  currentAnswer: unknown;
  currentAnswerId?: string;
  selectedAnswer: unknown;
  selectedAnswerId?: string;
};

export const buildRequiredValidationDebug = <Q extends QuestionLike, A extends AnswerLike>(
  questions: Q[],
  answersCache: Record<string, A[]>
): RequiredValidationDebugItem[] => {
  return questions.map((question) => {
    const answers = answersCache[question._id] || [];
    const currentAnswer = pickCurrentAnswer(answers);
    const selectedAnswer = pickBestRequiredAnswer(answers);

    return {
      questionId: question._id,
      required: Boolean(question.IS_REQUIRED),
      answersCount: answers.length,
      hasAnyFilled: hasAnyFilledAnswer(answers),
      currentAnswer: currentAnswer?.ANSWER,
      currentAnswerId: currentAnswer?._id,
      selectedAnswer: selectedAnswer?.ANSWER,
      selectedAnswerId: selectedAnswer?._id,
    };
  });
};

export const getInvalidRequiredQuestions = <Q extends QuestionLike, A extends AnswerLike>(
  questions: Q[],
  answersCache: Record<string, A[]>
): Q[] => {
  return questions.filter((question) => {
    if (!question.IS_REQUIRED) return false;
    return !hasAnyFilledAnswer(answersCache[question._id] || []);
  });
};
