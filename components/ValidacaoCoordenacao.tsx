import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ValidacaoCoordenacaoProps {
  coordenador: string | React.JSX.Element;
  totalRespostas: number;
  totalCentros: number;
  regionalId: string;
}

export default function ValidacaoCoordenacao({ coordenador, totalRespostas, totalCentros, regionalId }: ValidacaoCoordenacaoProps) {
  const [currentTotalRespostas, setCurrentTotalRespostas] = useState(totalRespostas);
  const [currentTotalCentros, setCurrentTotalCentros] = useState(totalCentros);

  useEffect(() => {
    setCurrentTotalRespostas(totalRespostas);
  }, [totalRespostas]);

  useEffect(() => {
    setCurrentTotalCentros(totalCentros);
  }, [totalCentros]);

  return (
    <div className="flex justify-center items-center w-full p-4">
      <Card className={cn("w-full shadow-lg rounded-lg bg-white border border-gray-200")}>
        <CardHeader>
          <CardTitle>Validação de Informações</CardTitle>
          <p className="text-sm text-gray-500">Coordenação Regional</p>
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Coordenador:</span>
                <span className="text-gray-800 font-semibold">{coordenador || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Total Respostas:</span>
                <span className="text-gray-800 font-semibold">{currentTotalRespostas}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Total Centros:</span>
                <span className="text-gray-800 font-semibold">{currentTotalCentros}</span>
              </div>
              <div>
              <div style={{ marginTop: '1rem' }}>
              <Button asChild variant="default">
                <Link href={`/credenciais?scope_id=${regionalId}&scope=centro`}>
                  Ver Logins e Senhas
                </Link>
                </Button>
              </div>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
