#!/usr/bin/env bash
set -euo pipefail

cd /opt/spk-ultra

# Поднимаем переменные из .env, чтобы echo https://${FRONTEND_DOMAIN} не падал
if [ -f ".env" ]; then
  set -a
  source .env
  set +a
else
  echo "[FATAL] .env не найден в /opt/spk-ultra"
  exit 1
fi

echo "=== СПК «Хорошово-1» деплой (CI/CD) ==="

# бэкап env
if [ -f ".env" ] && [ ! -f ".env.backup" ]; then
  cp .env .env.backup
  echo "[OK] .env.backup создан"
fi

echo "[1/6] git pull..."
git pull --rebase

echo "[2/6] docker compose down (remove-orphans)..."
docker compose --env-file .env down --remove-orphans || true

echo "[3/6] docker compose pull..."
docker compose --env-file .env pull || true

echo "[4/6] docker compose build..."
docker compose --env-file .env build

echo "[5/6] docker compose up -d..."
docker compose --env-file .env up -d

echo "[6/6] docker ps"
docker ps

echo
echo "=== Доступные панели ==="
echo "Сайт:               https://${FRONTEND_DOMAIN}"
echo "API / Swagger:      https://${BACKEND_DOMAIN}/docs"
echo "Traefik:            https://${TRAEFIK_DOMAIN}"
echo "Portainer:          https://${PORTAINER_DOMAIN}"
echo "pgAdmin:            https://${PGADMIN_DOMAIN}"
echo "Adminer:            https://${ADMINER_DOMAIN}"
echo "MinIO API:          https://${MINIO_API_DOMAIN}"
echo "MinIO Console:      https://${MINIO_CONSOLE_DOMAIN}"
echo "Grafana:            https://${GRAFANA_DOMAIN}"
echo "RabbitMQ:           https://${RABBITMQ_DOMAIN}"


echo "Готово ✅"

Сделай исполняемым:

chmod +x /opt/spk-ultra/deploy.sh
