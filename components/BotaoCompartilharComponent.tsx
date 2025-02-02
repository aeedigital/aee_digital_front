"use client";

import { Button } from "@/components/ui/button";
import React from "react";

interface BotaoCompartilharProps {
  login: string;
  senha: string;
}

export function BotaoCompartilhar({ login, senha }: BotaoCompartilharProps) {
  const handleShare = async () => {
    // Incluímos um contexto na mensagem antes das credenciais
    const textToShare = `Olá! Seguem as credenciais para acesso:

    O site que tem que acessar é o seguinte : http://162.214.123.133:3000/

    Estamos trabalhando para melhorar a segurança e a experiência de uso, mas por enquanto, use as credenciais abaixo:

    • Login: ${login}
    • Senha: ${senha}

    Use-as com cuidado e não compartilhe com terceiros sem autorização.
    Qualquer dúvida, estamos aqui para te ajudar. Obrigado!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Credenciais do Centro",
          text: textToShare,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        alert("Mensagem copiada para a área de transferência.");
      } catch (error) {
        console.error("Erro ao copiar para a área de transferência:", error);
      }
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      Compartilhar
    </Button>
  );
}