#!/usr/bin/env bash
# Общие настройки деплоя для СПК-портала

# === НАСТРОЙКИ РЕДАКТИРУЕШЬ ТОЛЬКО ЗДЕСЬ ===

# URL репозитория с проектом
REPO_URL="https://github.com/USER/spk-ultra.git"

# Путь на VPS, где будет лежать проект
VPS_PATH="/opt/spk-ultra"

# Пользователь и хост VPS (Timeweb)
VPS_USER="root"
VPS_HOST="1.2.3.4"

# Имя docker-compose файла (если нужно поменять)
COMPOSE_FILE="docker-compose.yml"

# Имя контейнера backend (для логов/миграций)
BACKEND_SERVICE="backend"

# Имя контейнера базы (для бэкапа)
DB_SERVICE="db"

# Имя базы данных
DB_NAME="spk_ultra"
DB_USER="spk_user"

# Папка для локальных бэкапов
BACKUP_DIR="./backups"

# === ДАЛЬШЕ МОЖЕШЬ НЕ МЕНЯТЬ ===
