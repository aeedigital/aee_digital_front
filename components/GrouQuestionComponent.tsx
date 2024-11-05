"use client"

import { useState } from 'react';
import { QuestionComponent } from './QuestionComponent';
import { Question, QuestionGroup } from '@/interfaces/form.interface';
import { useToast } from "@/hooks/use-toast"

interface QuestionProps {
  questionGroup: QuestionGroup;
  centroId: string;
}

export function GroupQuestionComponent({ questionGroup, centroId }: QuestionProps) {
  const { toast } = useToast()

  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([questionGroup]);

  const handleAddGroup = () => {
    setQuestionGroups([...questionGroups, { ...questionGroup }]);
  };

  const handleRemoveGroup = (index: number) => {
    if (questionGroups.length > 1) {
      setQuestionGroups(questionGroups.filter((_, i) => i !== index));
    }else{
      toast({
        title: "Não Permitido",
        variant: "destructive",

        description: "É necessário ter pelo menos uma resposta",
      })
    }
  };

  return (
    <div className="space-y-4">
      {questionGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4 relative">
          {group.GROUP && (
            <div className="flex flex-wrap gap-4">
              {group.GROUP.map((question: Question, questionIndex) => (
                <QuestionComponent
                  key={questionIndex}
                  centroId={centroId}
                  question={question}
                  questionIndex={questionIndex}
                />
              ))}
            </div>
          )}

          {questionGroup.IS_MULTIPLE && (
            <div className="absolute top-0 right-0 flex space-x-2">
              <button
                type="button"
                className="px-2 py-1 bg-green-500 text-white rounded"
                onClick={handleAddGroup}
              >
                Adicionar
              </button>
              <button
                type="button"
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleRemoveGroup(groupIndex)}
              >
                Remover
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
