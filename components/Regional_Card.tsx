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

interface CardProps {
  nome: string;
  pais: string;
  regionalId: string;
}

const Regional_Card: React.FC<CardProps> = ({ nome, pais, regionalId }) => {
  const [centrosCount, setCentrosCount] = useState<number | null>(null);
  const [finalizadosCount, setFinalizadosCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCentrosCount() {
      const res = await fetch(`http://162.214.123.133:5000/centros/?REGIONAL=${regionalId}`);
      
      if (!res.ok) {
        console.error(`Failed to fetch centers for regional ${regionalId}`);
        return;
      }

      const centros = await res.json();
      setCentrosCount(centros.length);

      const summaryRes = await fetch(`http://162.214.123.133:5000/regionais/${regionalId}/summaries?fields=FORM_ID,CENTRO_ID,createdAt,updatedAt`);
      const data = await summaryRes.json();

      const uniqueCentroIds = new Set(data.map((item: any) => item.CENTRO_ID));
      const finalizadosTotal = uniqueCentroIds.size;

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
    if (finalizadosCount >= centrosCount / 2) {
      return 'bg-yellow-200'; // Cor amarela se metade ou mais estiver finalizado
    }
    return 'bg-white'; // Cor padrão
  };

  const router = useRouter();

  const handleCardClick = () => {
    // Navega para a rota summary_coord com o ID do regional
    router.push(`/summary_coord/${regionalId}`);
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
