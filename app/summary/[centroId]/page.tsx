"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizComponent } from "@components/QuizComponent";
import { ValidationTab } from "@components/ValidationTab";
import { Answer, Page } from "@/interfaces/form.interface";

export default function DynamicPage({ params }: any) {
  const { centroId } = params;

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answersCache, setAnswersCache] = useState<Record<string, Answer[]>>({});
  const [invalidCounts, setInvalidCounts] = useState<Record<string, number>>({});
  const [totalInvalid, setTotalInvalid] = useState<number>(0);
  const [formId, setFormId] = useState<string>()

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

      const firstFormResponse = formResponse[0]

      setAnswersCache(cache);
      setPages(firstFormResponse.PAGES);

console.log("FORM", firstFormResponse)

      setFormId(firstFormResponse._id);
      setIsLoading(false);
    }
    fetchData();
  }, [centroId]);

  useEffect(() => {
    const invalidCountsPerPage: Record<string, number> = {};
    let totalInvalidCount = 0;

    pages.forEach((page) => {
      const flattenedQuestions = page.QUIZES.flatMap((quiz) =>
        quiz.QUESTIONS.flatMap((q) => q.GROUP || [])
      );

      const invalid = flattenedQuestions.filter((q) => {
        const answers = answersCache[q._id] || [];
        return q.IS_REQUIRED && (answers.length === 0 || answers.some((a) => !a.ANSWER || a.ANSWER.trim() === ""));
      });

      invalidCountsPerPage[page.PAGE_NAME] = invalid.length;
      totalInvalidCount += invalid.length;
    });

    setInvalidCounts(invalidCountsPerPage);
    setTotalInvalid(totalInvalidCount);
  }, [pages, answersCache]);

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
        <Tabs defaultValue={pages[0]?.PAGE_NAME || ""}>
          <TabsList className="flex">
            {pages.map((page) => (
              <TabsTrigger key={page.PAGE_NAME} value={page.PAGE_NAME}>
                {page.PAGE_NAME} ({invalidCounts[page.PAGE_NAME] || 0})
              </TabsTrigger>
            ))}
            <TabsTrigger value="validation">
              Validação ({totalInvalid})
            </TabsTrigger>
          </TabsList>

          {pages.map((page) => (
            <TabsContent key={page.PAGE_NAME} value={page.PAGE_NAME}>
              <div className="space-y-4">
                {page.QUIZES.map((quiz, quizIndex) => (
                  <QuizComponent
                    key={quizIndex}
                    centroId={centroId}
                    quiz={quiz}
                    initialCache={answersCache}
                    onAnswerChange={handleAnswerChange}
                  />
                ))}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="validation">
            <ValidationTab 
              questions={pages.flatMap((page) => page.QUIZES.flatMap((quiz) => quiz.QUESTIONS))} 
              answersCache={answersCache} 
              formId={formId}
              centroId={centroId}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
