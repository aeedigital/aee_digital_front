"use client";

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Centro, Regional } from '@/interfaces/centro.interface';
import { apiFetch } from '@/lib/api';

export default function PublicRegionalPage() {
  return <Suspense fallback={<p>Carregando centros...</p>}><RegionalContent /></Suspense>;
}

function RegionalContent() {
  const regionalId = useSearchParams().get('regionalId') || '';
  const [regional, setRegional] = useState<Regional | null>(null);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!regionalId) {
      setError('Regional não informada.');
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch(`/regionais/${encodeURIComponent(regionalId)}`, { cache: 'no-store' }),
      apiFetch(`/centros?REGIONAL=${encodeURIComponent(regionalId)}`, { cache: 'no-store' }),
    ]).then(async ([regionalResponse, centersResponse]) => {
      if (!regionalResponse.ok || !centersResponse.ok) throw new Error('Não foi possível carregar os centros desta regional.');
      setRegional(await regionalResponse.json() as Regional);
      setCentros(await centersResponse.json() as Centro[]);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Falha ao carregar centros.'))
      .finally(() => setLoading(false));
  }, [regionalId]);

  return <div className="space-y-6">
    <Link href="/respostas/" className="text-sm text-blue-700 hover:underline">← Voltar para regionais</Link>
    <header><p className="text-sm text-gray-500">Consulta pública</p><h1 className="text-3xl font-semibold">{regional?.NOME_REGIONAL || 'Regional'}</h1></header>
    {loading && <p>Carregando centros...</p>}
    {error && <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="grid gap-4 md:grid-cols-2">
      {centros.map((centro) => <Link key={centro._id}
        href={`/respostas/centro/?regionalId=${encodeURIComponent(regionalId)}&centroId=${encodeURIComponent(centro._id)}`}
        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md">
        <p className="text-xs uppercase tracking-wide text-gray-500">Centro</p>
        <h2 className="text-lg font-semibold">{centro.NOME_CURTO || centro.NOME_CENTRO || 'Sem nome'}</h2>
        <p className="mt-2 text-sm text-blue-700">Ver respostas</p>
      </Link>)}
    </section>
  </div>;
}
