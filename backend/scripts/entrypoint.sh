#!/bin/sh

set -e

echo "=== Starting entrypoint ==="

echo "Waiting for postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d postgres -c '\q' 2>/dev/null; do
  echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "Postgres is up!"

echo "Creating database if not exists..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 ||
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $POSTGRES_DB"

echo "Running migrations..."
pnpm prisma migrate deploy

echo "Running seed..."
pnpm dlx tsx prisma/seed.ts

echo "Starting application..."
exec "$@"

