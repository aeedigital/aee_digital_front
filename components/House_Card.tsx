import React, { useEffect, useState } from 'react';

import {Quiz, Question, Answer} from '@/interfaces/form.interface'
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
  answer: Answer;
}

const House_Card: React.FC<CardProps> = ({ centro, avaliacao_question, coordenador_questions, form }) => {
  const [perguntasFaltantes, setPerguntasFaltantes] = useState<string[]>([]);
  const [situacao, setSituacao] = useState<string>('');
  const [questoes_coordenador, setCoordenadorQuestoes]= useState<any[]>([])

  const router = useRouter();

  async function getQuestionAnswer(questionId:string, centroId:string){
    const res = await fetch(`/api/answers?QUESTION_ID=${questionId}&CENTRO_ID=${centroId}`);
    const answers = await res.json();
    const answer = answers[0];

    return answer;
  }

  useEffect(() => {
    async function fetchCentrosCount() {
      const _id = avaliacao_question._id;
      
      const answer = await getQuestionAnswer(_id, centro._id)
      setSituacao(answer?.ANSWER || '');
    }

    fetchCentrosCount();
  }, [avaliacao_question._id, centro._id]);

  useEffect(()=>{
    async function fetchInfo(){
      const coordenarorquestionsInfo:QuestionAnswer[] = []
  
      for (let index = 0; index < coordenador_questions.length; index++) {
        const question = coordenador_questions[index];
        const answer = await getQuestionAnswer(question._id, centro._id)

        const questionAnswered:QuestionAnswer = {
          question,
          answer
        }

        coordenarorquestionsInfo.push(questionAnswered)
      }

      setCoordenadorQuestoes(coordenarorquestionsInfo)

    }

    fetchInfo()

  },[centro._id, coordenador_questions])

  

  useEffect(()=>{
    async function getRequiredQuestion(){

      async function getRequiredQuestionsNotAnswered(){
        const responses = await fetch(`/api/answers?CENTRO_ID=${centro._id}&fields=ANSWER,QUESTION_ID`).then((res) => res.json());
      
        const questions: any[] = [];
    
        form.PAGES.forEach((quiz: { QUIZES: Quiz[]; })=>{
          quiz.QUIZES.forEach(group=>{
            group.QUESTIONS.forEach(questionGroup=>{
              questionGroup.GROUP.forEach(q=>{
                if(q.IS_REQUIRED)
                questions.push(q)
              })
            })
          })
        })
    
        let not_finished:any = [];

        questions.forEach(question => {
          let hasResponse = responses.filter((response:any)=>{
            return response.QUESTION_ID == question._id
          })
    
          hasResponse = hasResponse[hasResponse.length -1]; 
    
          if(!hasResponse  ||  hasResponse?.ANSWER?.trim().length == 0){
            not_finished.push(question.Question)
          }
          
        });
    
        setPerguntasFaltantes(not_finished)
      }

      getRequiredQuestionsNotAnswered()

    }

    getRequiredQuestion();

  },[form, centro._id])


  const getBackgroundColor = () => {
    let questions = 0;
    let answered = 0;

    questoes_coordenador.every(
      (qa) => {
        questions++
        const hasAnswer = qa.answer?.ANSWER?.trim().length > 0
        
        if(hasAnswer){
          answered++;
        }
        return hasAnswer}
    );

    const percentage = 100* (answered / questions);
    
    const okThreshold = 50;
    const completeThreshold = 100

    if (percentage< okThreshold) {
      return 'bg-red-200';
    }
    if (percentage > okThreshold  && percentage < completeThreshold) {
      return 'bg-yellow-200';
    }
    if (percentage == completeThreshold) {
      return 'bg-green-200';
    }
    return 'bg-white';
  };

  const handleCardClick = () => {
    // Navega para a rota summary_coord com o ID do regional
    router.push(`/summary/${centro._id}`);
  };

  const handleAnswerChange = (questionId:string,answerId: string | null, newAnswer: Answer) => {
    const updatedQuestoesCoordenador:QuestionAnswer[] = questoes_coordenador;

    for (let index = 0; index < updatedQuestoesCoordenador.length; index++) {
      const questionAnswer = updatedQuestoesCoordenador[index];
      const { answer} = questionAnswer
      if(answer._id == answerId){
        updatedQuestoesCoordenador[index].answer = newAnswer
      }      
    }
  
    setCoordenadorQuestoes(updatedQuestoesCoordenador);
  };

  const onInputChange = () =>{

  }

  return (
    <Card
    className={`m-4 w-64 border border-gray-300  rounded-lg shadow-lg ${getBackgroundColor()} p-4`}
    >
      <CardHeader>
        <CardTitle>{centro.NOME_CENTRO}</CardTitle>
        <CardDescription>{centro.NOME_CURTO} {centro.data_avaliacao}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>Avaliação: <FormInput 
          type="text" 
          isDisabled={true} 
          name="situacao" 
          value={situacao}
          onChange={onInputChange}
          options={avaliacao_question.PRESET_VALUES} />
        </div>

        {questoes_coordenador.map((questionAnswered, index) => (
        <div key={index}>
        <QuestionComponent
          key={index}
          centroId={centro._id}
          answer={questionAnswered.answer}
          question={questionAnswered.question}
          questionIndex={index}
          onAnswerChange={handleAnswerChange}
          />
        </div>
        ))}

        <p>Perguntas Faltantes: {perguntasFaltantes.length}</p>
        </CardContent>
      <CardFooter onClick={handleCardClick}>
        <p className="text-xs cursor-pointer">Clique para ver as respostas</p>
      </CardFooter>
    </Card>
  );
};

export default House_Card;