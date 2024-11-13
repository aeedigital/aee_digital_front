"use client"

import { useEffect, useState } from 'react';
import { QuestionComponent } from './QuestionComponent';
import { Question, QuestionGroup, Answer } from '@/interfaces/form.interface';
import { useToast } from "@/hooks/use-toast"

interface QuestionProps {
  questionGroup: QuestionGroup;
  centroId: string;
  answers: any[]
}

interface QuestionAnswer{
  question: Question,
  answer: Answer
}

interface QuestionAnswerGroup {
  questionsAnswered: QuestionAnswer[]
}

export function GroupQuestionComponent({ questionGroup, centroId, answers }: QuestionProps) {
  const { toast } = useToast()

  // console.log("ANSWERS", answers)

  // tem o array por que pode ter varias respostas se for multiple
  const [answerGroups, setAnswerGroups] = useState<QuestionAnswerGroup[]>([]);

  const handleAddGroup = () => {
    const emptyAnswerGroup = getEmptyQuestionGroup()
    setAnswerGroups((prevGroups) => [...prevGroups, { ...emptyAnswerGroup }]);
  };

  const handleRemoveGroup = (index: number) => {
    if (answerGroups.length > 1) {
      setAnswerGroups(answerGroups.filter((_, i) => i !== index));
    }else{
      toast({
        title: "Não Permitido",
        variant: "destructive",
        description: "É necessário ter pelo menos uma resposta",
      })
    }
  };

  function getEmptyQuestionGroup(){

    let newGroup: QuestionAnswerGroup = {
      questionsAnswered:[]
    }

    const {GROUP} = questionGroup;

    for (let index = 0; index < GROUP.length; index++) {
      const question = GROUP[index];

      const emptyQuestion = {
        question,
        answer: {
          CENTRO_ID: centroId,
          QUIZ_ID: "",
          QUESTION_ID: "",
          ANSWER: " "
        }
      }

      newGroup.questionsAnswered.push(emptyQuestion)
    }

    return newGroup;
  }

  async function getAnswerByQuestionId(questionId:string): Promise<Answer[]>{
    return answers.filter((answer)=>{
      return answer.QUESTION_ID == questionId
    })
  }

  useEffect(()=>{
    async function fetchAnswers(){
      // let answerGroup: QuestionAnswerGroup= getEmptyQuestionGroup();

      const tempAnswerGroup: QuestionAnswerGroup[] = []

      const { GROUP, IS_MULTIPLE } = questionGroup;

      let answersByQuestion:any = {}
  
      for (let index = 0; index < GROUP.length; index++) {
        const question = GROUP[index];
        const {_id: questionId } = question

        const data = await getAnswerByQuestionId(questionId)

        console.log("ANSWERS", data)

        if(!answersByQuestion[question._id]){
          answersByQuestion[question._id] =[]
        }


        let objectToAdd;
        if(IS_MULTIPLE){
         objectToAdd = {
            question,
            answers:data
          }
        }
        else{
          objectToAdd = {
            question,
            answers:[data[0]]
          }
        }
        answersByQuestion[question._id].push(objectToAdd)
      
      }

      console.table("BY QUESTION", answersByQuestion)

      //partindo da premissa que todas as questoes do grupo tem resposta.
      
      const keys = Object.keys(answersByQuestion);
      const items = Object.values(answersByQuestion);

      const firstQuestion:any = items[0]
      const answersLength = firstQuestion.length;

      console.log(keys,items, answersLength)

      for (let i = 0; i < answersLength; i++) {
        let answerGroup: QuestionAnswerGroup= {
          questionsAnswered:[]
        }

        for (let j = 0; j < keys.length; j++) {
          const questionIndex = keys[j];  
          console.log("QUESTION INDEX", questionIndex)

          let questionInfo:any = answersByQuestion[questionIndex];
          
          console.log("QUESTION INFO", questionInfo)
          
          const item:any = questionInfo[i];

          console.log("ITEM", item)

          const {question, answers} = item;

          const answer = answers[i];

          let questionAnswerToAdd: QuestionAnswer={
            question,
            answer:answer || {
              CENTRO_ID: centroId,
              QUIZ_ID: "",
              QUESTION_ID: "",
              ANSWER: " "
            }
          };

          answerGroup.questionsAnswered.push(questionAnswerToAdd)
          
        }
        tempAnswerGroup.push(answerGroup)
      }


      setAnswerGroups(tempAnswerGroup)
    }

    fetchAnswers();
  }, [questionGroup])

  return (
    <div className="space-y-4">
      {/* {questionGroups.map((group, groupIndex) => ( */}
      { answerGroups?.map((group, groupIndex) =>(

        <div key={groupIndex} className="space-y-4 relative">
          {group && (
            <div className="flex flex-wrap gap-4">
              {group.questionsAnswered.map((questionAnswered: QuestionAnswer, questionIndex) => (
                <QuestionComponent
                  key={questionIndex}
                  centroId={centroId}
                  answer = {questionAnswered.answer}
                  question={questionAnswered.question}
                  questionIndex={questionIndex}
                />
              ))}
            </div>
          )}

          {questionGroup.IS_MULTIPLE && (
            <div className="absolute top-0 right-0 flex space-x-2">
              <button
                type="button"
                className="px-2 py-1 bg-green-500 text-white rounded"
                onClick={handleAddGroup}
              >
                Adicionar
              </button>
              <button
                type="button"
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={() => handleRemoveGroup(groupIndex)}
              >
                Remover
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
