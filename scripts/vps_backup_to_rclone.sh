#!/usr/bin/env bash
set -e

# Бэкап БД и отправка на облако через rclone (Yandex Disk / Google Drive).
# Требования:
#   - на VPS установлен rclone
#   - настроены remote-аккаунты, например: "yandex:" и/или "gdrive:"

PROJECT_DIR="/opt/spk-ultra"
DB_CONTAINER="spk_ultra_db"
DB_NAME="${POSTGRES_DB:-spk_ultra}"
DB_USER="${POSTGRES_USER:-spk_user}"

# Папка и имя файла
TS="$(date +%Y%m%d_%H%M%S)"
LOCAL_BACKUP="/tmp/spk_db_backup_${TS}.sql"

# Remote-назначения rclone (можно закомментировать одно из них)
YANDEX_REMOTE="yandex:spk-backups"
GDRIVE_REMOTE="gdrive:spk-backups"

echo "💾 Делаем дамп БД из контейнера $DB_CONTAINER..."

cd "$PROJECT_DIR" || exit 1

docker exec -i "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$LOCAL_BACKUP"

echo "☁️ Отправляем бэкап в Yandex Disk (если настроен)..."
if rclone lsd "$YANDEX_REMOTE" >/dev/null 2>&1; then
  rclone copy "$LOCAL_BACKUP" "$YANDEX_REMOTE"
else
  echo "⚠️ Yandex remote не настроен или недоступен ($YANDEX_REMOTE)"
fi

echo "☁️ Отправляем бэкап в Google Drive (если настроен)..."
if rclone lsd "$GDRIVE_REMOTE" >/dev/null 2>&1; then
  rclone copy "$LOCAL_BACKUP" "$GDRIVE_REMOTE"
else
  echo "⚠️ Google Drive remote не настроен или недоступен ($GDRIVE_REMOTE)"
fi

echo "🧹 Удаляем локальный временный файл..."
rm -f "$LOCAL_BACKUP"

echo "✅ Бэкап БД завершён."
