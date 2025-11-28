"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

import { QuestionComponent } from "./QuestionComponent";
import { Question, QuestionGroup, Answer } from "@/interfaces/form.interface";
import { useToast } from "@/hooks/use-toast";
import { FiPlus, FiTrash } from "react-icons/fi";
import { apiUrl } from "@/lib/api";

const parseJsonSafe = async (res: Response) => {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

interface QuestionProps {
  questionGroup: QuestionGroup;
  centroId: string;
  initialCache: Record<string,Answer[]>;
  onAnswerChange: (questionId:string, answerId: string | null, newAnswer: Answer | null) => void; // Função para atualizar respostas
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
  const initializedRef = useRef(false);
  

  const setGroupCache = useCallback(() => {
    const localCache: Record<string, Answer[]> = {};

    questionGroup.GROUP.forEach((question) => {
      if (initialCache[question._id]) {
        localCache[question._id] = initialCache[question._id];
      }
    });

    return localCache;
  }, [questionGroup.GROUP, initialCache]);

  const removeAnswer = async(questionId:string, answerId:string): Promise<any> =>{

    const answerRemoved = await fetch(apiUrl(`/answers/${answerId}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(async (res:any) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro ao remover resposta");
      }
      return parseJsonSafe(res);
    });

    onAnswerChange(questionId, answerId, null)

    return answerRemoved;
  }

  const createAnswer = useCallback(async (questionId: string, value: string): Promise<any>=>{
    const answerCreated = await fetch(apiUrl(`/answers`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ANSWER: String(value),
        CENTRO_ID: centroId,
        QUESTION_ID: questionId
      }),
    }).then((res:any) => res.json());

    onAnswerChange(questionId, null, answerCreated)

    return answerCreated;
  }, [centroId, onAnswerChange]);

  const initializeEmptyGroups = useCallback((shouldCreateQuestions:boolean) => {
    const emptyGroups: QuestionAnswerGroup[] = [];
    // Create a single empty group initially
    const emptyGroup: QuestionAnswerGroup = {
      questionsAnswered: questionGroup.GROUP.map((question) => {

        const questionAnswered = {
          question,
          answer: {
            CENTRO_ID: centroId,
            QUIZ_ID: "",
            QUESTION_ID: question._id,
            ANSWER: "",
            _id:""
          }
        }
        if(shouldCreateQuestions){
          createAnswer(question._id, " ")
        }

        return questionAnswered;
      }),
    };
    emptyGroups.push(emptyGroup);

    return emptyGroups;
  }, [questionGroup.GROUP, centroId, createAnswer]);


  const handleAddGroup = () => {
    const newEmptyGroup = initializeEmptyGroups(true)[0]; // Create one empty group
    setAnswerGroups((prevGroups) => [...prevGroups, newEmptyGroup]);
  };

  const handleRemoveGroup = (index: number) => {
    if (answerGroups.length > 1) {
      const answerGroupToRemove = answerGroups[index];

      for (let index = 0; index < answerGroupToRemove.questionsAnswered.length; index++) {
        const questionAnswered = answerGroupToRemove.questionsAnswered[index];
        const {question, answer} = questionAnswered;

        removeAnswer(question._id, answer._id)
      }

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

    // Initialize empty groups only once to avoid flicker on updates
    if (!initializedRef.current) {
      setAnswerGroups(initializeEmptyGroups(false));
      initializedRef.current = true;
    }
    fetchAnswers();
  }, [questionGroup, centroId, initialCache, initializeEmptyGroups, setGroupCache]);

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
