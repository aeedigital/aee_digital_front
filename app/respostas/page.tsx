import Link from "next/link";

import { apiFetch } from "@/lib/api";
import type { Regional } from "@/interfaces/centro.interface";

async function fetchRegionais(): Promise<Regional[]> {
  const response = await apiFetch(`/regionais`);
  if (!response.ok) {
    throw new Error(`Não foi possível carregar regionais (${response.status})`);
  }

  const regionais: Regional[] = await response.json();
  return regionais.sort((a, b) =>
    (a.NOME_REGIONAL || "").localeCompare(b.NOME_REGIONAL || "")
  );
}

export default async function PublicRespostasPage() {
  const regionais = await fetchRegionais();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-gray-500">Consulta pública</p>
        <h1 className="text-3xl font-semibold">Dados por regional</h1>
        <p className="text-sm text-gray-600">
          Visualização só leitura dos dados mais recentes de cada centro. Algumas informações não
          serão exibidos por questão de LGPD.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regionais.map((regional) => (
          <Link
            key={regional._id}
            href={`/respostas/${regional._id}`}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-800">
                  Regional
                </p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {regional.NOME_REGIONAL || "Sem nome"}
                </h2>
                <p className="text-sm text-gray-500">
                  {regional.PAIS || "País não informado"}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                Ver respostas
              </span>
            </div>
          </Link>
        ))}

        {!regionais.length && (
          <div className="col-span-full rounded-md border border-dashed border-gray-200 p-6 text-center text-sm text-gray-600">
            Nenhuma regional disponível para consulta.
          </div>
        )}
      </div>
    </div>
  );
}
