#!/usr/bin/env bash
# ==============================================================================
# ERP Phoenix - Standalone Database Migration Runner Script
# Usage: ./scripts/migrate-db.sh [--seed-demo]
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Ensure dotnet in PATH (macOS / Linux default paths)
export PATH="/usr/local/share/dotnet:/opt/homebrew/bin:/usr/local/bin:${PATH}"
export ASPNETCORE_ENVIRONMENT="${ASPNETCORE_ENVIRONMENT:-Development}"

echo "================================================="
echo "🛠️  [ERP Phoenix] Running Standalone DB Migration"
echo "================================================="

cd "${ROOT_DIR}"

DOTNET_ARGS="--migrate-only"
if [[ "${1:-}" == "--seed-demo" ]]; then
  DOTNET_ARGS="--migrate-only --seed-demo"
  echo "ℹ️  Flag '--seed-demo' detected: will ensure demo data is seeded."
fi

dotnet run --project backend/src/ERP.Host --no-launch-profile -- ${DOTNET_ARGS}

EXIT_CODE=$?
if [ ${EXIT_CODE} -eq 0 ]; then
  echo "✅ [ERP Phoenix] Database migration and seeding finished successfully."
else
  echo "❌ [ERP Phoenix] Database migration failed with exit code ${EXIT_CODE}."
  exit ${EXIT_CODE}
fi
