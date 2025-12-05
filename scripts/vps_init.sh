#!/usr/bin/env bash
set -e

# Загружаем конфиг
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

if [ -z "$VPS_HOST" ] || [ "$VPS_HOST" = "1.2.3.4" ]; then
  echo "❌ В config.sh не задан VPS_HOST. Отредактируй scripts/config.sh."
  exit 1
fi

echo "🚀 Первичная инициализация VPS $VPS_USER@$VPS_HOST"

ssh "$VPS_USER@$VPS_HOST" bash -s <<EOF
set -e
echo "📦 Обновляем систему..."
apt update -y && apt upgrade -y

echo "📦 Ставим зависимости..."
apt install -y ca-certificates curl gnupg git docker.io docker-compose-plugin

mkdir -p "$VPS_PATH"
cd "$VPS_PATH"

if [ ! -d .git ]; then
  echo "📥 Клонируем репозиторий $REPO_URL..."
  git clone "$REPO_URL" .
else
  echo "🔄 Репозиторий уже есть, делаем git pull..."
  git pull
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  echo "📄 .env не найден, копируем из .env.example (потом не забудь отредактировать)..."
  cp .env.example .env
fi

echo "🐳 Запускаем docker compose..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "✅ Готово. Проект запущен на VPS."
EOF
