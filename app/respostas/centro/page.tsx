"use client";

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Centro, Regional } from '@/interfaces/centro.interface';
import type { Answer, Form, Page, Question } from '@/interfaces/form.interface';
import { apiFetch } from '@/lib/api';
import { buildCadastroAnswersCache } from '@/lib/cadastroViewModel';
import { filterResponsesForPublic } from '@/lib/publicAnswers';
import PublicCentroReadOnly from '@/app/respostas/[regionalId]/[centroId]/PublicCentroReadOnly';

export default function PublicCentroPage() {
  return <Suspense fallback={<p>Carregando respostas...</p>}><CentroContent /></Suspense>;
}

function CentroContent() {
  const params = useSearchParams();
  const regionalId = params.get('regionalId') || '';
  const centroId = params.get('centroId') || '';
  const [regional, setRegional] = useState<Regional | null>(null);
  const [centro, setCentro] = useState<Centro | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!regionalId || !centroId) {
      setError('Centro ou regional não informado.'); setLoading(false); return;
    }
    Promise.all([
      apiFetch(`/regionais/${encodeURIComponent(regionalId)}`, { cache: 'no-store' }),
      apiFetch(`/centros/${encodeURIComponent(centroId)}`, { cache: 'no-store' }),
      apiFetch('/forms?sortBy=VERSION:desc&NAME=Cadastro%20de%20Informa%C3%A7%C3%B5es%20Anual', { cache: 'no-store' }),
      apiFetch(`/answers?CENTRO_ID=${encodeURIComponent(centroId)}`, { cache: 'no-store' }),
    ]).then(async (responses) => {
      if (responses.some((response) => !response.ok)) throw new Error('Não foi possível carregar os dados públicos deste centro.');
      const forms = await responses[2].json() as Form[];
      setRegional(await responses[0].json() as Regional);
      setCentro(await responses[1].json() as Centro);
      setForm(forms[0] || null);
      setAnswers(await responses[3].json() as Answer[]);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Falha ao carregar respostas.'))
      .finally(() => setLoading(false));
  }, [regionalId, centroId]);

  const publicView = useMemo(() => {
    if (!form) return { pages: [] as Page[], cache: {} as Record<string, Answer[]> };
    const questions = form.PAGES.flatMap((page) => page.QUIZES.flatMap((quiz) => quiz.QUESTIONS.flatMap((group) => group.GROUP)));
    const allowed = filterResponsesForPublic(questions.map((question: Question) => ({ _id: question._id, QUESTION_ID: question._id, QUESTION: question.QUESTION, ANSWER: '' })));
    const allowedIds = new Set(allowed.map((question) => question._id));
    const pages = form.PAGES.filter((page) => page.ROLE !== 'coord_regional').map((page) => ({
      ...page,
      QUIZES: page.QUIZES.map((quiz) => ({ ...quiz, QUESTIONS: quiz.QUESTIONS.map((group) => ({ ...group, GROUP: group.GROUP.filter((question) => allowedIds.has(question._id)) })).filter((group) => group.GROUP.length) })).filter((quiz) => quiz.QUESTIONS.length),
    })).filter((page) => page.QUIZES.length);
    return { pages, cache: buildCadastroAnswersCache(answers.filter((answer) => allowedIds.has(answer.QUESTION_ID))) };
  }, [form, answers]);

  return <div className="space-y-6">
    <Link href={`/respostas/regional/?regionalId=${encodeURIComponent(regionalId)}`} className="text-sm text-blue-700 hover:underline">← Voltar para centros</Link>
    <header><p className="text-sm text-gray-600">{regional?.NOME_REGIONAL}</p><h1 className="text-3xl font-semibold">{centro?.NOME_CURTO || centro?.NOME_CENTRO || 'Centro'}</h1><p className="text-sm text-gray-600">Consulta atual, somente leitura e com proteção LGPD.</p></header>
    {loading && <p>Carregando respostas...</p>}
    {error && <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!loading && !error && form && <PublicCentroReadOnly pages={publicView.pages} answersCache={publicView.cache} />}
  </div>;
}
