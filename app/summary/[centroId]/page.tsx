"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizComponent } from "@components/QuizComponent";
import { ValidationTab } from "@components/ValidationTab";
import { CompletionNotification } from "@components/CompletionNotification";
import { Answer, Page } from "@/interfaces/form.interface";

export default function DynamicPage({ params }: any) {
  const { centroId } = params;

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answersCache, setAnswersCache] = useState<Record<string, Answer[]>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [formId, setFormId] = useState<string>("");
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);

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

  useEffect(() => {
    async function fetchData() {
      const [formResponse, answers] = await Promise.all([
        fetch("/api/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual").then((res) => res.json()),
        fetch(`/api/answers?CENTRO_ID=${centroId}`).then((res) => res.json()),
      ]);

      let cache: Record<string, any[]> = {};
      answers.forEach((answer: Answer) => {
        const questionId = answer.QUESTION_ID;
        if (!cache[questionId]) {
          cache[questionId] = [];
        }
        cache[questionId].push(answer);
      });

      const firstFormResponse = formResponse[0];
      setAnswersCache(cache);
      setPages(firstFormResponse.PAGES);
      setFormId(firstFormResponse._id);
      setIsLoading(false);
    }
    fetchData();
  }, [centroId]);

  const handlePreviousPage = () => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(prev + 1, pages.length));
  };

  const handleFormCompletion = () => {
    setShowCompletionNotification(true);
  };

  return (
    <div className="w-full p-6">
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

              <div className="flex justify-between items-center mt-6">
                <button
                  disabled={currentPageIndex === 0}
                  onClick={handlePreviousPage}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  Anterior
                </button>

                <div className="flex space-x-2">
                  {pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPageIndex(index)}
                      className={`px-4 py-2 rounded ${
                        currentPageIndex === index ? "bg-blue-500 text-white" : "bg-gray-300"
                      } hover:bg-blue-400`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPageIndex === pages.length}
                  onClick={handleNextPage}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
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

          {showCompletionNotification && (
            <CompletionNotification
              onSendEmail={() => {
                console.log("Resumo enviado por e-mail!");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
