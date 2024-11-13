import { useEffect, useState } from 'react';
import FormInput from '@/components/FormInput';

interface QuestionProps {
  question: any;
  centroId: string;
  questionIndex: number;
  answer: Answer 
}

interface Answer {
		// _id: string;
		CENTRO_ID: string;
		QUIZ_ID: string;
		QUESTION_ID: string;
		ANSWER: string ;
	}


export function QuestionComponent({ question, centroId, questionIndex, answer }: QuestionProps) {
  const [initialValue, setInitialValue] = useState<any>(null);
  // const [answer, setAnswer] = useState<Answer>({
  //   _id: "",
	// 	CENTRO_ID: "",
	// 	QUIZ_ID: "",
	// 	QUESTION_ID: "",
	// 	ANSWER: ""
  // })


  const {_id: questionId} = question

  // // Função para buscar a resposta da API
  useEffect(() => {
    // const fetchAnswer = async () => {
    //   try {

    //     const response = await fetch(`/api/answers?QUESTION_ID=${questionId}&CENTRO_ID=${centroId}`);
    //     if (!response.ok) {
    //       throw new Error('Erro ao buscar dados da API');
    //     }
    //     let data = await response.json();

    //     data = data[0];
    //     setAnswer(data);

    //     setInitialValue(data?.ANSWER || '');
    //   } catch (error) {
    //     console.error('Erro ao carregar a resposta:', error);
    //     setInitialValue('');
    //   } 
    // };

    // fetchAnswer();

    setInitialValue(answer.ANSWER)
  }, [questionId, centroId]);


  // Função para atualizar a resposta da API usando PUT com query parameters
  async function onInputChange(name: string, value: any): Promise<void> {
    try {
      // Atualiza o estado imediatamente para refletir a mudança no UI
      setInitialValue(value);

      // Envia a atualização para a API com os parâmetros na URL
      const response = await fetch(
        `/api/answers?questionId=${questionId}&centroId=${centroId}&answerId=${answer._id}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ANSWER: value,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar a resposta na API');
      }

      console.log('Resposta atualizada com sucesso');
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
        value={answer.ANSWER}
        onChange={onInputChange}
        options={question.PRESET_VALUES}
        isDisabled={false}
        answerType={question.ANSWER_TYPE}
      />
    </div>
  );
}
