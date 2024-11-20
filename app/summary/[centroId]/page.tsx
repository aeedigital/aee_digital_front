'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { QuizComponent } from '@components/QuizComponent';
import {Page} from '@/interfaces/form.interface'



export default function DynamicPage({params}:any) {
  const { centroId } = params;

  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    async function fetchData(){
      const formResponse = await fetch(`/api/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual`).then((res) =>
          res.json())
  
      setPages(formResponse[0].PAGES)
    };
    fetchData();
  }, [centroId]);

  return (
    <Tabs defaultValue={pages[0].PAGE_NAME} className="w-full p-6">
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
                centroId = {centroId}
                quiz={quiz}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
