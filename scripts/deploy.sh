#!/bin/bash
# =============================================================================
# VERIQ - Deploy Script
# =============================================================================
# Pulls latest code, builds Docker images, and starts services.
# Works on any server with Docker + the .env file configured.
#
# Usage: bash scripts/deploy.sh [--build] [--up] [--down] [--restart] [--logs]
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

ACTION="${1:-up}"

case "$ACTION" in
  build)
    echo "Building Docker images..."
    docker compose build --pull
    ;;
  up)
    echo "Starting services..."
    docker compose up -d
    echo "Services started. Check status: docker compose ps"
    ;;
  down)
    echo "Stopping services..."
    docker compose down
    ;;
  restart)
    echo "Restarting services..."
    docker compose down
    docker compose up -d
    echo "Services restarted."
    ;;
  logs)
    echo "Showing logs (Ctrl+C to exit)..."
    docker compose logs -f
    ;;
  status)
    echo "Service status:"
    docker compose ps
    echo ""
    echo "Resource usage:"
    docker stats --no-stream
    ;;
  update)
    echo "Pulling latest code..."
    git pull origin main
    echo "Rebuilding and restarting..."
    docker compose down
    docker compose build --pull
    docker compose up -d
    echo "Update complete."
    ;;
  migrate)
    echo "Running database migrations..."
    docker compose exec backend npx prisma migrate deploy
    echo "Migrations complete."
    ;;
  *)
    echo "Usage: bash scripts/deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build     Build Docker images"
    echo "  up        Start all services"
    echo "  down      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      View service logs"
    echo "  status    Show service status"
    echo "  update    Git pull + rebuild + restart"
    echo "  migrate   Run database migrations"
    ;;
esac
