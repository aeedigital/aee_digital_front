"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";

export function BarraDeCompartilhamento({ texto }: { texto: string }) {
  const { toast } = useToast();
  const textEncoded = encodeURIComponent(texto);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast({
        title: "Copiado para a área de transferência",
        description: "Credenciais prontas para colar onde precisar.",
      });
    } catch (error) {
      console.error("Erro ao copiar credenciais:", error);
      toast({
        title: "Não foi possível copiar",
        description: "Tente novamente ou copie manualmente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${textEncoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all"
      >
        <FaWhatsapp className="w-5 h-5" />
      </a>

      {/* Copiar */}
      <button
        type="button"
        onClick={handleCopy}
        className="p-2 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-all"
      >
        <MdContentCopy className="w-5 h-5" />
      </button>
    </div>
  );
}
