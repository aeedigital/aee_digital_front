import React, { useEffect, useState } from 'react';

import { AiOutlineHistory } from "react-icons/ai"; // Importa o ícone desejado

import { Quiz, Question, Answer } from '@/interfaces/form.interface';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import FormInput from './FormInput';
import { Centro } from '@/interfaces/centro.interface';
import { QuestionComponent } from './QuestionComponent';

interface CardProps {
  centro: Centro;
  avaliacao_question: Question;
  coordenador_questions: Question[];
  required_questions?: string[];
  form: any;
}

interface QuestionAnswer {
  question: Question;
  answer?: Answer;
}

const House_Card: React.FC<CardProps> = ({ 
  centro, 
  avaliacao_question, 
  coordenador_questions, 
  form 
}) => {
  const router = useRouter();

  // Estado que armazena TODAS as respostas do centro
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);

  // Situação obtida pela question de avaliação
  const [situacao, setSituacao] = useState<string>('');

  // Armazena o par (question, answer) para as questões do coordenador
  const [questoesCoordenador, setQuestoesCoordenador] = useState<QuestionAnswer[]>([]);

  // Lista de perguntas obrigatórias não respondidas
  const [perguntasFaltantes, setPerguntasFaltantes] = useState<string[]>([]);

  /**
   * 1. Faz apenas UMA requisição para buscar todas as respostas do centro
   */
  useEffect(() => {
    async function fetchAllAnswers() {
      try {
        const res = await fetch(`/api/answers?CENTRO_ID=${centro._id}`);
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

  /**
   * 2. Assim que tivermos todas as respostas (`allAnswers`), 
   *    definimos a situação (campo `situacao`) e populamos as 
   *    questões do coordenador.
   */
  useEffect(() => {
    if (!allAnswers || allAnswers.length === 0) return;

    // A) Define a situacao
    const answerAvaliacao = allAnswers.find(
      (ans) => ans.QUESTION_ID === avaliacao_question?._id
    );
    setSituacao(answerAvaliacao?.ANSWER || '');

    // B) Preenche questoesCoordenador
    const coordenadorQAs = coordenador_questions.map((question) => {
      const answer = allAnswers.find(
        (ans) => ans.QUESTION_ID === question._id
      );
      return { question, answer };
    });
    setQuestoesCoordenador(coordenadorQAs);
  }, [allAnswers, avaliacao_question, coordenador_questions]);

  /**
   * 3. Verifica quais perguntas obrigatórias não foram respondidas
   */
  useEffect(() => {
    if (!allAnswers || allAnswers.length === 0) return;
    if (!form) return;

    // Extrai todas as perguntas obrigatórias do form
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

    // Filtra as obrigatórias que NÃO têm resposta ou cujo conteúdo está vazio
    const notAnswered = requiredQuestions.filter((rq) => {
      // Procura a resposta correspondente na lista "allAnswers"
      const resp = allAnswers
        .filter((a) => a.QUESTION_ID === rq._id)
        .pop(); // pega a última resposta encontrada (se houver)

      // Se não existir resposta ou estiver vazia, então é "not answered"
      return !resp || !resp.ANSWER?.trim();
    });

    // Mapeia para o texto da pergunta (ou outro campo)
    setPerguntasFaltantes(notAnswered.map((q) => q.QUESTION));
  }, [allAnswers, form]);

  /**
   * Cálculo de cor do card de acordo com a porcentagem de questões do coordenador respondidas
   */
  const getBackgroundColor = () => {
    // Se não tiver nenhuma questão do coordenador, retorna cor neutra
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

    if (percentage === 0) {
      return 'bg-red-200';
    }
    if (percentage < 50) {
      return 'bg-red-200';
    } else if (percentage < 100) {
      return 'bg-yellow-200';
    } else {
      return 'bg-green-200'; // 100% respondidas
    }
  };

  /**
   * Navega para a rota cadastro com o ID do centro
   */
  const handleCardClick = () => {
    router.push(`/cadastro/${centro._id}`);
  };

  const handleHistoryClick = () => {
    router.push(`/cadastro/historico/${centro._id}`);
  };

  /**
   * Callback para atualizar uma resposta pontual no estado local
   * (caso você precise refletir a mudança localmente sem bater na API toda hora).
   */
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

  /**
   * Se quiser manipular o input localmente
   */
  const onInputChange = () => {
    // ...
  };

  return (
    <Card
      className={`m-4 w-64 border border-gray-300 rounded-lg shadow-lg ${getBackgroundColor()} p-4`}
    >
      <CardHeader>
        <CardTitle>{centro.NOME_CENTRO}</CardTitle>
        <CardDescription>
          {centro.NOME_CURTO} {centro.data_avaliacao}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div>
          Avaliação:
          <FormInput
            type="text"
            isDisabled
            name="situacao"
            value={situacao}
            onChange={onInputChange}
            options={avaliacao_question?.PRESET_VALUES}
          />
        </div>

        {questoesCoordenador.map((questionAnswered, index) => (
          <div key={index}>
            <QuestionComponent
              centroId={centro._id}
              answer={questionAnswered.answer || { _id: '', QUESTION_ID: '', ANSWER: '', CENTRO_ID: '', QUIZ_ID: '' }}
              question={questionAnswered.question}
              questionIndex={index}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        ))}

        <p>Perguntas Faltantes: {perguntasFaltantes.length}</p>
      </CardContent>

      <CardFooter >
        <p className="text-xs cursor-pointer" onClick={handleCardClick}>
          Clique para ver as respostas
        </p>

        {/* Ícone que redireciona para a página de histórico */}
        <AiOutlineHistory
          className="text-lg cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={handleHistoryClick}
        />
      </CardFooter>
    </Card>
  );
};

export default House_Card;
