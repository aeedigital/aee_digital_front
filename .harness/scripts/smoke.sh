#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

REQUIRED_FILES=(
  "out/index.html"
  "out/login/index.html"
  "out/about/index.html"
  "out/respostas/index.html"
  "out/resumo/alianca/index.html"
  "out/resumo/coordenador/index.html"
)

if [[ ! -d out ]]; then
  echo "Erro: diretorio out/ nao encontrado. Execute npm run build primeiro." >&2
  exit 1
fi

missing=0
for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -s "$file" ]]; then
    echo "Erro: artefato ausente ou vazio: $file" >&2
    missing=1
  fi
done

if (( missing != 0 )); then
  exit 1
fi

echo "Smoke test concluido: ${#REQUIRED_FILES[@]} artefatos essenciais encontrados."
