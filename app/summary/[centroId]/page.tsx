'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FormInput from '@/components/FormInput';
import { Button } from '@/components/ui/button';

interface Group {
  _id: string;
  QUESTION: string;
  ANSWER_TYPE: string;
  IS_REQUIRED: boolean;
  PRESET_VALUES: string[];
}

interface Question {
  GROUP: Group[];
  IS_MULTIPLE: boolean;
  GROUP_NAME?: string;
}

interface Quiz {
  QUESTIONS: Question[];
  CATEGORY: string;
}

interface PageData {
  PAGE_NAME: string;
  QUIZES: Quiz[];
}

const fetchData = async (): Promise<PageData[]> => {
  const response = await fetch(`/api/forms?sortBy=VERSION:desc&NAME=Cadastro de Informações Anual`).then((res) =>
    res.json()
  );
  return response[0].PAGES;
};

export default function DynamicPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [dynamicGroups, setDynamicGroups] = useState<Record<string, Group[][]>>({});

  useEffect(() => {
    fetchData().then(setPages);
  }, []);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addGroup = (questionId: string, group: Group[]) => {
    setDynamicGroups((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), [...group]],
    }));
  };

  const removeGroup = (questionId: string, index: number) => {
    setDynamicGroups((prev) => {
      const groups = prev[questionId] || [];
      if (groups.length > 1) {
        groups.splice(index, 1);
        return { ...prev, [questionId]: [...groups] };
      }
      return prev;
    });
  };

  if (!pages.length) return <div>Carregando...</div>;

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
              <div key={quizIndex} className="border p-4 rounded-md">
                <h2 className="text-xl font-semibold">{quiz.CATEGORY}</h2>
                {quiz.QUESTIONS.map((question, questionIndex) => (
                  <div key={questionIndex} className="space-y-2">
                    {(dynamicGroups[`${quizIndex}-${questionIndex}`] || [[]]).map(
                      (groupSet, groupIndex) => (
                        <div key={groupIndex} className="flex items-center space-x-4 mt-4">
                          <div className="flex-1 flex space-x-4">
                            {groupSet.map((group) => (
                              <div key={`${group._id}-${groupIndex}`} className="flex-1">
                                <label className="block font-medium">{group.QUESTION}</label>
                                <FormInput
                                  type={group.ANSWER_TYPE.toLowerCase()}
                                  name={`${group._id}-${groupIndex}`}
                                  value={formData[`${group._id}-${groupIndex}`] || ''}
                                  onChange={handleInputChange}
                                  options={group.PRESET_VALUES}
                                  isDisabled={false}
                                  answerType={group.ANSWER_TYPE}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() =>
                                addGroup(`${quizIndex}-${questionIndex}`, question.GROUP)
                              }
                              className="text-green-500"
                            >
                              Adicionar
                            </Button>
                            <Button
                              onClick={() =>
                                removeGroup(`${quizIndex}-${questionIndex}`, groupIndex)
                              }
                              className="text-red-500"
                              disabled={
                                (dynamicGroups[`${quizIndex}-${questionIndex}`] || []).length ===
                                1
                              }
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
