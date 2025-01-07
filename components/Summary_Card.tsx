import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CardProps {
  createdAt: string;
  updatedAt: string;
  formId: string;
  answers: any;
}

const Summary_Card: React.FC<CardProps> = ({
  createdAt,
  updatedAt,
  formId,
  answers,
}) => {
  
  // 1. Converter as strings para objeto Date
  const createdDate = new Date(createdAt);
  const updatedDate = new Date(updatedAt);

  // 2. Formatar cada data no padrão desejado:
  //    dd/MM/yyyy HH:mm (em pt-BR, por exemplo)
  const formattedCreatedAt = createdDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedUpdatedAt = updatedDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
    className={`m-4 w-64 border border-gray-300 rounded-lg shadow-lg p-4`}
    >
      <CardHeader>
        <CardTitle>Resumo</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          <p>Formulário: {formId}</p>
          <p>Criado em: {formattedCreatedAt}</p>
          <p>Atualizado em: {formattedUpdatedAt}</p>
        </CardDescription>
      </CardContent>
      <CardFooter>
        <p>Respostas: {answers.length}</p>
      </CardFooter>
    </Card>
  );
};

export default Summary_Card;
