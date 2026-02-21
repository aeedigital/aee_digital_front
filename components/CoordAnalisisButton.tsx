import { CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { QuestionAnswer, Summary } from "@/interfaces/form.interface";
import { apiUrl } from "@/lib/api";
import { normalizeSummaries, pickLatestSummary } from "@/lib/summaries";

interface CoordAnalisisButtonProps {
    onFinalizarAnalise: (status:boolean) => void;
    centroId: string;
    coordQuestionAnswered: QuestionAnswer[];
    hasSummary: boolean;
    summaries?: Summary[];
}

export function CoordAnalisisButton({ onFinalizarAnalise, centroId: _centroId, coordQuestionAnswered, summaries}: CoordAnalisisButtonProps) {

    const [summary, setSummary] = useState<Summary | undefined>();
    const [isReady, setIsReady] = useState<boolean>(false);


    useEffect(() => {
        const hasPendingCoordinatorAnswer = coordQuestionAnswered.some((questionAnswered) => {
            const answerValue = questionAnswered.answer?.ANSWER;
            return !answerValue || String(answerValue).trim() === "";
        });

        setIsReady(!hasPendingCoordinatorAnswer && Boolean(summary?._id));
    }, [coordQuestionAnswered, summary]);

    useEffect(() => {
        const normalizedSummaries = normalizeSummaries(summaries);
        setSummary(pickLatestSummary(normalizedSummaries));
    }, [summaries]);

    const handleAnalysis = async () =>{
        if (!summary) {
            return;
        }

        let finalized = true;
        const questions = summary.QUESTIONS || [];

        for (const questionAnswered of coordQuestionAnswered) {
            const answerValue = questionAnswered.answer?.ANSWER;
            if(!questionAnswered.question || !answerValue || String(answerValue).trim() === ""){
                finalized = false;
                break;
            }
        }

        if(finalized){
            const payload = {
                FORM_ID: summary.FORM_ID,
                CENTRO_ID: summary.CENTRO_ID,
                QUESTIONS: questions,
            };

            await Promise.all([
                fetch(apiUrl(`/summaries/${summary._id}`), {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }),
                fetch(apiUrl(`/summaries/${summary._id}/validated-by-coord`), {
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
