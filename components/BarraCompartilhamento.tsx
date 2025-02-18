"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export function BarraDeCompartilhamento({ texto }: { texto: string }) {
  const textEncoded = encodeURIComponent(texto);

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

      {/* E-mail */}
      <a
        href={`mailto:?subject=${encodeURIComponent("Compartilhando algo")}&body=${textEncoded}`}
        className="p-2 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-all"
      >
        <MdEmail className="w-5 h-5" />
      </a>
    </div>
  );
}