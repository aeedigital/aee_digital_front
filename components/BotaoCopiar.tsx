"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { getCredentialMessage } from "@/app/helpers/getCredentialMessage";

interface BotaoCopiarProps {
  user: string;
  pass: string;
}

export function BotaoCopiar({ user, pass }: BotaoCopiarProps) {
  const handleCopy = async () => {
    const textToCopy = getCredentialMessage({ user, pass });

    try {
      await navigator.clipboard.writeText(textToCopy);
      alert("Mensagem copiada para a área de transferência.");
    } catch (error) {
      console.error("Erro ao copiar para a área de transferência:", error);
    }
  };

  return (
    <Button variant="outline" onClick={handleCopy}>
      Copiar
    </Button>
  );
}
