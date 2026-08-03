#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUCKET="aee-alianca-digital"
DISTRIBUTION_ID="EBMPXMEWAUJC8"
EXPECTED_AWS_ACCOUNT_ID="115186094843"
DEFAULT_AWS_PROFILE="bruno"
DEPLOY_AWS_PROFILE="${1:-${AWS_PROFILE:-$DEFAULT_AWS_PROFILE}}"
RELEASE_DIR="$ROOT_DIR/.deploy-releases"

if [[ $# -gt 1 ]]; then
  echo "Uso: $0 [aws-profile]" >&2
  exit 2
fi

export AWS_PROFILE="$DEPLOY_AWS_PROFILE"
CURRENT_AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
if [[ "$CURRENT_AWS_ACCOUNT_ID" != "$EXPECTED_AWS_ACCOUNT_ID" ]]; then
  echo "Deploy recusado para a conta AWS '$CURRENT_AWS_ACCOUNT_ID'; esperada '$EXPECTED_AWS_ACCOUNT_ID'." >&2
  exit 1
fi

mkdir -p "$RELEASE_DIR"
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
PREVIOUS_VERSIONS="$RELEASE_DIR/front-$RELEASE_ID-before.json"
CURRENT_VERSIONS="$RELEASE_DIR/front-$RELEASE_ID-after.json"

echo "🔐 Conta $CURRENT_AWS_ACCOUNT_ID validada com o perfil $DEPLOY_AWS_PROFILE"
aws s3api put-bucket-versioning --bucket "$BUCKET" --versioning-configuration Status=Enabled
aws s3api get-bucket-versioning --bucket "$BUCKET" --query Status --output text | grep -qx Enabled
aws s3api list-object-versions --bucket "$BUCKET" --output json > "$PREVIOUS_VERSIONS"

cd "$ROOT_DIR"

echo "🧹 Limpando artefatos incrementais do Next.js"
rm -rf "$ROOT_DIR/.next" "$ROOT_DIR/out"

echo "🛠  [1/3] Build limpo"
npm run build

if [ ! -d "$ROOT_DIR/out" ]; then
  echo "Erro: diretório de build 'out' não encontrado. Abortando." >&2
  exit 1
fi

if rg -Fq 'resumos (CSV)' "$ROOT_DIR/out"; then
  echo "Erro: o build ainda contém o rótulo legado de exportação CSV." >&2
  exit 1
fi

if ! rg -Fq 'resumos (XLSX)' "$ROOT_DIR/out"; then
  echo "Erro: o build não contém o rótulo esperado de exportação XLSX." >&2
  exit 1
fi

echo "☁️  [2/3] Enviando para s3://$BUCKET"
aws s3 sync "$ROOT_DIR/out/" "s3://$BUCKET" --delete
aws s3api list-object-versions --bucket "$BUCKET" --output json > "$CURRENT_VERSIONS"

echo "🚀  [3/3] Invalidando CloudFront $DISTRIBUTION_ID"
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

BUILD_SHA256="$(find "$ROOT_DIR/out" -type f -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | awk '{print $1}')"
MANIFEST_PATH="$RELEASE_DIR/front-$RELEASE_ID-manifest.json"
cat > "$MANIFEST_PATH" <<EOF
{
  "releaseId": "$RELEASE_ID",
  "accountId": "$CURRENT_AWS_ACCOUNT_ID",
  "profile": "$DEPLOY_AWS_PROFILE",
  "bucket": "$BUCKET",
  "distributionId": "$DISTRIBUTION_ID",
  "buildSha256": "$BUILD_SHA256",
  "before": "$PREVIOUS_VERSIONS",
  "after": "$CURRENT_VERSIONS",
  "rollback": "ops/rollback-front-release.sh '$PREVIOUS_VERSIONS' '$DEPLOY_AWS_PROFILE'"
}
EOF

echo "✅ Deploy finalizado: build enviado, cache invalidado e manifesto salvo em $MANIFEST_PATH."
