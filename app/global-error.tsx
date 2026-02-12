"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="p-6">
        <h2 className="mb-3 text-xl font-semibold">Erro de aplicação</h2>
        <p className="mb-4 text-sm text-gray-600">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="rounded bg-[#63A9BF] px-4 py-2 text-white"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
