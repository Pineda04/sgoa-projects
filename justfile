# Justfile para SGOA Projects
# Requisitos: just, pnpm, npm, docker
# Instalar just: https://just.systems/man/en/chapter_4.html

set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

# Listar todos los comandos disponibles
default:
    @just --list

# ── SETUP ────────────────────────────────────────────────────────────────────

# Configurar el proyecto por primera vez: copia .env, instala dependencias, levanta la BD y activa hooks
[unix]
setup: _env-unix install db-setup hooks
    @echo ""
    @echo "Setup completo. Edita backend/.env y frontend/.env con tus valores reales antes de ejecutar 'just dev'."

[windows]
setup: _env-windows install db-setup hooks
    Write-Host ""
    Write-Host "Setup completo. Edita backend\.env y frontend\.env con tus valores reales antes de ejecutar 'just dev'."

[unix]
[private]
_env-unix:
    @[ -f backend/.env ] || (cp backend/.env.example backend/.env && echo "  -> backend/.env creado desde .env.example")
    @[ -f frontend/.env ] || (cp frontend/.env.template frontend/.env && echo "  -> frontend/.env creado desde .env.template")

[windows]
[private]
_env-windows:
    if (-not (Test-Path "backend\.env")) { Copy-Item "backend\.env.example" "backend\.env"; Write-Host "  -> backend\.env creado desde .env.example" }
    if (-not (Test-Path "frontend\.env")) { Copy-Item "frontend\.env.template" "frontend\.env"; Write-Host "  -> frontend\.env creado desde .env.template" }

# ── INSTALL ──────────────────────────────────────────────────────────────────

# Instalar todas las dependencias del proyecto (backend y frontend)
install: install-backend install-frontend

# Instalar dependencias del backend (NestJS) y regenerar el cliente de Prisma
[working-directory: 'backend']
install-backend:
    pnpm install
    pnpm run gen

# Instalar dependencias del frontend (React + Vite)
[working-directory: 'frontend']
install-frontend:
    npm install

# ── BASE DE DATOS ────────────────────────────────────────────────────────────

# Levantar la base de datos y aplicar las migraciones de Prisma
[unix]
[working-directory: 'backend']
db-setup: db-up
    @echo "Esperando que PostgreSQL este listo..."
    sleep 5
    npx prisma migrate deploy

[windows]
[working-directory: 'backend']
db-setup: db-up
    Write-Host "Esperando que PostgreSQL este listo..."
    Start-Sleep 5
    npx prisma migrate deploy

# Levantar los contenedores de Docker (PostgreSQL + pgAdmin)
[working-directory: 'backend']
db-up:
    docker compose up -d postgres pgadmin

# Detener los contenedores de Docker
[working-directory: 'backend']
db-down:
    docker compose down

# ── GIT HOOKS ────────────────────────────────────────────────────────────────

# Instalar los git hooks con Lefthook
hooks:
    pnpm dlx lefthook install

# ── DESARROLLO ───────────────────────────────────────────────────────────────

# Iniciar backend y frontend en modo desarrollo (la BD debe estar corriendo)
[unix]
dev: db-up
    #!/usr/bin/env bash
    echo "Iniciando backend (NestJS) en segundo plano..."
    (cd backend && pnpm dev) &
    BACKEND_PID=$!
    trap "echo 'Deteniendo servicios...'; kill $BACKEND_PID 2>/dev/null" EXIT INT TERM
    echo "Iniciando frontend (Vite)..."
    cd frontend && npm run dev

[windows]
dev: db-up
    $path = (Get-Location).Path; Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Iniciando backend (NestJS)...'; Set-Location '$path\backend'; pnpm dev"
    Write-Host "Iniciando frontend (Vite)..."
    Set-Location frontend; npm run dev
