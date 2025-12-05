#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

if [ -z "$VPS_HOST" ] || [ "$VPS_HOST" = "1.2.3.4" ]; then
  echo "❌ В config.sh не задан VPS_HOST. Отредактируй scripts/config.sh."
  exit 1
fi

echo "🚀 Деплой на VPS $VPS_USER@$VPS_HOST..."

ssh "$VPS_USER@$VPS_HOST" bash -s <<EOF
set -e
cd "$VPS_PATH"
echo "🔄 git pull..."
git pull

echo "🐳 docker compose up -d --build..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "✅ Деплой завершён."
EOF
