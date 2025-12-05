#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

ssh "$VPS_USER@$VPS_HOST" "cd '$VPS_PATH' && docker compose logs -f $BACKEND_SERVICE"
