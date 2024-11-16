import { useEffect, useState } from 'react';
import FormInput from '@/components/FormInput';
import { Answer } from '@/interfaces/form.interface';

interface QuestionProps {
  question: any;
  centroId: string;
  questionIndex: number;
  answer: Answer 
}

export function QuestionComponent({ question, centroId, questionIndex, answer }: QuestionProps) {
  const [value, setValue] = useState<any>(answer.ANSWER);

  const {_id: questionId} = question

  useEffect(() => {
    setValue(answer.ANSWER);
  }, [answer.ANSWER]);

  // Função para atualizar a resposta da API usando PUT com query parameters
  async function onInputChange(name: string, value: any): Promise<void> {
    try {

      console.log("ANSWER", {
        ANSWER: String(value),
      })
      // Atualiza o estado imediatamente para refletir a mudança no UI



      // Envia a atualização para a API com os parâmetros na URL
      const response = await fetch(
        `http://localhost:5000/answers?questionId=${questionId}&centroId=${centroId}&answerId=${answer._id}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ANSWER: String(value),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar a resposta na API');
      }

      console.log('Resposta atualizada com sucesso', response);

      setValue(value);
    } catch (error) {
      console.error('Erro ao atualizar a resposta:', error);
    }
  }

  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block font-medium mb-1">{question.QUESTION}</label>
      <FormInput
        type={question.ANSWER_TYPE.toLowerCase()}
        name={`${question._id}-${questionIndex}`}
        value={value}
        onChange={onInputChange}
        options={question.PRESET_VALUES}
        isDisabled={false}
        answerType={question.ANSWER_TYPE}
      />
    </div>
  );
}
