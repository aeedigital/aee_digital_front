"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Regional } from '@/interfaces/centro.interface';
import { apiFetch } from '@/lib/api';

export default function PublicRespostasPage() {
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/regionais', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Não foi possível carregar regionais (${response.status})`);
        const data = await response.json() as Regional[];
        setRegionais(data.sort((a, b) => (a.NOME_REGIONAL || '').localeCompare(b.NOME_REGIONAL || '')));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Falha ao carregar regionais.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-gray-500">Consulta pública</p>
        <h1 className="text-3xl font-semibold">Dados por regional</h1>
        <p className="text-sm text-gray-600">Dados atuais carregados da Aliança Digital, somente para leitura e com proteção LGPD.</p>
      </header>
      {loading && <p className="text-sm text-gray-600">Carregando regionais...</p>}
      {error && <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regionais.map((regional) => (
          <Link key={regional._id} href={`/respostas/regional/?regionalId=${encodeURIComponent(regional._id)}`}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs uppercase tracking-wide text-blue-800">Regional</p>
            <h2 className="text-lg font-semibold text-gray-900">{regional.NOME_REGIONAL || 'Sem nome'}</h2>
            <p className="text-sm text-gray-500">{regional.PAIS || 'País não informado'}</p>
            <span className="mt-2 inline-block text-sm font-medium text-blue-800">Ver centros</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
