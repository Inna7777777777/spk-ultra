# СПК / СНТ · Мультисайт ULTRA (корпоративный)

Профессиональный мультисайт-портал для садоводства:

- **Сайты**: `spk1`, `spk2`, `aihub`
- **Модули**:
  - Кабинет пользователя (профиль + роли по сайтам)
  - Финансовая сводка (по сайту и личные начисления)
  - Календарь событий
  - Форум
  - Онлайн-чат (WebSocket)
  - Взносы и начисления (автонагляды по участкам и по членам)
  - Реестр участков (Plot)
  - Архив документов (Устав, протоколы, сметы, договоры и др.)
  - Страницы сайта (Устав, тарифы, контакты и т.д.)

## 1. Структура для GitHub

Репозиторий можно держать на GitHub как обычный корпоративный проект:

- `backend/` — FastAPI, SQLAlchemy, JWT
- `frontend/` — React + Ant Design, билд через Vite
- `docker-compose.yml` — прод-конфигурация (frontend через nginx, backend отдельным сервисом)
- `.github/workflows/deploy.yml` — (см. ниже) CI/CD для автоматического деплоя на VPS
- `scripts/` — скрипты для инициализации и деплоя

Файл `.gitignore` уже настроен для Python / Node / IDE.

## 2. Развёртывание на VPS (например, Timeweb)

### Вариант A: сервер сам делает `git pull`

1. **На VPS (Ubuntu / Debian):**

```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Установка Docker и docker-compose-plugin
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg]   https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Клон репозитория
sudo mkdir -p /opt/spk-ultra
sudo chown $USER:$USER /opt/spk-ultra
cd /opt/spk-ultra
git clone https://github.com/USER/REPO.git .
cp .env.example .env  # при необходимости отредактировать
docker compose up -d --build
```

2. **Обновление после новых коммитов:**

```bash
cd /opt/spk-ultra
git pull
docker compose up -d --build
```

### Вариант B: GitHub Actions автоматически деплоит через SSH

- На GitHub в репозитории создать Secrets:

  - `VPS_HOST` — IP или домен VPS (Timeweb)
  - `VPS_USER` — пользователь (например, `root` или отдельный sudo-пользователь)
  - `VPS_SSH_KEY` — приватный SSH-ключ (та же пара, что добавлена в `~/.ssh/authorized_keys` на VPS)

Файл workflow `.github/workflows/deploy.yml` уже включён (см. ниже).

## 3. Локальный запуск (dev)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

### Доступ по умолчанию

- Email: `admin@example.com`
- Пароль: `admin123`

## 4. Docker (prod-режим)

```bash
cp .env.example .env  # отредактировать при необходимости
docker compose up -d --build
```

Сайт будет доступен на порту 80 сервера (Nginx, React SPA, API под `/api`).


## 9. Portainer (графический интерфейс для Docker)

В `docker-compose.yml` уже добавлен сервис `portainer`:

- URL: `http://IP_VPS:9000`
- При первом запуске система попросит задать пароль администратора Portainer.
- Через Portainer можно:
  - смотреть список контейнеров, логов, томов;
  - перезапускать сервисы;
  - видеть состояние Docker без командной строки.

## 10. Автоматические скрипты для администратора

В папке `scripts/` находятся:

- `config.sh` — общий конфиг (REPO_URL, VPS_HOST, VPS_USER, пути).
- `vps_init.sh` — первичная установка на VPS (ставит Docker, клонирует репозиторий, запускает `docker compose`).
- `vps_deploy.sh` — обновление кода на VPS (git pull + docker compose up -d --build).
- `vps_logs_backend.sh` — просмотр логов backend-сервиса.
- `vps_backup_db.sh` — локальный бэкап базы (SQL-файл на ваш компьютер).
- `vps_auto_update.sh` — скрипт для ежедневного автообновления (можно повесить в cron на VPS).
- `vps_backup_to_rclone.sh` — бэкап БД и отправка в облако через `rclone` (Yandex Disk / Google Drive).

### Пример cron для автообновления и бэкапа на VPS

```bash
crontab -e
```

И добавить, например:

```bash
0 3 * * * /opt/spk-ultra/scripts/vps_auto_update.sh >> /var/log/spk_auto_update.log 2>&1
30 3 * * * /opt/spk-ultra/scripts/vps_backup_to_rclone.sh >> /var/log/spk_backup.log 2>&1
```

(пути можно скорректировать под реальное расположение проекта).
