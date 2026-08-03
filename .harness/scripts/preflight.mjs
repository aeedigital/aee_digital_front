import dotenv from "dotenv";

dotenv.config();

const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!apiBase) {
  console.error(
    "Erro: NEXT_PUBLIC_API_URL nao esta configurada. Defina a variavel antes do build."
  );
  process.exit(1);
}

let healthUrl;
try {
  healthUrl = new URL(`${apiBase.replace(/\/+$/, "")}/regionais`);
} catch {
  console.error("Erro: NEXT_PUBLIC_API_URL nao contem uma URL valida.");
  process.exit(1);
}

try {
  const response = await fetch(healthUrl, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`status HTTP ${response.status}`);
  }

  const regionais = await response.json();
  if (!Array.isArray(regionais)) {
    throw new Error("resposta inesperada para GET /regionais");
  }

  console.log(`Preflight concluido: API acessivel (${regionais.length} regionais).`);
} catch (error) {
  const reason = error instanceof Error ? error.message : "falha desconhecida";
  console.error(`Erro: API indisponivel para o build (${reason}).`);
  process.exit(1);
}
