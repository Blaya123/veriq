#!/bin/bash
# =============================================================================
# VERIQ - Server Setup Script
# =============================================================================
# Run this ONCE on a fresh Ubuntu/Debian server to install dependencies.
# Usage: bash scripts/setup-server.sh
# =============================================================================

set -euo pipefail

echo "========================================"
echo "  VERIQ - Server Setup"
echo "========================================"

# ── Update system ──────────────────────────────────────────────────────────
sudo apt-get update -y
sudo apt-get upgrade -y

# ── Install Docker ─────────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sudo bash
  sudo usermod -aG docker "$USER"
  echo "Docker installed. You may need to log out and back in for group changes."
else
  echo "Docker already installed: $(docker --version)"
fi

# ── Install Docker Compose ─────────────────────────────────────────────────
if ! command -v docker compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo apt-get install -y docker-compose-plugin
else
  echo "Docker Compose already installed: $(docker compose version)"
fi

# ── Install Nginx (standby for SSL setup) ──────────────────────────────────
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  sudo apt-get install -y nginx
  sudo systemctl enable nginx
else
  echo "Nginx already installed: $(nginx -v 2>&1)"
fi

# ── Install Certbot (Let's Encrypt) ────────────────────────────────────────
if ! command -v certbot &> /dev/null; then
  echo "Installing Certbot..."
  sudo apt-get install -y certbot python3-certbot-nginx
else
  echo "Certbot already installed."
fi

# ── Install Node.js 22 ─────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "Node.js already installed: $(node --version)"
fi

# ── Install Git ────────────────────────────────────────────────────────────
if ! command -v git &> /dev/null; then
  echo "Installing Git..."
  sudo apt-get install -y git
else
  echo "Git already installed: $(git --version)"
fi

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Clone your repository: git clone <your-repo-url> veriq"
echo "  2. cd veriq"
echo "  3. Copy .env.production to .env and fill in your values"
echo "  4. Run: bash scripts/deploy.sh"
echo "  5. Set up SSL: sudo certbot --nginx -d your-domain.com"
echo ""
