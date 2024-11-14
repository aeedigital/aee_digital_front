"use client";

import { useEffect, useState } from "react";
import { QuestionComponent } from "./QuestionComponent";
import { Question, QuestionGroup, Answer } from "@/interfaces/form.interface";
import { useToast } from "@/hooks/use-toast";
import { FiPlus, FiTrash } from "react-icons/fi";

interface QuestionProps {
  questionGroup: QuestionGroup;
  centroId: string;
  answers: any[];
}

interface QuestionAnswer {
  question: Question;
  answer: Answer;
}

interface QuestionAnswerGroup {
  questionsAnswered: QuestionAnswer[];
}

export function GroupQuestionComponent({ questionGroup, centroId, answers }: QuestionProps) {
  const { toast } = useToast();
  const [answerGroups, setAnswerGroups] = useState<QuestionAnswerGroup[]>([]);

  const handleAddGroup = () => {
    const emptyAnswerGroup = getEmptyQuestionGroup();
    setAnswerGroups((prevGroups) => [...prevGroups, { ...emptyAnswerGroup }]);
  };

  const handleRemoveGroup = (index: number) => {
    if (answerGroups.length > 1) {
      setAnswerGroups(answerGroups.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Não Permitido",
        variant: "destructive",
        description: "É necessário ter pelo menos uma resposta",
      });
    }
  };

  function getEmptyQuestionGroup() {
    let newGroup: QuestionAnswerGroup = {
      questionsAnswered: [],
    };

    questionGroup.GROUP.forEach((question) => {
      newGroup.questionsAnswered.push({
        question,
        answer: {
          CENTRO_ID: centroId,
          QUIZ_ID: "",
          QUESTION_ID: "",
          ANSWER: "",
        },
      });
    });

    return newGroup;
  }

  async function getAnswerByQuestionId(questionId: string): Promise<Answer[]> {
    return answers.filter((answer) => answer.QUESTION_ID === questionId);
  }

  useEffect(() => {
    async function fetchAnswers() {
      const tempAnswerGroups: QuestionAnswerGroup[] = [];
      const answersByQuestion: Record<string, any[]> = {};

      for (const question of questionGroup.GROUP) {
        const data = await getAnswerByQuestionId(question._id);
        answersByQuestion[question._id] = data;
      }

      const answersLength = Math.max(...Object.values(answersByQuestion).map((a) => a.length), 1);

      for (let i = 0; i < answersLength; i++) {
        const group: QuestionAnswerGroup = { questionsAnswered: [] };

        questionGroup.GROUP.forEach((question) => {
          const answer = answersByQuestion[question._id]?.[i] || {
            CENTRO_ID: centroId,
            QUIZ_ID: "",
            QUESTION_ID: "",
            ANSWER: "",
          };
          group.questionsAnswered.push({ question, answer });
        });

        tempAnswerGroups.push(group);
      }

      setAnswerGroups(tempAnswerGroups);
    }

    fetchAnswers();
  }, [questionGroup, answers, centroId]);

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
