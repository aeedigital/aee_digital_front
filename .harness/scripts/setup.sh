#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Erro: Node.js nao encontrado. Instale Node.js 18 ou superior." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Erro: npm nao encontrado." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if (( NODE_MAJOR < 18 )); then
  echo "Erro: Node.js 18 ou superior e obrigatorio. Versao atual: $(node --version)." >&2
  exit 1
fi

echo "Instalando dependencias com npm ci..."
npm ci

if [[ ! -f .env ]] && [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
  echo "Aviso: configure NEXT_PUBLIC_API_URL em .env antes de executar o build." >&2
fi

echo "Harness preparado com Node $(node --version) e npm $(npm --version)."
