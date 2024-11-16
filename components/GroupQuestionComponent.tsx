"use client";

import { useEffect, useState } from "react";
import { QuestionComponent } from "./QuestionComponent";
import { Question, QuestionGroup, Answer } from "@/interfaces/form.interface";
import { useToast } from "@/hooks/use-toast";
import { FiPlus, FiTrash } from "react-icons/fi";

interface QuestionProps {
  questionGroup: QuestionGroup;
  centroId: string;
}

interface QuestionAnswer {
  question: Question;
  answer: Answer;
}

interface QuestionAnswerGroup {
  questionsAnswered: QuestionAnswer[];
}

export function GroupQuestionComponent({ questionGroup, centroId }: QuestionProps) {
  const { toast } = useToast();
  const [answerGroups, setAnswerGroups] = useState<QuestionAnswerGroup[]>([]);

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
      const answersByQuestion: Record<string, any[]> = {};

      // Simulate fetching answers (replace with real API calls)
      for (const question of questionGroup.GROUP) {
        const fetchedAnswers = await fetch(`/api/answers?CENTRO_ID=${centroId}&QUESTION_ID=${question._id}`).then((res) => res.json());
        answersByQuestion[question._id] = fetchedAnswers;
      }


      const answersLength = Math.max(...Object.values(answersByQuestion).map((a) => a.length), 1);


      for (let i = 0; i < answersLength; i++) {
        const group: QuestionAnswerGroup = {
          questionsAnswered: questionGroup.GROUP.map((question) => {
            const answer = answersByQuestion[question._id]?.[i] || {
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
  }, [questionGroup, centroId]);

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
