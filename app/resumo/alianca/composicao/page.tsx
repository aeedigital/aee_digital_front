import Link from "next/link";

import ExportCompositionPptButton from "@/components/ExportCompositionPptButton";
import {
  loadCompositionData,
  safePercent,
  type RegionalComposition,
} from "@/lib/compositionReport";

const STATUS_LABELS = {
  Integrada: "Integradas",
  Inscrita: "Inscritas",
  Pendente: "Pendentes",
} as const;

export default async function ComposicaoRegionaisPage() {
  let error: string | null = null;
  let composition: RegionalComposition[] = [];
  let periodLabel: string | null = null;
  let totals = { integradas: 0, inscritas: 0, pendentes: 0, total: 0 };
  let ranking: RegionalComposition[] = [];

  try {
    const data = await loadCompositionData();
    composition = data.composition;
    periodLabel = data.periodLabel;
    totals = data.totals;
    ranking = data.ranking;
  } catch (err: any) {
    error = err?.message || "Erro ao carregar composição das regionais.";
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_55%,#eef6ff_100%)] shadow-sm">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="space-y-3">
            <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
              Antes da AGI
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Composição das regionais
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Visão de composição das regionais com os mesmos números-base do PowerPoint:
                integradas, inscritas e total.
              </p>
            </div>
            {periodLabel && (
              <p className="text-sm font-medium text-slate-700">
                Período do cadastro: <span className="text-slate-950">{periodLabel}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <ExportCompositionPptButton
              composition={composition}
              periodLabel={periodLabel}
              totals={totals}
            />
            <Link
              href="/resumo/alianca"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              Voltar ao resumo
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Regionais" value={composition.length} tone="slate" />
        <SummaryCard label={STATUS_LABELS.Integrada} value={totals.integradas} tone="emerald" />
        <SummaryCard label={STATUS_LABELS.Inscrita} value={totals.inscritas} tone="sky" />
        <SummaryCard label={STATUS_LABELS.Pendente} value={totals.pendentes} tone="amber" />
        <SummaryCard label="Total" value={totals.total} tone="violet" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Composição por regional</h2>
              <p className="text-sm text-slate-600">
                Distribuição atual de casas integradas, inscritas, pendentes e total.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Total geral: <span className="text-slate-950">{totals.total}</span> casas
            </p>
          </div>

          <div className="space-y-4">
            {composition.length === 0 && !error && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
                Nenhuma regional encontrada.
              </div>
            )}

            {composition.map((regional) => (
              <RegionalRow key={regional.id} regional={regional} totalAlliance={totals.total} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Leitura rápida</h2>
            <div className="mt-4 space-y-4">
              <InsightLine
                label="Total geral"
                value={`${totals.total}`}
                helper="Total de casas consideradas na composição atual"
              />
              <InsightLine
                label="Maior bloco"
                value={`${safePercent(totals.integradas, totals.total)}%`}
                helper={`${totals.integradas} casas integradas na base ativa`}
              />
              <InsightLine
                label="Casas a acompanhar"
                value={`${totals.pendentes}`}
                helper="Pendentes merecem atenção antes da AGI"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Top 5 por total de casas</h2>
            <div className="mt-4 space-y-3">
              {ranking.map((regional, index) => (
                <div
                  key={regional.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{regional.nome}</p>
                      <p className="text-xs text-slate-500">
                        {regional.integradas} integradas, {regional.inscritas} inscritas, {regional.total} no total
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-slate-950">{regional.total}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "emerald" | "sky" | "amber" | "violet";
}) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    sky: "border-sky-200 bg-sky-50 text-sky-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    violet: "border-violet-200 bg-violet-50 text-violet-950",
  };

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function InsightLine({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function RegionalRow({
  regional,
  totalAlliance,
}: {
  regional: RegionalComposition;
  totalAlliance: number;
}) {
  const integratedWidth = safePercent(regional.integradas, regional.total);
  const inscritosWidth = safePercent(regional.inscritas, regional.total);
  const pendentesWidth = Math.max(0, 100 - integratedWidth - inscritosWidth);
  const shareOfAlliance = safePercent(regional.total, totalAlliance);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-950">{regional.nome}</h3>
            {regional.pais && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {regional.pais}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {regional.total} casas ativas, {shareOfAlliance}% da composição da Aliança
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <MetricPill label="Integradas" value={regional.integradas} tone="emerald" />
          <MetricPill label="Inscritas" value={regional.inscritas} tone="sky" />
          <MetricPill label="Pendentes" value={regional.pendentes} tone="amber" />
          <MetricPill label="Total" value={regional.total} tone="violet" />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-4 w-full">
          <div className="bg-emerald-500" style={{ width: `${integratedWidth}%` }} />
          <div className="bg-sky-500" style={{ width: `${inscritosWidth}%` }} />
          <div className="bg-amber-400" style={{ width: `${pendentesWidth}%` }} />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <LegendItem label={`${integratedWidth}% integradas`} color="bg-emerald-500" />
          <LegendItem label={`${inscritosWidth}% inscritas`} color="bg-sky-500" />
          <LegendItem label={`${safePercent(regional.pendentes, regional.total)}% pendentes`} color="bg-amber-400" />
        </div>

        <Link
          href={`/resumo/coordenador?regionalId=${regional.id}`}
          className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
        >
          Abrir resumo regional
        </Link>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "sky" | "amber" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800",
    sky: "bg-sky-50 text-sky-800",
    amber: "bg-amber-50 text-amber-800",
    violet: "bg-violet-50 text-violet-800",
  };

  return (
    <div className={`rounded-2xl px-3 py-2 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function LegendItem({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
