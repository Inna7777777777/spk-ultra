#!/usr/bin/env bash
set -e

# Локальный скрипт деплоя: отправляет последний код на VPS и перезапускает docker compose.
# Использует переменные:
#   VPS_HOST
#   VPS_USER
#   VPS_PATH (например, /opt/spk-ultra)

if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ] || [ -z "$VPS_PATH" ]; then
  echo "Нужно задать VPS_HOST, VPS_USER и VPS_PATH"
  exit 1
fi

echo "==> Сборка и отправка кода на $VPS_USER@$VPS_HOST:$VPS_PATH"
# Отправляем только необходимые файлы (git archive через ssh можно сделать, но здесь используем rsync)
rsync -avz --delete   --exclude '.git'   --exclude 'node_modules'   --exclude '.venv'   ./ "$VPS_USER@$VPS_HOST:$VPS_PATH"

echo "==> Перезапуск docker compose на сервере..."
ssh "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && docker compose up -d --build"

echo "Готово."
