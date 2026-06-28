# VERIQ - Environment & Deployment Guide

## How to change your domain

**One change propagates everywhere:**

1. Edit `.env.production` (or `.env` for local):
   ```
   FRONTEND_URL=https://your-new-domain.com
   BACKEND_URL=https://your-new-domain.com
   CORS_ORIGIN=https://your-new-domain.com
   ```
2. Run: `bash scripts/generate-nginx-config.sh`
3. Run: `bash scripts/deploy.sh restart`
4. Update OAuth callback URLs in Google & GitHub to:
   - `https://your-new-domain.com/api/auth/google/callback`
   - `https://your-new-domain.com/api/auth/github/callback`

That's it. No code changes needed.

## How to change your server

1. Set up a new server (any provider):
   ```bash
   bash scripts/setup-server.sh
   ```
2. Copy the project to the new server:
   ```bash
   git clone <your-repo-url> veriq
   cd veriq
   ```
3. Copy your `.env` with the new server's domain/credentials
4. Deploy:
   ```bash
   bash scripts/deploy.sh up
   ```
5. Update DNS to point your domain to the new server's IP

## How to scale (split into microservices)

When one server isn't enough:

1. **Add a second server** (Oracle Free Tier gives you 6)
2. On Server 2, run only specific services:
   ```bash
   docker compose up -d postgres redis  # Database server
   ```
3. On Server 1, update `.env` to point to Server 2's IP:
   ```
   DATABASE_URL=postgresql://veriq:veriq123@server2-ip:5432/veriq
   REDIS_URL=redis://server2-ip:6379
   ```
4. Restart: `bash scripts/deploy.sh restart`

## CI/CD Pipeline

The project includes GitHub Actions (`./github/workflows/deploy.yml`).

### Setup:
1. Push this repo to GitHub
2. Add these secrets in Settings → Secrets:
   - `DEPLOY_HOST` — your server IP
   - `DEPLOY_USER` — SSH username (e.g., `ubuntu` or `root`)
   - `DEPLOY_SSH_KEY` — your SSH private key
3. Push to `main` → auto-deploys

## Architecture Overview

```
                          ┌──────────────┐
                          │   Your DNS   │
                          │  (DuckDNS /  │
                          │   Domain)    │
                          └──────┬───────┘
                                 │
                          ┌──────▼───────┐
                          │   Nginx      │  Port 80/443
                          │  (SSL + Proxy)│
                          └──┬───┬───┬───┘
                             │   │   │
              ┌──────────────┘   │   └──────────────┐
              │                  │                  │
       ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
       │  Frontend   │   │  Backend    │   │  WebSocket  │
       │  (Next.js)  │   │  (NestJS)   │   │  (Socket.io)│
       └─────────────┘   └──────┬──────┘   └─────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
             ┌──────▼────┐ ┌───▼────┐ ┌────▼─────┐
             │PostgreSQL │ │ Redis  │ │ Background│
             │ (Main DB) │ │(Cache) │ │ Workers   │
             └───────────┘ └────────┘ └──────────┘
```

## File Reference

| File | Purpose |
|------|---------|
| `.env` | Local development environment variables |
| `.env.production` | Production environment template |
| `docker-compose.yml` | Service orchestration |
| `Dockerfile` | Multi-stage Docker build |
| `nginx.conf` | Reverse proxy config (auto-generated) |
| `scripts/setup-server.sh` | First-time server setup |
| `scripts/deploy.sh` | Deploy/restart/manage services |
| `scripts/generate-nginx-config.sh` | Generate nginx.conf from .env |
| `.github/workflows/deploy.yml` | GitHub Actions auto-deploy |
