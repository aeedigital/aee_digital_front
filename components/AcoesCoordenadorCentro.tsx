import { Button } from "@/components/ui/button";
import { Eye, History, CheckCircle } from "lucide-react";
import { CoordAnalisisButton } from "@components/CoordAnalisisButton";
import { QuestionAnswer } from "@/interfaces/form.interface";

interface AcoesCentroProps {
  onVerRespostas: () => void;
  onVerHistorico: () => void;
  onFinalizarAnalise: (status: boolean) => void;
  centroId: string;
  coordQuestionsAnswered: QuestionAnswer[];
  hasSummary: boolean;
}

export function AcoesCoordenadorCentro({ onVerRespostas, onVerHistorico, onFinalizarAnalise, centroId, coordQuestionsAnswered,
  hasSummary }: AcoesCentroProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 w-full">
      {/* Botão Ver Respostas */}
      <Button
        onClick={onVerRespostas}
        className="flex-grow min-w-[120px] bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2 py-3"
      >
        <Eye className="w-5 h-5" />
        Ver Respostas
      </Button>

      {/* Botão Histórico */}
      <Button
        onClick={onVerHistorico}
        className="flex- grow min-w-[120px] bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center gap-2 py-3"
      >
        <History className="w-5 h-5" />
        Histórico
      </Button>

      {/* Botão Finalizar Análise */}
      <CoordAnalisisButton
        onFinalizarAnalise={onFinalizarAnalise}
        coordQuestionAnswered={coordQuestionsAnswered}
        centroId={centroId}
        hasSummary={hasSummary}
      />
    </div>
  );
}