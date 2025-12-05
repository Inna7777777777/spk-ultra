#!/usr/bin/env bash
set -e

# Скрипт для автоматического обновления сервера и проекта.
# Предполагается запуск из cron НА VPS.

PROJECT_DIR="/opt/spk-ultra"
COMPOSE_FILE="docker-compose.yml"

echo "==== [$(date)] Автообновление СПК-портала ===="

cd "$PROJECT_DIR" || exit 1

echo "📦 apt update..."
apt-get update -y >/dev/null 2>&1 || true

echo "🐳 docker system prune -f (очистка)..."
docker system prune -f >/dev/null 2>&1 || true

echo "🔄 git pull..."
git pull || true

echo "🐳 docker compose up -d --build..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "✅ Завершено."
