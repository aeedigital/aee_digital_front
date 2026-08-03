import { useEffect, useState } from 'react';
import FormInput from '@/components/FormInput';
import { Answer } from '@/interfaces/form.interface';
import { apiUrl } from '@/lib/api';

interface QuestionProps {
  question: any;
  centroId: string;
  questionIndex: number | string;
  answer: Answer;
  placeholder?: string;
  answerMetadata?: Pick<Answer, 'FORM_ID' | 'GROUP_KEY' | 'GROUP_INSTANCE_ID' | 'GROUP_OCCURRENCE_ORDER' | 'QUESTION_ORDER'>;
  onAnswerChange?: (questionId: string, answerId: string | null, newAnswer: Answer) => void;
}

export function QuestionComponent({ question, centroId, questionIndex, answer, onAnswerChange, placeholder, answerMetadata }: QuestionProps) {
  const [questionValue, setQuestionValue] = useState<Answer>(answer);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  const { _id: questionId, IS_REQUIRED } = question;

  useEffect(() => {
    setQuestionValue(answer);
    setIsEmpty(IS_REQUIRED && (!answer.ANSWER || answer.ANSWER.trim() === ''));
  }, [answer, IS_REQUIRED]);

  async function onInputChange(name: string, value: any): Promise<void> {
    try {
      let response: any;

      if (questionValue._id) {
        response = await fetch(
          apiUrl(`/answers/${questionValue._id}`),
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ANSWER: String(value),
              ...answerMetadata,
            }),
          }
        ).then((res: any) => res.json());
      } else {
        response = await fetch(
          apiUrl(`/answers`),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ANSWER: String(value),
              CENTRO_ID: centroId,
              QUESTION_ID: questionId,
              ...answerMetadata,
            }),
          }
        ).then((res: any) => res.json());
      }

      setQuestionValue((prevValue) => ({
        ...prevValue,
        ANSWER: String(value),
      }));

      setIsEmpty(IS_REQUIRED && (!value || (typeof value === 'string' && value.trim() === '')));

      if (onAnswerChange) {
        const updatedAnswer: Answer = {
          ...response,
          ANSWER: String(value),
        };

        const debugEnabled =
          typeof window !== "undefined" &&
          (new URLSearchParams(window.location.search).get("debugValidation") === "1" ||
            window.localStorage.getItem("debugValidation") === "1");

        if (debugEnabled) {
          console.groupCollapsed(`[QuestionComponent] onInputChange question=${question._id}`);
          console.log("questionValue atual:", questionValue);
          console.log("response backend:", response);
          console.log("updatedAnswer enviado ao cache:", updatedAnswer);
          console.groupEnd();
        }

        onAnswerChange(question._id, response._id, updatedAnswer);
      }
    } catch (error) {
      console.error('Erro ao atualizar a resposta:', error);
    }
  }

  return (
    <div className="flex-1 min-w-[200px]">
      <label className={`block font-medium mb-1 ${isEmpty ? 'text-red-500' : ''}`}>
        {question.QUESTION}{IS_REQUIRED ? '*': ''}
      </label>
      <FormInput 
        type={question.ANSWER_TYPE.toLowerCase()}
        name={`${question._id}-${questionIndex}`}
        value={questionValue.ANSWER}
        onChange={onInputChange}
        options={question.PRESET_VALUES}
        isDisabled={false}
        isRequired={IS_REQUIRED}
        answerType={question.ANSWER_TYPE}
        placeholder={placeholder}
      />
      {isEmpty && <p className="text-red-500 text-sm">Este campo é obrigatório.</p>}
    </div>
  );
}
