#!/usr/bin/env bash
set -e

# Скрипт первичной инициализации VPS (Ubuntu) под проект SPK ULTRA.
# Запускать на VPS один раз (через SSH).

PROJECT_DIR="/opt/spk-ultra"
REPO_URL="${REPO_URL:-https://github.com/USER/REPO.git}"

echo "==> Обновление системы..."
sudo apt update && sudo apt upgrade -y

echo "==> Установка Docker и docker-compose-plugin..."
sudo apt install -y ca-certificates curl gnupg lsb-release git

if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg]     https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" |     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
fi

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo mkdir -p "$PROJECT_DIR"
sudo chown "$USER":"$USER" "$PROJECT_DIR"

echo "==> Клонирование репозитория $REPO_URL ..."
cd "$PROJECT_DIR"
if [ ! -d .git ]; then
  git clone "$REPO_URL" .
else
  git pull
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "==> Запуск docker compose..."
docker compose up -d --build

echo "Готово. Проект запущен в $PROJECT_DIR."
