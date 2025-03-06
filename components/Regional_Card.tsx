// components/Card.tsx
'use client'; // Adicione esta linha para garantir que este é um componente do cliente
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { appendDatePeriod, Period } from '@/helpers/datePeriodHelper';

interface CardProps {
  nome: string;
  pais: string;
  regionalId: string;
  period: Period | undefined;
}

const Regional_Card: React.FC<CardProps> = ({ nome, pais, regionalId, period }) => {
  const [centrosCount, setCentrosCount] = useState<number | null>(null);
  const [finalizadosCount, setFinalizadosCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCentrosCount() {

      const res = await fetch(`/api/centros?REGIONAL=${regionalId}&STATUS=Pendente,Integrada,Inscrita`);
      
      if (!res.ok) {
        console.error(`Failed to fetch centers for regional ${regionalId}`);
        return;
      }

      const centros = await res.json();
      setCentrosCount(centros.length);

      let summaryPath = `/api/regionais/${regionalId}/summaries?fields=FORM_ID,CENTRO_ID,createdAt,updatedAt`;

      if (period?.start && period?.end) {
        summaryPath = appendDatePeriod(summaryPath, period);
      }

      const summaryRes = await fetch(summaryPath);
      const data = await summaryRes.json();

      let finalizadosTotal = 0;

      if (data.length > 0) {
        const centroIdsSet = new Set(centros.map((centro: any) => centro._id));
        const uniqueCentroIds = new Set(
          data.map((item: any) => item.CENTRO_ID).filter((id: any) => centroIdsSet.has(id))
        );
        finalizadosTotal = uniqueCentroIds.size;
      }
      setFinalizadosCount(finalizadosTotal);
    }

    fetchCentrosCount();
  }, [regionalId]);

  const getBackgroundColor = () => {
    if (centrosCount === null || finalizadosCount === null) {
      return 'bg-white'; // Cor padrão enquanto carrega
    }
    if (finalizadosCount === 0) {
      return 'bg-red-200'; // Cor vermelha se não houver finalizados
    }
    if (finalizadosCount >= centrosCount) {
      return 'bg-green-200'; // Cor verde se todos estiverem finalizados
    }
  
    return 'bg-yellow-200'; // Cor padrão
  };

  const router = useRouter();

  const handleCardClick = () => {
    // Navega para a rota com o ID do regional
    router.push(`/resumo/coordenador/${regionalId}`);
  };

  return (
    <Card 
      className={`m-4 w-64 h-52 cursor-pointer border border-gray-300 rounded-lg shadow-lg ${getBackgroundColor()}`}
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle>{nome}</CardTitle>
        <CardDescription>{pais}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Centros: {centrosCount !== null ? centrosCount : 'Carregando...'}</p>
        <p>Finalizados: {finalizadosCount !== null ? finalizadosCount : 'Carregando...'}</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs">Clique para mais detalhes</p>
      </CardFooter>
    </Card>
  );
};

export default Regional_Card;
