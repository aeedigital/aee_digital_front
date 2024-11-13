'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from "@/components/ui/skeleton"

import { QuizComponent } from '@components/QuizComponent';
import {Page} from '@/interfaces/form.interface'



export default function DynamicPage({params}:any) {
  const { centroId } = params;

  const [pages, setPages] = useState<Page[]>([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    async function fetchData(){
      const [formResponse, answerResponse] = await Promise.all([
        fetch(`/api/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual`).then((res) =>
          res.json()),
        fetch(`/api/answers?CENTRO_ID=${centroId}`).then((res) =>
          res.json())
      ])
  
      setAnswers(answerResponse);
      setPages(formResponse[0].PAGES)
    };
    fetchData();
  }, [centroId]);


  if (!pages.length) return     <div className="flex flex-col space-y-3">
  <Skeleton className="h-[125px] w-[250px] rounded-xl" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>;

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
                answers = {answers}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
