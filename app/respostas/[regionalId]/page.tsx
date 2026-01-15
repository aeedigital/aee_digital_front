import Link from "next/link";
import { notFound } from "next/navigation";

import type { Centro, Regional } from "@/interfaces/centro.interface";
import { apiFetch, apiUrl } from "@/lib/api";

type Params = {
  params: {
    regionalId: string;
  };
};

export async function generateStaticParams() {
  try {
    const response = await apiFetch(`/regionais`);
    if (!response.ok) {
      return [];
    }

    const regionais: { _id: string }[] = await response.json();
    return regionais
      .filter((regional) => Boolean(regional._id))
      .map((regional) => ({ regionalId: regional._id }));
  } catch {
    return [];
  }
}

async function fetchJson<T>(path: string) {
  const response = await fetch(apiUrl(path));
  if (!response.ok) {
    throw new Error(`Falha ao buscar ${path} (${response.status})`);
  }
  const payload = await response.json();
  return payload as T;
}

export default async function PublicRegionalSelectCentro({ params }: Params) {
  const { regionalId } = params;

  if (!regionalId) {
    return notFound();
  }

  let regional: Regional | null = null;
  let centros: Centro[] = [];

  try {
    [regional, centros] = await Promise.all([
      fetchJson<Regional>(`/regionais/${regionalId}`),
      fetchJson<Centro[]>(`/centros?REGIONAL=${regionalId}&STATUS=Pendente,Integrada,Inscrita`),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados públicos da regional", error);
    return notFound();
  }

  if (!regional) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/respostas" className="text-sm text-blue-700 hover:underline">
          ← Voltar para regionais
        </Link>
        <span className="text-xs uppercase tracking-wide text-gray-500">
          Consulta pública
        </span>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{regional.NOME_REGIONAL}</h1>
        <p className="text-sm text-gray-600">
          Primeiro selecione o centro para ver as respostas. Alguns dados não são exibidos por
          questão de LGPD.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {centros.map((centro) => (
          <Link
            key={centro._id}
            href={`/respostas/${regionalId}/${centro._id}`}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">Centro</p>
            <h2 className="text-lg font-semibold text-gray-900">
              {centro.NOME_CURTO || centro.NOME_CENTRO || "Sem nome"}
            </h2>
            <p className="text-sm text-blue-700 mt-2">Ver respostas</p>
          </Link>
        ))}

        {!centros.length && (
          <div className="col-span-full rounded-md border border-dashed border-gray-200 p-6 text-center text-sm text-gray-600">
            Nenhum centro encontrado para esta regional.
          </div>
        )}
      </section>
    </div>
  );
}
