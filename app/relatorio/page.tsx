"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function RelatorioPageWrapper() {
  return (
    <Suspense fallback={<p>Carregando relatório...</p>}>
      <RelatorioPage />
    </Suspense>
  );
}

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

// Services
async function fetchRegionais(scopeType: string, scope_id: string): Promise<Regional[]> {
  if (scopeType === "regional") {
    const response = await apiFetch(`/regionais/${scope_id}`);
    if (!response.ok) throw new Error("Erro ao buscar informações da regional");
    const regional = await response.json();
    return [regional];
  } else {
    const response = await apiFetch(`/regionais`);
    if (!response.ok) throw new Error("Erro ao buscar regionais");
    return await response.json();
  }
}

async function fetchCentros(regionalId: string): Promise<Centro[]> {
  const response = await apiFetch(`/regionais/${regionalId}/centros`);
  if (!response.ok) throw new Error(`Erro ao buscar centros para a regional ${regionalId}`);
  return await response.json();
}

async function fetchSummaries(regionalId: string): Promise<Summary[]> {
  const response = await apiFetch(`/regionais/${regionalId}/summaries`);
  if (!response.ok) throw new Error(`Erro ao buscar summaries para a regional ${regionalId}`);
  return await response.json();
}

// Components
const RegionalTable: React.FC<{
  regional: Regional;
  centros: Centro[];
  situacoes: { centroId: string; situacao: string }[];
}> = ({ regional, centros, situacoes }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = centros.map((centro) => ({
    id: centro._id,
    nomeCurto: centro.NOME_CURTO,
    situacao: situacoes.find((s) => s.centroId === centro._id)?.situacao || "Não respondido",
  }));

  const columns: ColumnDef<typeof data[0]>[] = [
    {
      accessorKey: "nomeCurto",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome Curto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "situacao",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Situação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Ensure sorted row model is used
  });

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-4">Relatório - {regional.NOME_REGIONAL}</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Main Component
const RelatorioPage: React.FC = () => {
  const searchParams = useSearchParams();
  const scope_id = searchParams.get("contextId") || searchParams.get("scope_id") || "";
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

        if (!scope_id) {
          throw new Error("Contexto não informado");
        }

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
