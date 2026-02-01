import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

import { Quiz, Question, Answer, Summary, QuestionAnswer } from '@/interfaces/form.interface';
import { useRouter } from 'next/navigation';
import { Centro } from '@/interfaces/centro.interface';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FormInput from './FormInput';
import { QuestionComponent } from './QuestionComponent';
import {AcoesCoordenadorCentro} from '@components/AcoesCoordenadorCentro';
import { apiUrl } from '@/lib/api';

interface CardProps {
  centro: Centro;
  avaliacao_question: Question;
  coordenador_questions: Question[];
  required_questions?: string[];
  form: any;
  summaries: Summary[];
  answers?: Answer[];
}

const House_Card: React.FC<CardProps> = ({
  centro,
  avaliacao_question,
  coordenador_questions,
  form,
  summaries,
  answers,
}) => {

  // cache por centro para evitar múltiplas chamadas /answers
  const answersCache = useMemo(() => {
    if (typeof window === "undefined") return new Map<string, Promise<Answer[]>>();
    const key = "__answersCache__";
    // @ts-ignore
    if (!window[key]) {
      // @ts-ignore
      window[key] = new Map<string, Promise<Answer[]>>();
    }
    // @ts-ignore
    return window[key] as Map<string, Promise<Answer[]>>;
  }, []);

  const router = useRouter();

  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  const [situacao, setSituacao] = useState<string>('');
  const [questoesCoordenador, setQuestoesCoordenador] = useState<QuestionAnswer[]>([]);
  const [perguntasFaltantes, setPerguntasFaltantes] = useState<string[]>([]);
  const [backgroundColor, setBackgroundColor] = useState<string>('bg-white');
  const [notMetCriterias, setNotMetCriterias] = useState<string[]>([]);
  const [finalizou, setFinalizou] = useState<boolean>(false);
  const requiredQuestions = useMemo(() => {
    if (!form) return [];
    const req: Question[] = [];
    form.PAGES?.forEach((quiz: { QUIZES: Quiz[] }) => {
      quiz.QUIZES?.forEach((group) => {
        group.QUESTIONS?.forEach((questionGroup) => {
          questionGroup.GROUP?.forEach((q: Question) => {
            if (q.IS_REQUIRED) {
              req.push(q);
            }
          });
        });
      });
    });
    return req;
  }, [form]);

  // 1. Respostas: prioriza prop "answers"; senão, busca com cache por centro
  useEffect(() => {
    async function fetchAllAnswers() {
      try {
        const key = centro._id;
        const path = apiUrl(`/answers?CENTRO_ID=${centro._id}`);

        if (!answersCache.has(key)) {
          const promise = fetch(path).then((res) => res.json());
          answersCache.set(key, promise);
        }

        const data = await answersCache.get(key);
        setAllAnswers(data || []);
      } catch (error) {
        console.error('Erro ao buscar as respostas', error);
      }
    }

    if (answers) {
      setAllAnswers(answers);
      answersCache.set(centro._id, Promise.resolve(answers));
      return;
    }

    if (centro?._id) {
      fetchAllAnswers();
    }
  }, [centro?._id, answers, answersCache]);

  // Mantém cache sincronizado após edições locais
  useEffect(() => {
    if (!centro?._id) return;
    answersCache.set(centro._id, Promise.resolve(allAnswers));
  }, [allAnswers, centro?._id, answersCache]);

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
    if (!requiredQuestions.length) return;

    const notAnswered = requiredQuestions.filter((rq) => {
      const resp = allAnswers.filter((a) => a.QUESTION_ID === rq._id).pop();
      return !resp || !resp.ANSWER?.trim();
    });

    setPerguntasFaltantes(notAnswered.map((q) => q.QUESTION));
  }, [allAnswers, requiredQuestions]);

  // Define a cor do Card com base no percentual de questões do coordenador
  const getBackgroundColor = useCallback(() => {
    if (!questoesCoordenador || questoesCoordenador.length === 0) {
      return 'bg-white';
    }
    
    if(finalizou){
      setNotMetCriterias([]);
      return 'bg-green-200';
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
 
  }, [questoesCoordenador, summaries, finalizou, centro.NOME_CURTO]);

  useEffect(() => {
    setBackgroundColor(getBackgroundColor());
  }, [getBackgroundColor]);

  const handleCardClick = () => {
    router.push(`/cadastro?centroId=${centro._id}`);
  };

  const handleHistoryClick = () => {
    router.push(`/cadastro/historico?centroId=${centro._id}`);
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
    <Card className={`m-2 w-72 border border-gray-300 rounded-lg shadow-md p-4 ${backgroundColor}`}>
      <CardHeader className="p-0 mb-3">
        <CardTitle className="text-base font-semibold leading-snug">{centro.NOME_CENTRO}</CardTitle>
        <CardDescription className="text-sm text-gray-700">{centro.NOME_CURTO || "—"}</CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        <div>
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

        <div>
          <p className="font-semibold mb-1">Perguntas do coordenador</p>
          {questoesCoordenador.length === 0 ? (
            <p className="text-sm text-gray-700">Nenhuma pergunta configurada.</p>
          ) : (
            questoesCoordenador.map((questionAnswered, index) => (
              <div key={`${questionAnswered.question?._id || index}-${index}`} className="mt-2">
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
            ))
          )}
        </div>

        <p className="mt-2 text-sm">Perguntas Faltantes: {perguntasFaltantes.length}</p>

        <div className="mt-2 p-3 bg-white/70 rounded-lg shadow-inner border border-gray-200">
          <h3 className="text-base font-semibold mb-2 text-gray-800">Pendências</h3>
          {notMetCriterias.length === 0 ? (
            <div className="flex items-center text-green-600 font-medium">
              <FiCheckCircle className="mr-2" />
              Sem pendências! Tudo está completo.
            </div>
          ) : (
            <ul className="list-none space-y-2">
              {notMetCriterias.map((criteria, index) => (
                <li key={index} className="flex items-center bg-red-100 p-2 rounded-md shadow-sm text-red-700">
                  <FiAlertTriangle className="mr-2" />
                  <span className="font-medium">{criteria}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <div className="mt-3">
        <AcoesCoordenadorCentro
          centroId={centro._id}
          coordQuestionsAnswered={questoesCoordenador}
          onVerRespostas={handleCardClick}
          onVerHistorico={handleHistoryClick}
          onFinalizarAnalise={(status:boolean) => {
            setFinalizou(status)}
          }
          hasSummary={summaries && summaries.length > 0}
          summaries={summaries}
        />
      </div>
    </Card>
  );
};

export default House_Card;
