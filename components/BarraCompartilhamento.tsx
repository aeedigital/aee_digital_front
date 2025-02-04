"use client";

import React from "react";

export function BarraDeCompartilhamento({ texto }: { texto: string }) {
  const textEncoded = encodeURIComponent(texto);

  return (
    <div className="flex gap-2">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${textEncoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 bg-green-500 text-white rounded-md"
      >
        WhatsApp
      </a>

      {/* E-mail */}
      <a
        href={`mailto:?subject=${encodeURIComponent("Compartilhando algo")} 
                &body=${textEncoded}`}
        className="px-3 py-2 bg-gray-600 text-white rounded-md"
      >
        Email
      </a>
    </div>
  );
}