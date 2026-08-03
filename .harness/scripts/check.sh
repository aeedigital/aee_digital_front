#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-full}"

if [[ "$MODE" != "full" && "$MODE" != "--quick" ]]; then
  echo "Uso: $0 [--quick]" >&2
  exit 2
fi

echo "Executando lint..."
npm run lint

echo "Executando verificacao de tipos..."
npm run typecheck

echo "Executando testes automatizados..."
npm run test:run

if [[ "$MODE" == "--quick" ]]; then
	echo "Checagem rapida concluida."
	exit 0
fi

echo "Validando acesso a API..."
npm run harness:preflight

echo "Gerando build estatico..."
BUILD_LOG="$(mktemp "${TMPDIR:-/tmp}/aee-build.XXXXXX.log")"
trap 'rm -f "$BUILD_LOG"' EXIT

if ! npm run build >"$BUILD_LOG" 2>&1; then
  cat "$BUILD_LOG"
  echo "Erro: o build estatico falhou." >&2
  exit 1
fi

PUBLIC_FETCH_ERROR="Erro ao carregar dados públicos"
if grep -q "$PUBLIC_FETCH_ERROR" "$BUILD_LOG"; then
  error_count="$(grep -c "$PUBLIC_FETCH_ERROR" "$BUILD_LOG")"
  grep -m 10 "$PUBLIC_FETCH_ERROR" "$BUILD_LOG" >&2
  echo "Erro: o build registrou $error_count falhas ao gerar paginas publicas." >&2
  echo "A API respondeu no preflight, mas falhou durante a geracao estatica." >&2
  exit 1
fi

tail -n 80 "$BUILD_LOG"

echo "Validando artefatos do build..."
npm run harness:smoke

echo "Validacao completa concluida."
