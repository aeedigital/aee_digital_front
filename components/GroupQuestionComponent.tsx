"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { QuestionComponent } from "./QuestionComponent";
import { Question, QuestionGroup, Answer } from "@/interfaces/form.interface";
import { useToast } from "@/hooks/use-toast";
import { FiPlus, FiTrash } from "react-icons/fi";
import { apiUrl } from "@/lib/api";
import { projectCadastroQuestionGroup } from "@/lib/cadastroViewModel";

const parseJsonSafe = async (res: Response) => {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

interface QuestionProps {
  questionGroup: QuestionGroup;
  centroId: string;
  initialCache: Record<string,Answer[]>;
  onAnswerChange: (questionId:string, answerId: string | null, newAnswer: Answer | null) => void; // Função para atualizar respostas
  formId: string;
  groupKey: string;
}

interface QuestionAnswer {
  question: Question;
  answer: Answer;
}

interface QuestionAnswerGroup {
  renderKey: string;
  groupInstanceId: string;
  occurrenceOrder: number;
  questionsAnswered: QuestionAnswer[];
}

export function GroupQuestionComponent({ questionGroup, centroId, initialCache, onAnswerChange, formId, groupKey }: QuestionProps) {
  const { toast } = useToast();
  const [answerGroups, setAnswerGroups] = useState<QuestionAnswerGroup[]>([]);
  const initializedRef = useRef(false);
  const groupCounterRef = useRef(0);

  const createLocalGroupKey = useCallback(() => {
    groupCounterRef.current += 1;
    return `group-${groupCounterRef.current}`;
  }, []);

  const buildRenderKey = useCallback(
    (questionsAnswered: QuestionAnswer[]) => {
      const answerIds = questionsAnswered
        .map(({ answer }) => answer?._id)
        .filter((id): id is string => Boolean(id));

      if (answerIds.length === questionsAnswered.length && answerIds.length > 0) {
        return answerIds.join("-");
      }

      return createLocalGroupKey();
    },
    [createLocalGroupKey]
  );
  

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

  const initializeEmptyGroups = useCallback(() => {
    const emptyGroups: QuestionAnswerGroup[] = [];
    // Create a single empty group initially
    const emptyGroup: QuestionAnswerGroup = {
      renderKey: createLocalGroupKey(),
      groupInstanceId: questionGroup.IS_MULTIPLE && typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${groupKey}/occurrence:0`,
      occurrenceOrder: 0,
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
        return questionAnswered;
      }),
    };
    emptyGroups.push(emptyGroup);

    return emptyGroups;
  }, [questionGroup.GROUP, questionGroup.IS_MULTIPLE, centroId, createLocalGroupKey, groupKey]);


  const handleAddGroup = () => {
    const newEmptyGroup = initializeEmptyGroups()[0];
    newEmptyGroup.occurrenceOrder = answerGroups.length;
    setAnswerGroups((prevGroups) => [...prevGroups, newEmptyGroup]);
  };

  const handleRemoveGroup = (index: number) => {
    if (answerGroups.length > 1) {
      const answerGroupToRemove = answerGroups[index];

      for (const questionAnswered of answerGroupToRemove.questionsAnswered) {
        const {question, answer} = questionAnswered;

        if (answer._id) {
          void removeAnswer(question._id, answer._id)
        }
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
    function projectAnswers() {
      const projectedGroup = projectCadastroQuestionGroup(questionGroup, initialCache, { centroId });
      const nextGroups = projectedGroup.occurrences.map((occurrence) => {
        const questionsAnswered = occurrence.questionsAnswered.map(({ question, answer }) => ({
          question,
          answer,
        }));

        return {
          renderKey: buildRenderKey(questionsAnswered),
          groupInstanceId: occurrence.groupInstanceId,
          occurrenceOrder: occurrence.occurrenceIndex,
          questionsAnswered,
        };
      });

      setAnswerGroups(nextGroups);
    }

    // Initialize empty groups only once to avoid flicker on updates
    if (!initializedRef.current) {
      setAnswerGroups(initializeEmptyGroups());
      initializedRef.current = true;
    }
    projectAnswers();
  }, [questionGroup, centroId, initialCache, initializeEmptyGroups, buildRenderKey]);

  return (
    <div className="space-y-6">
      {answerGroups.map((group, groupIndex) => (
        <div key={group.renderKey} className="relative space-y-4 border p-4 rounded-md shadow-sm">
          <div className="flex flex-wrap gap-4">
            {group.questionsAnswered.map((questionAnswered, questionIndex) => (
              <QuestionComponent
                key={`${questionAnswered.question._id}-${questionAnswered.answer?._id || "pending"}`}
                centroId={centroId}
                answer={questionAnswered.answer}
                question={questionAnswered.question}
                questionIndex={questionIndex}
                onAnswerChange={onAnswerChange}
                answerMetadata={{
                  FORM_ID: formId,
                  GROUP_KEY: groupKey,
                  GROUP_INSTANCE_ID: group.groupInstanceId,
                  GROUP_OCCURRENCE_ORDER: group.occurrenceOrder,
                  QUESTION_ORDER: questionIndex,
                }}
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
