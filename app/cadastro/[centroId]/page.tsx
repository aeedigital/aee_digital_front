"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizComponent } from "@components/QuizComponent";
import { ValidationTab } from "@components/ValidationTab";
import { CompletionNotification } from "@components/CompletionNotification";
import { Answer, Page } from "@/interfaces/form.interface";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';


export default function DynamicPage({ params }: any) {
  const { centroId } = params;

  const searchParams = useSearchParams();
  const router = useRouter();
    

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answersCache, setAnswersCache] = useState<Record<string, Answer[]>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [formId, setFormId] = useState<string>("");

  // Fetch de dados baseado no summaryId ou centroId
  useEffect(() => {
    let summaryId = searchParams.get("summaryId");

    async function fetchData() {
      setIsLoading(true);

      try {
        const formResponse = await fetch(
          "/api/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual"
        ).then((res) => res.json());

        let answers;

        if (summaryId) {
          const summary = await fetch(`/api/summaries/${summaryId}`).then((res) => res.json());
          answers = summary?.QUESTIONS.map((answer: any) => ({
            QUESTION_ID: answer.QUESTION,
            CENTRO_ID: summary.CENTRO_ID,
            ANSWER: answer.ANSWER,
            _id: answer._id,
          }));
        } else {
          answers = await fetch(`/api/answers?CENTRO_ID=${centroId}`).then((res) => res.json());
        }

        const cache: Record<string, any[]> = {};
        answers.forEach((answer: Answer) => {
          const questionId = answer.QUESTION_ID;
          if (!cache[questionId]) {
            cache[questionId] = [];
          }
          cache[questionId].push(answer);
        });

        const firstFormResponse = formResponse[0];

        const formWithoutRolePages = firstFormResponse.PAGES.filter((page:Page) => page.ROLE !== "coord_regional");

        setAnswersCache(cache);
        setPages(formWithoutRolePages);
        setFormId(firstFormResponse._id);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [centroId]);

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
      let updatedAnswers;

      if (newAnswer === null && answerId !== null) {
        updatedAnswers = existingAnswers.filter((answer) => answer._id !== answerId);
      } else if (newAnswer && answerId) {
        updatedAnswers = existingAnswers.map((answer) =>
          answer._id === answerId ? newAnswer : answer
        );
      } else if (newAnswer && !answerId) {
        updatedAnswers = [...existingAnswers, newAnswer];
      } else {
        return prev;
      }

      return { ...prev, [questionId]: updatedAnswers };
    });
  };

  const handlePreviousPage = () => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(prev + 1, pages.length));
  };

  const handleFormCompletion = () => {
    router.push(`/cadastro/agradecimento`);
  };

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
          {pages.length > 0 && currentPageIndex < pages.length && (
            <div>
              <div className="space-y-4">
                {pages[currentPageIndex].QUIZES.map((quiz, quizIndex) => (
                  <QuizComponent
                    key={quizIndex}
                    centroId={centroId}
                    quiz={quiz}
                    initialCache={answersCache}
                    onAnswerChange={handleAnswerChange}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col items-center space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <button
                  disabled={currentPageIndex === 0}
                  onClick={handlePreviousPage}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 w-full sm:w-auto"
                >
                  Anterior
                </button>

                <div className="flex flex-wrap justify-center gap-2">
                  {pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPageIndex(index)}
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
                  disabled={currentPageIndex === pages.length}
                  onClick={handleNextPage}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 w-full sm:w-auto"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {currentPageIndex === pages.length && (
            <ValidationTab
              questions={pages.flatMap((page) => page.QUIZES.flatMap((quiz) => quiz.QUESTIONS))}
              answersCache={answersCache}
              formId={formId}
              centroId={centroId}
              onPrevious={handlePreviousPage}
              onComplete={handleFormCompletion}
            />
          )}
        </div>
      )}
    </div>
  );
}
