"use client";

import { useEffect, useState,useMemo } from "react";

import { QuestionComponent } from "./QuestionComponent";
import { Question, QuestionGroup, Answer } from "@/interfaces/form.interface";
import { useToast } from "@/hooks/use-toast";
import { FiPlus, FiTrash } from "react-icons/fi";

interface QuestionProps {
  questionGroup: QuestionGroup;
  centroId: string;
  initialCache: Record<string,Answer[]>;
  onAnswerChange: (answerId: string | null, newAnswer: Answer) => void; // Função para atualizar respostas
}

interface QuestionAnswer {
  question: Question;
  answer: Answer;
}

interface QuestionAnswerGroup {
  questionsAnswered: QuestionAnswer[];
}

export function GroupQuestionComponent({ questionGroup, centroId, initialCache, onAnswerChange }: QuestionProps) {
  const { toast } = useToast();
  const [answerGroups, setAnswerGroups] = useState<QuestionAnswerGroup[]>([]);
  

  function setGroupCache() {
    const localCache: Record<string, Answer[]> = {}

    questionGroup.GROUP.forEach(question => {
      if (initialCache[question._id]) {
        localCache[question._id] = initialCache[question._id]
      }
    });

    return localCache;
  }

  function updateCachedAnswer(questionId: string, answerId: string, answerValue: string){

  }



  const initializeEmptyGroups = () => {
    const emptyGroups: QuestionAnswerGroup[] = [];
    // Create a single empty group initially
    const emptyGroup: QuestionAnswerGroup = {
      questionsAnswered: questionGroup.GROUP.map((question) => ({
        question,
        answer: {
          CENTRO_ID: centroId,
          QUIZ_ID: "",
          QUESTION_ID: question._id,
          ANSWER: "",
          _id:""
        },
      })),
    };
    emptyGroups.push(emptyGroup);

    return emptyGroups;
  };

  const handleAddGroup = () => {
    const newEmptyGroup = initializeEmptyGroups()[0]; // Create one empty group
    setAnswerGroups((prevGroups) => [...prevGroups, newEmptyGroup]);
  };

  const handleRemoveGroup = (index: number) => {
    if (answerGroups.length > 1) {
      setAnswerGroups((prevGroups) => prevGroups.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Não Permitido",
        variant: "destructive",
        description: "É necessário ter pelo menos uma resposta",
      });
    }
  };

  useEffect(() => {
    async function fetchAnswers() {
      const tempAnswerGroups: QuestionAnswerGroup[] = [];

      const groupCache = setGroupCache()

      let answersLength =1
      if(questionGroup.IS_MULTIPLE){
        answersLength = Math.max(...Object.values(groupCache).map((a) => a.length), 1);
      }

      for (let i = 0; i < answersLength; i++) {
        const group: QuestionAnswerGroup = {
          questionsAnswered: questionGroup.GROUP.map((question) => {
            const answer = groupCache[question._id]?.[i] || {
              CENTRO_ID: centroId,
              QUIZ_ID: "",
              QUESTION_ID: question._id,
              ANSWER: "",
            };

            return { question, answer };
          })
        };
        tempAnswerGroups.push(group);
      }
      setAnswerGroups(tempAnswerGroups);
    }

    // Initialize with empty groups and then fetch answers
    setAnswerGroups(initializeEmptyGroups());
    fetchAnswers();
  }, [questionGroup, centroId, initialCache]);

  return (
    <div className="space-y-6">
      {answerGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="relative space-y-4 border p-4 rounded-md shadow-sm">
          <div className="flex flex-wrap gap-4">
            {group.questionsAnswered.map((questionAnswered, questionIndex) => (
              <QuestionComponent
                key={questionIndex}
                centroId={centroId}
                answer={questionAnswered.answer}
                question={questionAnswered.question}
                questionIndex={questionIndex}
                onAnswerChange={onAnswerChange}
              />
            ))}
          </div>

          {questionGroup.IS_MULTIPLE && (
            <div className="absolute -top-2 right-2 flex space-x-2">
              <button
                type="button"
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                onClick={handleAddGroup}
              >
                <FiPlus className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                onClick={() => handleRemoveGroup(groupIndex)}
              >
                <FiTrash className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
