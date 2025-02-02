"use client";

import { useEffect, useState } from "react";
import Regional_Card from "@/components/Regional_Card";
import { Period } from "@/helpers/datePeriodHelper";
import { Regional } from "@/interfaces/centro.interface";
import { getCadastroInfo } from "@/app/actions/cadastroInfo";
import SummariesGraphComponent from "@/components/SummariesGraphComponent";

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

  useEffect(() => {
    async function fetchRegionais() {
      try {
        const cadastroInfo = await getCadastroInfo();
        setPeriod({ start: cadastroInfo.start, end: cadastroInfo.end });

        const apiPath = `/api/regionais`;
        const response = await fetch(apiPath);
        if (!response.ok) throw new Error("Falha ao buscar regionais");

        const regionaisData: Regional[] = await response.json();

        setRegionais(
          regionaisData.sort((a, b) => 
            a.NOME_REGIONAL.localeCompare(b.NOME_REGIONAL)
          )
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRegionais();
  }, []);

  if (error) {
    return <div style={{ color: "red", fontWeight: "bold" }}>Erro ao carregar regionais: {error}</div>;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {period && <SummariesGraphComponent startDate={period.start} endDate={period.end} />}
      
      {loading
        ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
        : regionais.map((regional) => (
            <Regional_Card
              key={regional._id}
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