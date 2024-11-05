import { useEffect, useState } from 'react';
import FormInput from '@/components/FormInput';

interface QuestionProps {
  question: any;
  centroId: string;
  questionIndex: number;
}

export function QuestionComponent({ question, centroId, questionIndex }: QuestionProps) {
  const [initialValue, setInitialValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {_id: questionId} = question

  // Função para buscar a resposta da API
  useEffect(() => {
    const fetchAnswer = async () => {
      try {

        console.log("VAI", questionId, centroId)
        const response = await fetch(`/api/answers?QUESTION_ID=${questionId}&CENTRO_ID=${centroId}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar dados da API');
        }
        let data = await response.json();

        data = data[0];

        console.log("QUESTION", data)
        setInitialValue(data?.ANSWER || '');
      } catch (error) {
        console.error('Erro ao carregar a resposta:', error);
        setInitialValue('');
      } finally {
        // setLoading(false);
      }
    };

    fetchAnswer();
  }, [questionId, centroId]);

  // if (loading) {
  //   return <div>Carregando...</div>;
  // }

  function onInputChange(name: string, value: any): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block font-medium mb-1">{question.QUESTION}</label>
      <FormInput
        type={question.ANSWER_TYPE.toLowerCase()}
        name={`${question._id}-${questionIndex}`}
        value={initialValue}
        onChange={onInputChange}
        options={question.PRESET_VALUES}
        isDisabled={false}
        answerType={question.ANSWER_TYPE}
      />
    </div>
  );
}
