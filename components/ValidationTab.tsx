"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import {
  buildRequiredValidationDebug,
  getInvalidRequiredQuestions,
} from "@/lib/requiredAnswers";

export function ValidationTab({
  questions,
  answersCache,
  formId,
  centroId,
  onPrevious,
  onComplete,
}: {
  questions: any[];
  answersCache: Record<string, any[]>;
  formId: string | undefined;
  centroId: string;
  onPrevious: () => void;
  onComplete: () => void;
}) {
  const [invalidQuestions, setInvalidQuestions] = useState<any[]>([]);

  useEffect(() => {
    const flattenedQuestions = questions.flatMap((q) => q.GROUP || []);

    const invalid = getInvalidRequiredQuestions(flattenedQuestions, answersCache);
    setInvalidQuestions(invalid);

    const debugEnabled =
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("debugValidation") === "1" ||
        window.localStorage.getItem("debugValidation") === "1");

    if (debugEnabled) {
      const debugRows = buildRequiredValidationDebug(flattenedQuestions, answersCache);
      console.groupCollapsed("[ValidationTab] Diagnóstico obrigatórias");
      console.table(debugRows);
      console.log("Pendentes:", invalid.map((q) => ({ id: q._id, pergunta: q.QUESTION })));
      console.groupEnd();
    }
  }, [questions, answersCache]);

  const handleSubmit = async () => {
    try {
      const payload = {
        FORM_ID: formId,
        CENTRO_ID: centroId,
      };

      const response: Response = await fetch(apiUrl(`/summaries`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao finalizar o formulário");
      }

      onComplete();
    } catch (error) {
      console.error("Erro ao finalizar o formulário:", error);
      alert("Ocorreu um erro ao finalizar o formulário.");
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-xl font-semibold mb-4">Validação ({invalidQuestions.length})</h2>
      {invalidQuestions.length === 0 ? (
        <div>
          <p className="text-green-500 mb-4">Todas as questões obrigatórias estão preenchidas.</p>
        
        </div>
      ) : (
        <div>
          <p className="text-red-500 mb-4">
            Você ainda tem {invalidQuestions.length} questão(ões) obrigatória(s) pendente(s).
          </p>
          <ul className="list-disc pl-5 space-y-2">
            {invalidQuestions.map((q) => (
              <li key={q._id} className="text-gray-700">
                <span className="font-semibold">{q.QUESTION}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Anterior
        </button>
        {invalidQuestions.length === 0 && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
}
