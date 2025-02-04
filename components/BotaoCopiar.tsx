"use client";

import { Button } from "@/components/ui/button";
import React from "react";

interface BotaoCopiarProps {
  user: string;
  pass: string;
}

export function BotaoCopiar({ user, pass }: BotaoCopiarProps) {
  const handleCopy = async () => {
    const textToCopy = `Olá! Seguem as credenciais para acesso:

    O site que tem que acessar é o seguinte: http://162.214.123.133:3000/

    Estamos trabalhando para melhorar a segurança e a experiência de uso, mas por enquanto, use as credenciais abaixo:

    • Login: ${user}
    • Senha: ${pass}

    Use-as com cuidado e não compartilhe com terceiros sem autorização.
    Qualquer dúvida, estamos aqui para te ajudar. Obrigado!`;

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