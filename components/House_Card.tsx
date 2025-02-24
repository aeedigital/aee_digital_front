import React, { useEffect, useState } from 'react';
import { AiOutlineHistory } from "react-icons/ai";

import { Quiz, Question, Answer, Summary, QuestionAnswer } from '@/interfaces/form.interface';
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
import {AcoesCoordenadorCentro} from '@components/AcoesCoordenadorCentro';

interface CardProps {
  centro: Centro;
  avaliacao_question: Question;
  coordenador_questions: Question[];
  required_questions?: string[];
  form: any;
  summaries: Summary[];
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
  const [backgroundColor, setBackgroundColor] = useState<string>('bg-white');
  const [notMetCriterias, setNotMetCriterias] = useState<string[]>([]);

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

    const criteria:any[] = []

    const finalizouCriteria = {
      name: "Presidente finalizar a avaliação",
      method : () => {
        return summaries && summaries.length > 0;
      }
    }

    const coordResponseCriteria = {
      name: "Coordenador responder as perguntas",
      method : () => {
        return percentage === 100;
      }
    }

    const analysisCriteria = {
      name: "Coordenador finalizar análise",
      method : () => {
        console.log("FINALIZOU", centro.NOME_CURTO, summaries)
        if(!summaries || summaries.length === 0){
          return false;
        }
        const lastSummary = summaries[0];
        return "validatedByCoordAt" in lastSummary;;
      }
    }

    criteria.push(finalizouCriteria)
    criteria.push(coordResponseCriteria)
    criteria.push(analysisCriteria)


    let criteriasMet = [];
    let notMetCriterias = [];

    for (let i = 0; i < criteria.length; i++) {
      if(criteria[i].method()){
        criteriasMet.push(criteria[i].name)
      }else{
        notMetCriterias.push(criteria[i].name)
      }
    }

    setNotMetCriterias(notMetCriterias)

    console.log("CRITERIAS MET", centro.NOME_CURTO, criteriasMet)

    if(criteriasMet.length === criteria.length){
      return 'bg-green-200';
    }else if(criteriasMet.length > 0){
      return 'bg-yellow-200';
    }else{
      return 'bg-red-200';
    }
 
  };

  useEffect(() => {
    setBackgroundColor(getBackgroundColor());
  }, [questoesCoordenador, summaries]);

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
      setQuestoesCoordenador((prev) => {
        const existingAnswers = prev.find((qa) => qa.question._id === questionId && qa.answer?._id === answerId);

        if (existingAnswers) {
          return prev.map((qa) => {
            if (qa.answer?._id === answerId) {
              return { ...qa, answer: newAnswer };
            }
            return qa;
          })
        }
        else{

          const questionToChange = prev.find((qa) => qa.question._id === questionId);
          if (!questionToChange) {
            console.warn('Questão não encontrada');
            return prev;
          }else{
            questionToChange.answer = newAnswer;
          }
        }
        return prev;
        
      }
      );
   
  };

  const onInputChange = () => {
    // ...
  };

  return (
    <Card
      className={`m-4 w-64 border border-gray-300 rounded-lg shadow-lg p-4 ${backgroundColor}`}
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
              placeholder="Não respondido"
              question={questionAnswered.question}
              questionIndex={index}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        ))}

        <p className="mt-2 text-sm">Perguntas Faltantes: {perguntasFaltantes.length}</p>
      </CardContent>

      {/* Nova seção de pendências com estilo aprimorado */}
<div className="mt-4 p-3 bg-gray-100 rounded-lg shadow-inner">
  <h3 className="text-lg font-semibold mb-2 text-gray-700">Pendências</h3>

  {notMetCriterias.length === 0 ? (
    <div className="flex items-center text-green-600">
      ✅ <span className="ml-2">Sem pendências! Tudo está completo.</span>
    </div>
  ) : (
    <ul className="list-none space-y-2">
      {notMetCriterias.map((criteria, index) => (
        <li key={index} className="flex items-center bg-red-100 p-2 rounded-md shadow-sm">
          <span className="text-red-500 text-lg mr-2">⚠️</span>
          <span className="text-red-700 font-medium">{criteria}</span>
        </li>
      ))}
    </ul>
  )}
</div>

      <AcoesCoordenadorCentro
        centroId={centro._id}
        coordQuestionsAnswered={questoesCoordenador}
        onVerRespostas={handleCardClick}
        onVerHistorico={handleHistoryClick}
        onFinalizarAnalise={(status:boolean) => {
          console.log("FINALIZOU", centro.NOME_CURTO, status)
          setBackgroundColor(getBackgroundColor())}}
        hasSummary={summaries && summaries.length > 0}
      />
 
    </Card>
  );
};

export default House_Card;