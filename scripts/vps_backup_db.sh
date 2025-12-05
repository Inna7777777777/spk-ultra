#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

echo "💾 Делаем бэкап БД из контейнера $DB_SERVICE на VPS..."

ssh "$VPS_USER@$VPS_HOST" bash -s <<EOF
set -e
cd "$VPS_PATH"
docker compose exec -T $DB_SERVICE pg_dump -U "$DB_USER" "$DB_NAME" > /tmp/db_backup.sql
EOF

scp "$VPS_USER@$VPS_HOST:/tmp/db_backup.sql" "$BACKUP_FILE"

ssh "$VPS_USER@$VPS_HOST" "rm -f /tmp/db_backup.sql"

echo "✅ Бэкап сохранён локально в $BACKUP_FILE"
