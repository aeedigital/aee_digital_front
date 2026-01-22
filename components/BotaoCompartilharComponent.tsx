"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { getCredentialMessage } from "@/app/helpers/getCredentialMessage";

interface BotaoCompartilharProps {
  user: string;
  pass: string;
}

export function BotaoCompartilhar({ user, pass }: BotaoCompartilharProps) {
  const handleShare = async () => {
    // Incluímos um contexto na mensagem antes das credenciais
    const textToShare = getCredentialMessage({ user, pass });

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
