"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Regional_Card from "@/components/Regional_Card";
import { Period } from "@/helpers/datePeriodHelper";
import { Regional } from "@/interfaces/centro.interface";

function RegionalList() {
  const searchParams = useSearchParams();
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  const period: Period = { start, end };
  console.log("Period", period);

  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegionais() {
      try {
        let apiPath = `/api/regionais`;

        const regionaisData: Regional[] = await fetch(apiPath).then((res) =>
          res.json()
        );

        // Ordena os regionais
        const sortedRegionais = regionaisData.sort((a, b) =>
          a.NOME_REGIONAL.localeCompare(b.NOME_REGIONAL)
        );

        setRegionais(sortedRegionais);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchRegionais();
  }, []);

  if (error) {
    return <div>Erro ao carregar regionais: {error}</div>;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {regionais.map((regional) => (
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
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegionalList />
    </Suspense>
  );
}
