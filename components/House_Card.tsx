import React, { useEffect, useState } from 'react';
import { AiOutlineHistory } from "react-icons/ai";

import { Quiz, Question, Answer, Summary } from '@/interfaces/form.interface';
import { useRouter } from 'next/navigation';
import { Centro } from '@/interfaces/centro.interface';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FormInput from './FormInput';
import { QuestionComponent } from './QuestionComponent';

interface CardProps {
  centro: Centro;
  avaliacao_question: Question;
  coordenador_questions: Question[];
  required_questions?: string[];
  form: any;
  summaries: Summary[];
}

interface QuestionAnswer {
  question: Question;
  answer?: Answer;
}

const House_Card: React.FC<CardProps> = ({
  centro,
  avaliacao_question,
  coordenador_questions,
  form,
  summaries
}) => {

  const router = useRouter();

  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  const [situacao, setSituacao] = useState<string>('');
  const [questoesCoordenador, setQuestoesCoordenador] = useState<QuestionAnswer[]>([]);
  const [perguntasFaltantes, setPerguntasFaltantes] = useState<string[]>([]);

  // 1. Busca todas as respostas do centro
  useEffect(() => {
    async function fetchAllAnswers() {
      try {
        let path = `/api/answers?CENTRO_ID=${centro._id}`;
        const res = await fetch(path);
        const data = await res.json();
        setAllAnswers(data);
      } catch (error) {
        console.error('Erro ao buscar as respostas', error);
      }
    }

    if (centro?._id) {
      fetchAllAnswers();
    }
  }, [centro?._id]);

  // 2. Assim que tivermos todas as respostas, define situacao e preenche questões do coordenador
  useEffect(() => {
    if (!allAnswers || allAnswers.length === 0) return;

    // A) Define a situacao
    const answerAvaliacao = allAnswers.find(
      (ans) => ans.QUESTION_ID === avaliacao_question?._id
    );
    setSituacao(answerAvaliacao?.ANSWER || '');

    // B) Preenche questoesCoordenador
    const coordenadorQAs = coordenador_questions.map((question) => {
      const answer = allAnswers.find((ans) => ans.QUESTION_ID === question._id);
      return { question, answer };
    });
    setQuestoesCoordenador(coordenadorQAs);
  }, [allAnswers, avaliacao_question, coordenador_questions]);

  // 3. Verifica quais perguntas obrigatórias não foram respondidas
  useEffect(() => {
    if (!allAnswers || allAnswers.length === 0) return;
    if (!form) return;

    const requiredQuestions: Question[] = [];
    form.PAGES.forEach((quiz: { QUIZES: Quiz[] }) => {
      quiz.QUIZES.forEach((group) => {
        group.QUESTIONS.forEach((questionGroup) => {
          questionGroup.GROUP.forEach((q) => {
            if (q.IS_REQUIRED) {
              requiredQuestions.push(q);
            }
          });
        });
      });
    });

    const notAnswered = requiredQuestions.filter((rq) => {
      const resp = allAnswers.filter((a) => a.QUESTION_ID === rq._id).pop();
      return !resp || !resp.ANSWER?.trim();
    });

    setPerguntasFaltantes(notAnswered.map((q) => q.QUESTION));
  }, [allAnswers, form]);

  // Define a cor do Card com base no percentual de questões do coordenador
  const getBackgroundColor = () => {
    if (!questoesCoordenador || questoesCoordenador.length === 0) {
      return 'bg-white';
    }

    let questions = questoesCoordenador.length;
    let answered = 0;

    questoesCoordenador.forEach(({ answer }) => {
      if (answer?.ANSWER?.trim()) {
        answered++;
      }
    });

    const percentage = (answered / questions) * 100;

    if(!summaries || summaries.length === 0){
      return 'bg-red-200';
    } else {
      if (percentage === 0) {
        return 'bg-red-200';
      }
      if (percentage < 50 ) {
        return 'bg-red-200';
      } else if (percentage < 100) {
        return 'bg-yellow-200';
      } else {
        return 'bg-green-200'; // 100% respondidas
      }
    }
  };

  const handleCardClick = () => {
    router.push(`/cadastro/${centro._id}`);
  };

  const handleHistoryClick = () => {
    router.push(`/cadastro/historico/${centro._id}`);
  };

  const handleAnswerChange = (
    questionId: string,
    answerId: string | null,
    newAnswer: Answer
  ) => {
    setQuestoesCoordenador((prev) =>
      prev.map((qa) => {
        if (qa.answer?._id === answerId) {
          return { ...qa, answer: newAnswer };
        }
        return qa;
      })
    );
  };

  const onInputChange = () => {
    // ...
  };

  return (
    <Card
      className={`m-4 w-64 border border-gray-300 rounded-lg shadow-lg p-4 ${getBackgroundColor()}`}
    >
      <CardHeader>
        <CardTitle>{centro.NOME_CENTRO}</CardTitle>
        <CardDescription>
          {centro.NOME_CURTO} {centro.data_avaliacao}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Aqui, envolvemos o input em um contêiner com fundo branco para não "herdar" a cor do Card */}
        <div className=" p-2 rounded">
          <p className="font-semibold mb-1">Avaliação:</p>
          <FormInput
            type="text"
            isDisabled
            name="situacao"
            value={situacao}
            onChange={onInputChange}
            options={avaliacao_question?.PRESET_VALUES}
          />
        </div>

        {/* Fazemos o mesmo para as questões do coordenador */}
        {questoesCoordenador.map((questionAnswered, index) => (
          <div key={index} className=" p-2 mt-2 rounded">
            <QuestionComponent
              centroId={centro._id}
              answer={
                questionAnswered.answer || {
                  _id: '',
                  QUESTION_ID: '',
                  ANSWER: '',
                  CENTRO_ID: '',
                  QUIZ_ID: ''
                }
              }
              question={questionAnswered.question}
              questionIndex={index}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        ))}

        <p className="mt-2 text-sm">Perguntas Faltantes: {perguntasFaltantes.length}</p>
      </CardContent>

      <CardFooter >
        <p className="text-xs cursor-pointer mr-2" onClick={handleCardClick}>
          Clique para ver as respostas
        </p>
        <AiOutlineHistory
          className="text-lg cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={handleHistoryClick}
        />
      </CardFooter>
    </Card>
  );
};

export default House_Card;