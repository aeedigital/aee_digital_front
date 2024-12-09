import { useEffect, useState } from 'react';
import FormInput from '@/components/FormInput';
import { Answer } from '@/interfaces/form.interface';

interface QuestionProps {
  question: any;
  centroId: string;
  questionIndex: number | string;
  answer: Answer;
  onAnswerChange?: (questionId: string, answerId: string | null, newAnswer: Answer) => void;
}

export function QuestionComponent({ question, centroId, questionIndex, answer, onAnswerChange }: QuestionProps) {
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
          `http://localhost:5000/answers?questionId=${questionId}&centroId=${centroId}&answerId=${questionValue._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ANSWER: String(value),
            }),
          }
        ).then((res: any) => res.json());
      } else {
        response = await fetch(
          `http://localhost:5000/answers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ANSWER: String(value),
              CENTRO_ID: centroId,
              QUESTION_ID: questionId,
            }),
          }
        ).then((res: any) => res.json());
      }

      setQuestionValue((prevValue) => {
        prevValue.ANSWER = value;
        return prevValue;
      });

      setIsEmpty(IS_REQUIRED && (!value || value.trim() === ''));

      if (onAnswerChange) {
        const updatedAnswer: Answer = {
          ...answer,
          ANSWER: String(value),
        };
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
      />
      {isEmpty && <p className="text-red-500 text-sm">Este campo é obrigatório.</p>}
    </div>
  );
}
