import { CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { use, useEffect, useState } from "react";
import { QuestionAnswer, Summary, SummaryResponse } from "@/interfaces/form.interface";
import { set } from "date-fns";
import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import { appendDatePeriod } from "@/app/helpers/datePeriodHelper";

interface CoordAnalisisButtonProps {
    onFinalizarAnalise: (status:boolean) => void;
    centroId: string;
    coordQuestionAnswered: QuestionAnswer[];
    hasSummary: boolean;
}

export function CoordAnalisisButton({ onFinalizarAnalise, centroId, coordQuestionAnswered, hasSummary}: CoordAnalisisButtonProps) {

    const [summary, setSummary] = useState<Summary | undefined>();
    const [isReady, setIsReady] = useState<boolean>(false);


    useEffect(() => {

        //verifica se tem alguma questao que não tem resposta
        for (const questionAnswered of coordQuestionAnswered) {
            if (questionAnswered.answer === undefined || questionAnswered.answer.ANSWER === "") {
                setIsReady(false);
                return;
            }
        }

        console.log("ISREADY", centroId, isReady)
        setIsReady(hasSummary);

    }, [coordQuestionAnswered]);

    useEffect(() => {
        async function fetchSummary() {
            try {
                let summariesPath = `/api/centros/${centroId}/summaries`;
                const cadastroInfo = await getCadastroInfo();

                if (cadastroInfo?.start && cadastroInfo?.end) {
                        summariesPath = appendDatePeriod(summariesPath, { start: cadastroInfo.start, end: cadastroInfo.end });
                        }

                const res = await fetch(summariesPath);
                const data = await res.json();

                const firstSummary = data[0];
                setSummary(firstSummary);

                
            } catch (error) {
                console.error('Erro ao buscar o sumário', error);
            }
        }
        fetchSummary();
    }, [centroId]);

    const handleAnalysis = async () =>{
        console.log("Analisando...")
        let finalized = true;
        const questions = summary?.QUESTIONS;

        for (const questionAnswered of coordQuestionAnswered) {

            console.log("Question to check", questionAnswered)
            const question: SummaryResponse | undefined = questions?.find((question)=>{
                return question.QUESTION === questionAnswered.question._id;
            })

            if(!questionAnswered.question || !questionAnswered.answer || questionAnswered.answer.ANSWER.trim() === ""){
                console.log("Não finalizou", questionAnswered)
                finalized = false;
            }

        }

        if(finalized){

            if (summary && questions) {
                summary.QUESTIONS = questions;
            }
    
            const payload = {
                FORM_ID: summary?.FORM_ID,
                CENTRO_ID: summary?.CENTRO_ID,
                QUESTIONS: questions,
            };
            //atualiza o summary

            const [patchResponse, validateResponse] = await Promise.all([
                fetch(`/api/summaries/${summary?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }),
                fetch(`/api/summaries/${summary?._id}/validated-by-coord`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ validatedByCoord: true }),
                }),
            ]).finally(() => {
                onFinalizarAnalise(true);
            });
       
        }

        
    }

  return (
    <>
      {/* Botão Finalizar Análise */}
      <Button
        disabled={!isReady}
        onClick={handleAnalysis}
        className="flex-grow min-w-[120px] bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 py-3"
      >
        <CheckCircle className="w-5 h-5" />
        Finalizar Análise
      </Button>
    </>
  );
}