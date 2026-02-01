"use client";

import { useEffect, useMemo, useState } from "react";
import Regional_Card from "@/components/Regional_Card";
import { Period } from "@/app/helpers/datePeriodHelper";
import { Regional } from "@/interfaces/centro.interface";
import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import SummariesGraphComponent from "@/components/SummariesGraphComponent";
import { apiFetch } from "@/lib/api";

function SkeletonCard() {
  return (
    <div
      style={{
        width: "300px",
        height: "150px",
        backgroundColor: "#e0e0e0",
        borderRadius: "8px",
        margin: "10px",
      }}
    ></div>
  );
}

function RegionalList() {
  const [loading, setLoading] = useState(true);
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period | undefined>();
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);
  const noRegionais = !loading && !error && regionais.length === 0;

  useEffect(() => {
    async function fetchRegionais() {
      try {
        const cadastroInfo = await getCadastroInfo();
        setPeriod({ start: cadastroInfo.start, end: cadastroInfo.end });

        // Formatar datas para ISO (yyyy-mm-dd)
        const formatToISO = (dateStr?: string) => {
          if (!dateStr) return undefined;
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [d, m, y] = dateStr.split("/");
            return `${y}-${m}-${d}`;
          }
          return dateStr;
        };

        const dateFrom = formatToISO(cadastroInfo.start);
        const dateTo = formatToISO(cadastroInfo.end);

        // Usar nova rota /regionais/overview com agregação pronta
        let overviewUrl = `/regionais/overview`;
        const params = new URLSearchParams();
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        if (params.toString()) {
          overviewUrl += `?${params.toString()}`;
        }

        const response = await apiFetch(overviewUrl, { cache: "no-store" });

        if (!response.ok) {
          const message = `Falha ao buscar regionais (${response.status})`;
          throw new Error(message);
        }

        const regionaisData: Regional[] = await response.json();

        console.log("Regionais overview fetched:", regionaisData);

        setRegionais(
          regionaisData.sort((a, b) =>
            (a.NOME_REGIONAL || "").localeCompare(b.NOME_REGIONAL || "")
          )
        );
      } catch (err: any) {
        const friendlyMessage = err?.message || "Erro desconhecido";
        const baseUrlInfo = apiBase ? ` na API ${apiBase}` : " (NEXT_PUBLIC_API_URL não definida)";
        setError(`Não foi possível carregar regionais${baseUrlInfo}. Detalhes: ${friendlyMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchRegionais();
  }, [apiBase]);

  if (error) {
    return <div style={{ color: "red", fontWeight: "bold" }}>Erro ao carregar regionais: {error}</div>;
  }

  const parseDate = (value?: string) => {
    if (!value) return null;
    // suporta ISO ou formato dd/MM/yyyy usado em getCadastroInfo
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split("/").map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value?: string) => {
    const date = parseDate(value);
    if (!date) return null;
    return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const formattedPeriod =
    period && (period.start || period.end)
      ? `${formatDate(period.start) || "início não definido"} até ${formatDate(period.end) || "sem data de término"
      }`
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {formattedPeriod && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "#f0f4ff",
            color: "#1f2a44",
            fontWeight: 600,
            border: "1px solid #d6e0ff",
          }}
        >
          Período de avaliação: {formattedPeriod}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {period && <SummariesGraphComponent startDate={period.start} endDate={period.end} />}

        {loading && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}

        {noRegionais && <div style={{ color: "#444", fontWeight: "bold" }}>Nenhuma regional retornada pela API.</div>}

        {!loading &&
          !noRegionais &&
          regionais.map((regional, index) => {
            const regionalId =
              (regional as any)?._id ||
              (regional as any)?.id ||
              (regional as any)?.regionalId ||
              (regional as any)?.ID ||
              null;

            const nomeRegional =
              regional.NOME_REGIONAL ||
              (regional as any)?.nomeRegional ||
              (regional as any)?.nome ||
              (regional as any)?.name ||
              "Sem nome";

            if (!regionalId) {
              console.warn("[Resumo/Aliança] Regional sem ID", regional);
            }

            console.log("[Regional_Card] Props:", {
              regionalData: regional,
              nome: nomeRegional,
              centrosCount: (regional as any)?.centrosCount,
              finalizadosCount: (regional as any)?.finalizadosCount
            });

            return (
              <Regional_Card
                key={regionalId || nomeRegional || index}
                nome={nomeRegional}
                pais={regional.PAIS || ""}
                regionalId={regionalId || ""}
                centrosCount={(regional as any)?.centrosCount || 0}
                finalizadosCount={(regional as any)?.finalizadosCount || 0}
                period={period}
              />
            );
          })}
      </div>
    </div>
  );
}

export default function Summary_Alianca() {
  return <RegionalList />;
}
