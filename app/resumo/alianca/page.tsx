"use client";

import { useEffect, useMemo, useState } from "react";
import Regional_Card from "@/components/Regional_Card";
import { Period } from "@/helpers/datePeriodHelper";
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

        const response = await apiFetch(`/regionais`, { cache: "no-store" });

        if (!response.ok) {
          const message = `Falha ao buscar regionais (${response.status})`;
          throw new Error(message);
        }

        const regionaisData: Regional[] = await response.json();

        console.log("Regionais fetched:", regionaisData);

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

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {period && <SummariesGraphComponent startDate={period.start} endDate={period.end} />}

      {loading && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}

      {noRegionais && <div style={{ color: "#444", fontWeight: "bold" }}>Nenhuma regional retornada pela API.</div>}

      {!loading &&
        !noRegionais &&
        regionais.map((regional, index) => (
          <Regional_Card
            key={regional._id || regional.NOME_REGIONAL || index}
            nome={regional.NOME_REGIONAL}
            pais={regional.PAIS}
            regionalId={regional._id}
            period={period}
          />
        ))}
    </div>
  );
}

export default function Summary_Alianca() {
  return <RegionalList />;
}
