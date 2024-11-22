'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizComponent } from '@components/QuizComponent';
import { Page } from '@/interfaces/form.interface';

export default function DynamicPage({ params }: any) {
  const { centroId } = params;

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      const formResponse = await fetch(
        `/api/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual`
      ).then((res) => res.json());

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
