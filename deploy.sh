#!/usr/bin/env bash
# Uso no VPS:  ./deploy.sh            → build + arranque
#              ./deploy.sh seed       → corre o seed (só na 1ª vez; cria contas demo!)
#              ./deploy.sh uploads    → copia backend/uploads local para o volume
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "Falta o ficheiro .env (cp .env.example .env)"; exit 1; }
case "${1:-up}" in
  up)      docker compose up -d --build && docker compose ps ;;
  seed)    docker compose exec api npx prisma db seed ;;
  uploads) docker compose cp backend/uploads/. api:/app/uploads/ && docker compose exec -u root api chown -R node:node /app/uploads ;;
  logs)    docker compose logs -f --tail=100 ;;
  *)       echo "Comandos: up | seed | uploads | logs"; exit 1 ;;
esac
