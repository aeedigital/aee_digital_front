"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Answer, Page, Question, QuestionGroup, Quiz } from "@/interfaces/form.interface";

type AnswerCache = Record<string, (Answer & { createdAt?: string; updatedAt?: string })[]>;

type Props = {
  pages: Page[];
  answersCache: AnswerCache;
};

function ReadOnlyQuestion({
  question,
  answer,
}: {
  question: Question;
  answer?: Answer;
}) {
  const isEmpty = !answer?.ANSWER?.trim();

  return (
    <div className="flex-1 min-w-[220px]">
      <label className={`block font-medium mb-1 ${isEmpty ? "text-red-500" : ""}`}>
        {question.QUESTION}
        {question.IS_REQUIRED ? "*" : ""}
      </label>
      <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 min-h-[44px]">
        {isEmpty ? "Sem resposta" : answer?.ANSWER}
      </div>
      {isEmpty && question.IS_REQUIRED && (
        <p className="text-red-500 text-xs mt-1">Este campo é obrigatório.</p>
      )}
    </div>
  );
}

function ReadOnlyGroup({
  questionGroup,
  answersCache,
}: {
  questionGroup: QuestionGroup;
  answersCache: AnswerCache;
}) {
  const { IS_MULTIPLE, GROUP } = questionGroup;

  const groupCache = useMemo(
    () =>
      GROUP.map((q) => ({
        question: q,
        answers: answersCache[q._id] || [],
      })),
    [GROUP, answersCache]
  );

  const answersLength = useMemo(() => {
    if (!IS_MULTIPLE) return 1;
    const lengths = groupCache.map((item) => (item.answers?.length ? item.answers.length : 0));
    const max = lengths.length ? Math.max(...lengths) : 0;
    return Math.max(max, 1);
  }, [IS_MULTIPLE, groupCache]);

  return (
    <div className="space-y-6">
      {Array.from({ length: answersLength }).map((_, groupIndex) => (
        <div
          key={groupIndex}
          className="relative space-y-4 rounded-md border p-4 shadow-sm"
        >
          <div className="flex flex-wrap gap-4">
            {groupCache.map(({ question, answers }) => (
              <ReadOnlyQuestion
                key={`${question._id}-${groupIndex}`}
                question={question}
                answer={answers[groupIndex]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadOnlyQuiz({
  quiz,
  answersCache,
}: {
  quiz: Quiz;
  answersCache: AnswerCache;
}) {
  return (
    <div className="rounded-md border p-4 space-y-4">
      <h2 className="text-xl font-semibold">{quiz.CATEGORY}</h2>
      {quiz.QUESTIONS.map((group, idx) => (
        <ReadOnlyGroup
          key={idx}
          questionGroup={group}
          answersCache={answersCache}
        />
      ))}
    </div>
  );
}

export default function PublicCentroReadOnly({ pages, answersCache }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryPage = parseInt(searchParams.get("page") || "1", 10) - 1;
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(Math.max(queryPage, 0));

  useEffect(() => {
    if (Number.isFinite(queryPage) && queryPage !== currentPageIndex) {
      setCurrentPageIndex(Math.max(queryPage, 0));
    }
  }, [queryPage, currentPageIndex]);

  const totalPages = useMemo(() => pages.length, [pages.length]);

  const handlePageChange = useCallback(
    (pageIndex: number) => {
      const safeIndex = Math.min(Math.max(pageIndex, 0), totalPages - 1);
      setCurrentPageIndex(safeIndex);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", (safeIndex + 1).toString());
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, totalPages]
  );

  if (!pages.length) {
    return (
      <p className="text-sm text-gray-500">
        Nenhuma pergunta disponível para exibir neste centro.
      </p>
    );
  }

  const currentPage = pages[currentPageIndex] || pages[0];

  return (
    <div className="w-full">
      <div className="space-y-4">
        {currentPage.QUIZES.map((quiz, idx) => (
          <ReadOnlyQuiz key={idx} quiz={quiz} answersCache={answersCache} />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <button
          disabled={currentPageIndex === 0}
          onClick={() => handlePageChange(currentPageIndex - 1)}
          className="w-full sm:w-auto rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Anterior
        </button>

        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index)}
              className={`px-4 py-2 rounded ${
                currentPageIndex === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-blue-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          disabled={currentPageIndex === totalPages - 1}
          onClick={() => handlePageChange(currentPageIndex + 1)}
          className="w-full sm:w-auto rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
