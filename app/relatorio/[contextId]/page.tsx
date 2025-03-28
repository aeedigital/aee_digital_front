"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Interfaces
interface Centro {
  _id: string;
  NOME_CURTO: string;
}

interface Summary {
  CENTRO_ID: string;
  QUESTIONS: { QUESTION: string; ANSWER: string }[];
}

interface Regional {
  _id: string;
  NOME_REGIONAL: string;
}

interface GroupedItem {
  resposta: string;
  centros: Centro[];
}

// Services
async function fetchRegionais(scopeType: string, scope_id: string): Promise<Regional[]> {
  if (scopeType === "regional") {
    const response = await fetch(`/api/regionais/${scope_id}`);
    if (!response.ok) throw new Error("Erro ao buscar informações da regional");
    const regional = await response.json();
    return [regional];
  } else {
    const response = await fetch(`/api/regionais`);
    if (!response.ok) throw new Error("Erro ao buscar regionais");
    return await response.json();
  }
}

async function fetchCentros(regionalId: string): Promise<Centro[]> {
  const response = await fetch(`/api/regionais/${regionalId}/centros`);
  if (!response.ok) throw new Error(`Erro ao buscar centros para a regional ${regionalId}`);
  return await response.json();
}

async function fetchSummaries(regionalId: string): Promise<Summary[]> {
  const response = await fetch(`/api/regionais/${regionalId}/summaries`);
  if (!response.ok) throw new Error(`Erro ao buscar summaries para a regional ${regionalId}`);
  return await response.json();
}

// Components
const RegionalTable: React.FC<{
  regional: Regional;
  centros: Centro[];
  situacoes: { centroId: string; situacao: string }[];
}> = ({ regional, centros, situacoes }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-bold mb-4">Relatório - {regional.NOME_REGIONAL}</h1>
    <table className="min-w-full border border-gray-200 text-sm table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-2 text-left border-b border-gray-200 w-1/2">Nome Curto</th>
          <th className="p-2 text-left border-b border-gray-200 w-1/2">Situação</th>
        </tr>
      </thead>
      <tbody>
        {centros.map((centro) => {
          const situacao = situacoes.find((s) => s.centroId === centro._id)?.situacao || "Não respondido";
          return (
            <tr key={centro._id}>
              <td className="p-2 border-b border-gray-200">{centro.NOME_CURTO}</td>
              <td className="p-2 border-b border-gray-200">{situacao}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Main Component
const RelatorioPage: React.FC<{ params: { contextId: string } }> = ({ params }) => {
  const { contextId: scope_id } = params;
  const searchParams = useSearchParams();
  const scopeType = searchParams.get("scopeType") || "regional";

  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [centrosByRegional, setCentrosByRegional] = useState<Record<string, Centro[]>>({});
  const [situacoesByRegional, setSituacoesByRegional] = useState<Record<string, { centroId: string; situacao: string }[]>>({});
  const [loadingRegionais, setLoadingRegionais] = useState(true);
  const [loadingRegionalData, setLoadingRegionalData] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingRegionais(true);

        const regionaisData = await fetchRegionais(scopeType, scope_id);
        setRegionais(regionaisData);

        for (const regional of regionaisData) {
          setLoadingRegionalData((prev) => ({ ...prev, [regional._id]: true }));

          try {
            const [centros, summaries] = await Promise.all([
              fetchCentros(regional._id),
              fetchSummaries(regional._id),
            ]);

            setCentrosByRegional((prev) => ({ ...prev, [regional._id]: centros }));
            setSituacoesByRegional((prev) => ({
              ...prev,
              [regional._id]: summaries.map((summary) => ({
                centroId: summary.CENTRO_ID,
                situacao: summary.QUESTIONS.find((q) => q.QUESTION === "61df432fdf23b90014a94582")?.ANSWER || "Não respondido",
              })),
            }));
          } catch (err) {
            console.error(`Erro ao carregar dados para a regional ${regional.NOME_REGIONAL}:`, err);
          } finally {
            setLoadingRegionalData((prev) => ({ ...prev, [regional._id]: false }));
          }
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoadingRegionais(false);
      }
    }

    fetchData();
  }, [scope_id, scopeType]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4">
      {regionais.map((regional) => (
        <div key={regional._id}>
          {loadingRegionalData[regional._id] ? (
            <p>Carregando dados para {regional.NOME_REGIONAL}...</p>
          ) : (
            <RegionalTable
              regional={regional}
              centros={centrosByRegional[regional._id] || []}
              situacoes={situacoesByRegional[regional._id] || []}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default RelatorioPage;