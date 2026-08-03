"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingPlaceholder } from "@/components/LoadingPlaceholder";
import { QuizComponent } from "@components/QuizComponent";
import { ValidationTab } from "@components/ValidationTab";
import { Answer, Form, Page } from "@/interfaces/form.interface";
import { useSearchParams, useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { fetchJsonCached } from "@/lib/fetchWithCache";
import {
  buildCadastroAnswersCache,
  getCadastroVisiblePages,
  selectCurrentCadastroForm,
} from "@/lib/cadastroViewModel";

type SummaryForCadastro = {
  CENTRO_ID: string;
  FORM_ID: string;
  QUESTIONS?: Array<{
    _id: string;
    ANSWER?: string;
    QUESTION: string;
    ANSWER_ID?: string;
    GROUP_KEY?: string;
    GROUP_INSTANCE_ID?: string;
    OCCURRENCE_ORDER?: number;
    QUESTION_ORDER?: number;
  }>;
};

async function fetchJsonNoStore<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), { cache: "no-store" });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro ao buscar ${path} (${response.status})`);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export default function CadastroPageWrapper() {
  return (
    <Suspense fallback={<LoadingPlaceholder message="Carregando cadastro..." lines={4} />}>
      <CadastroPage />
    </Suspense>
  );
}

function CadastroPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const centroId = searchParams.get("centroId");

  const [pages, setPages] = useState<Page[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answersCache, setAnswersCache] = useState<Record<string, Answer[]>>({});
  const [formId, setFormId] = useState<string>("");

  // Obtém a página da URL e converte para número (default = 1)
  const queryPage = parseInt(searchParams.get("page") || "1", 10) - 1;
  const totalPages = useMemo(() => pages.length + 1, [pages]); // inclui validação
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(Math.max(queryPage, 0));

  // Atualiza a URL ao mudar de página
  const updatePageInUrl = useCallback((pageIndex: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (pageIndex + 1).toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    let summaryId = searchParams.get("summaryId");

    if (!centroId) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);

      try {
        const formResponse = (await fetchJsonCached(
          apiUrl("/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual")
        )) as Form[];

        let answers: Answer[];

        if (summaryId) {
          const summary = await fetchJsonNoStore<SummaryForCadastro>(`/summaries/${summaryId}`);
          answers = (summary?.QUESTIONS || []).map((answer) => ({
            QUESTION_ID: answer.QUESTION,
            CENTRO_ID: summary.CENTRO_ID,
            ANSWER: answer.ANSWER ?? "",
            _id: answer.ANSWER_ID || answer._id,
            QUIZ_ID: "",
            FORM_ID: summary.FORM_ID,
            GROUP_KEY: answer.GROUP_KEY,
            GROUP_INSTANCE_ID: answer.GROUP_INSTANCE_ID,
            GROUP_OCCURRENCE_ORDER: answer.OCCURRENCE_ORDER,
            QUESTION_ORDER: answer.QUESTION_ORDER,
          }));
        } else {
          answers = await fetchJsonNoStore<Answer[]>(`/answers?CENTRO_ID=${centroId}`);
        }

        const cache = buildCadastroAnswersCache(answers);
        const firstFormResponse = selectCurrentCadastroForm(formResponse);
        const formWithoutRolePages = getCadastroVisiblePages(firstFormResponse);

        setAnswersCache(cache);
        setAllPages(firstFormResponse.PAGES);
        setPages(formWithoutRolePages);
        setFormId(firstFormResponse._id);

        // Garante que a página inicial seja válida
        if (queryPage >= totalPages) {
          setCurrentPageIndex(0);
          updatePageInUrl(0);
        } else {
          setCurrentPageIndex(queryPage);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [centroId, queryPage, totalPages, updatePageInUrl, searchParams]);

  const handleAnswerChange = async (
    questionId: string,
    answerId: string | null,
    newAnswer: Answer | null
  ) => {
    setAnswersCache((prev) => {
      if (!questionId) {
        console.warn("Nenhum questionId fornecido.");
        return prev;
      }

      const existingAnswers = prev[questionId] || [];
      let updatedAnswers: (Answer | null)[];

      if (existingAnswers.length > 0) {
        if (newAnswer === null && answerId !== null) {
          updatedAnswers = existingAnswers.filter((answer) => answer._id !== answerId);
        } else if (newAnswer && answerId) {
          const replaced = existingAnswers.map((answer) =>
            answer._id === answerId ? newAnswer : answer
          );
          const didReplace = replaced.some((answer) => answer._id === answerId);
          updatedAnswers = didReplace ? replaced : [...replaced, newAnswer];
        } else if (newAnswer && !answerId) {
          updatedAnswers = [...existingAnswers, newAnswer];
        } else {
          return prev;
        }
      } else {
        updatedAnswers = [newAnswer];
      }

      const nonNullAnswers = updatedAnswers.filter((answer): answer is Answer => answer !== null);
      const answersWithId = nonNullAnswers.filter((answer) => Boolean(answer._id));
      const answersWithoutId = nonNullAnswers.filter((answer) => !answer._id);

      const deduplicatedAnswers = [
        ...Array.from(new Map(answersWithId.map((answer) => [answer._id, answer])).values()),
        ...answersWithoutId,
      ];

      const debugEnabled =
        typeof window !== "undefined" &&
        (new URLSearchParams(window.location.search).get("debugValidation") === "1" ||
          window.localStorage.getItem("debugValidation") === "1");

      if (debugEnabled) {
        console.groupCollapsed(`[Cadastro] update answersCache question=${questionId}`);
        console.log("answerId recebido:", answerId);
        console.log("newAnswer:", newAnswer);
        console.log(
          "antes:",
          existingAnswers.map((a) => ({ _id: a._id, ANSWER: a.ANSWER, updatedAt: (a as any).updatedAt }))
        );
        console.log(
          "depois:",
          deduplicatedAnswers.map((a) => ({ _id: a._id, ANSWER: a.ANSWER, updatedAt: (a as any).updatedAt }))
        );
        console.groupEnd();
      }

      return { ...prev, [questionId]: deduplicatedAnswers };
    });
  };

  const handlePageChange = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
    updatePageInUrl(pageIndex);
  };

  if (!centroId) {
    return <div>Centro não informado.</div>;
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="mt-4 space-y-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/4" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ) : (
        <div>
          {currentPageIndex < pages.length ? (
            <div>
              <div className="space-y-4">
                {pages[currentPageIndex].QUIZES.map((quiz, quizIndex) => {
                  const quizQuestionIds = quiz.QUESTIONS.flatMap((questionGroup) =>
                    questionGroup.GROUP.map((question) => question._id)
                  ).join("-");
                  const quizKey = `${quiz.CATEGORY}-${quizQuestionIds}`;

                  return (
                    <QuizComponent
                      key={quizKey}
                      centroId={centroId}
                      quiz={quiz}
                      initialCache={answersCache}
                      onAnswerChange={handleAnswerChange}
                      formId={formId}
                      pageIndex={allPages.indexOf(pages[currentPageIndex])}
                      quizIndex={quizIndex}
                    />
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col items-center space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <button
                  disabled={currentPageIndex === 0}
                  onClick={() => handlePageChange(currentPageIndex - 1)}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 w-full sm:w-auto"
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
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 w-full sm:w-auto"
                >
                  Próximo
                </button>
              </div>
            </div>
          ) : (
            <ValidationTab
              questions={allPages.flatMap((page) => page.QUIZES.flatMap((quiz) => quiz.QUESTIONS))}
              answersCache={answersCache}
              formId={formId}
              centroId={centroId}
              onPrevious={() => handlePageChange(currentPageIndex - 1)}
              onComplete={() => router.push(`/cadastro/agradecimento`)}
            />
          )}
        </div>
      )}
    </div>
  );
}
