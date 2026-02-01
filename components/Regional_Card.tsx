// components/Card.tsx
'use client'; // Adicione esta linha para garantir que este é um componente do cliente
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Period } from '@/app/helpers/datePeriodHelper';

interface CardProps {
  nome: string;
  pais: string;
  regionalId: string;
  centrosCount?: number;
  finalizadosCount?: number;
  period?: Period;
}

const Regional_Card: React.FC<CardProps> = ({
  nome,
  pais,
  regionalId,
  centrosCount = 0,
  finalizadosCount = 0,
  period
}) => {
  const router = useRouter();

  // Cores baseadas na contagem de finalizados vs total
  const getBackgroundColor = useMemo(() => {
    if (centrosCount === 0) {
      return 'bg-gray-50';
    }
    if (finalizadosCount === 0) {
      return 'bg-red-50'; // Nenhum finalizado
    }
    if (finalizadosCount >= centrosCount) {
      return 'bg-green-50'; // Todos finalizados
    }
    return 'bg-yellow-50'; // Parcial
  }, [centrosCount, finalizadosCount]);

  const getProgressColor = useMemo(() => {
    if (finalizadosCount === 0) return 'bg-red-400';
    if (finalizadosCount >= centrosCount) return 'bg-green-400';
    return 'bg-yellow-400';
  }, [centrosCount, finalizadosCount]);

  const handleCardClick = () => {
    if (!regionalId) {
      console.warn("Regional sem ID, navegação ignorada.");
      return;
    }
    router.push(`/resumo/coordenador?regionalId=${regionalId}`);
  };

  const percentage = centrosCount > 0
    ? Math.round((finalizadosCount / centrosCount) * 100)
    : 0;

  return (
    <Card
      className={`cursor-pointer border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow ${getBackgroundColor}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800">{nome}</CardTitle>
        <CardDescription className="text-sm text-gray-600">{pais}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Número grande de finalizados */}
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-gray-900">{finalizadosCount}</span>
          <span className="text-sm text-gray-500">de {centrosCount}</span>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Percentual e status */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">{percentage}% concluído</span>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">
            {finalizadosCount === 0 && "Pendente"}
            {finalizadosCount > 0 && finalizadosCount < centrosCount && "Progresso"}
            {finalizadosCount >= centrosCount && "Completo"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Clique para detalhes
      </CardFooter>
    </Card>
  );
};

export default Regional_Card;
