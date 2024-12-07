'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizComponent } from '@components/QuizComponent';
import { Answer, Page } from '@/interfaces/form.interface';

export default function DynamicPage({ params }: any) {
  const { centroId } = params;

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answersCache, setAnswersCache] = useState<Record<string, Answer[]>>({}); // Cache para múltiplas respostas por questão


  const handleAnswerChange = async (
    questionId: string,
    answerId: string | null,
    newAnswer: Answer | null
  ) => {
    setAnswersCache((prev) => {
      console.log("Vai atualizar o cache", questionId, answerId, newAnswer);

      if (!questionId) {
        console.warn("Nenhum questionId fornecido.");
        return prev;
      }

      const existingAnswers = prev[questionId] || [];
      let updatedAnswers;

      if (newAnswer === null && answerId !== null) {
        // Remover uma resposta específica
        updatedAnswers = existingAnswers.filter((answer) => answer._id !== answerId);
        console.log("Resposta removida", updatedAnswers);
      } else if (newAnswer && answerId) {
        // Atualizar uma resposta existente
        updatedAnswers = existingAnswers.map((answer) =>
          answer._id === answerId ? newAnswer : answer
        );
        console.log("Resposta atualizada", updatedAnswers);
      } else if (newAnswer && !answerId) {
        // Adicionar uma nova resposta
        updatedAnswers = [...existingAnswers, newAnswer];
        console.log("Nova resposta adicionada", updatedAnswers);
      } else {
        // Caso inválido
        console.warn("Nenhuma operação realizada. Verifique os parâmetros.");
        return prev;
      }

      return { ...prev, [questionId]: updatedAnswers };
    });
  };



  useEffect(() => {
    async function fetchData() {
      const [formResponse, answers] = await Promise.all([
        fetch(`/api/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual`).then((res) => res.json()),
        fetch(`/api/answers?CENTRO_ID=${centroId}`).then((res) => res.json())
      ])

      let cache: Record<string, any[]> = {}
      answers.forEach((answer: Answer) => {
        const questionId = answer.QUESTION_ID;
        if (!cache[questionId]) {
          cache[questionId] = []
        }
        cache[questionId].push(answer)
      }
      );

      setAnswersCache(cache);
      setPages(formResponse[0].PAGES);
      setIsLoading(false);
    }
    fetchData();
  }, [centroId]);

  return (
    <div className="w-full p-6">
      {isLoading ? (
        <div className="space-y-4">
          {/* Skeleton para a lista de tabs */}
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          {/* Skeleton para o conteúdo das abas */}
          <div className="mt-4 space-y-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/4" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ) : (
        <Tabs defaultValue={pages[0].PAGE_NAME}>
          <TabsList className="flex">
            {pages.map((page) => (
              <TabsTrigger key={page.PAGE_NAME} value={page.PAGE_NAME}>
                {page.PAGE_NAME}
              </TabsTrigger>
            ))}
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
        </Tabs>
      )}
    </div>
  );
}
