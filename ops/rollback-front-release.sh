#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Uso: $0 <before-versions.json> [aws-profile]" >&2
  exit 2
fi

MANIFEST="$1"
AWS_PROFILE_NAME="${2:-bruno}"
BUCKET="aee-alianca-digital"
DISTRIBUTION_ID="EBMPXMEWAUJC8"
EXPECTED_ACCOUNT="115186094843"
export AWS_PROFILE="$AWS_PROFILE_NAME"

ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
[[ "$ACCOUNT" == "$EXPECTED_ACCOUNT" ]] || { echo "Conta AWS incorreta: $ACCOUNT" >&2; exit 1; }
[[ -f "$MANIFEST" ]] || { echo "Manifesto não encontrado: $MANIFEST" >&2; exit 1; }

CURRENT_KEYS="$(mktemp)"
PREVIOUS_KEYS="$(mktemp)"
trap 'rm -f "$CURRENT_KEYS" "$PREVIOUS_KEYS"' EXIT
aws s3api list-objects-v2 --bucket "$BUCKET" --query 'Contents[].Key' --output text | tr '\t' '\n' | sort > "$CURRENT_KEYS"
jq -r '.Versions[]? | select(.IsLatest == true) | .Key' "$MANIFEST" | sort > "$PREVIOUS_KEYS"

comm -23 "$CURRENT_KEYS" "$PREVIOUS_KEYS" | while IFS= read -r key; do
  [[ -z "$key" ]] || aws s3api delete-object --bucket "$BUCKET" --key "$key" >/dev/null
done

jq -r '.Versions[]? | select(.IsLatest == true) | [.Key, .VersionId] | @tsv' "$MANIFEST" |
while IFS=$'\t' read -r key version; do
  aws s3api copy-object --bucket "$BUCKET" --key "$key" --copy-source "$BUCKET/$key?versionId=$version" >/dev/null
done

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths '/*' >/dev/null
echo "Rollback restaurado e CloudFront invalidado."
