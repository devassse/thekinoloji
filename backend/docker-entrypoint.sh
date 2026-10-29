#!/bin/sh
set -e
echo "A aplicar migrations..."
npx prisma migrate deploy
exec "$@"
