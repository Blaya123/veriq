#!/bin/bash
# =============================================================================
# VERIQ - Nginx Config Generator
# =============================================================================
# Generates nginx.conf from .env variables.
# Run this when you change your domain.
#
# Usage: bash scripts/generate-nginx-config.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi

# Default values
DOMAIN="${FRONTEND_URL:-https://veriq.app}"
DOMAIN_CLEAN="${DOMAIN#https://}"
DOMAIN_CLEAN="${DOMAIN_CLEAN#http://}"
DOMAIN_CLEAN="${DOMAIN_CLEAN%%/*}"

BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

cat > "$PROJECT_DIR/nginx.conf" << NGINX
worker_processes auto;
pid /var/run/nginx.pid;

events {
  worker_connections 2048;
  multi_accept on;
  use epoll;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  server_tokens off;

  client_body_buffer_size 10K;
  client_header_buffer_size 1k;
  client_max_body_size 8m;

  client_body_timeout 12;
  client_header_timeout 12;
  send_timeout 10;

  limit_req_zone \$binary_remote_addr zone=api:10m rate=30r/s;
  limit_req_zone \$binary_remote_addr zone=general:10m rate=50r/s;
  limit_req_status 429;

  # SSL (enable for production)
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;
  ssl_session_tickets off;
  ssl_stapling on;
  ssl_stapling_verify on;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

  upstream backend_upstream {
    least_conn;
    server backend:$BACKEND_PORT max_fails=3 fail_timeout=30s;
    keepalive 64;
  }

  upstream frontend_upstream {
    server frontend:$FRONTEND_PORT max_fails=3 fail_timeout=30s;
    keepalive 16;
  }

  # HTTP → HTTPS redirect
  server {
    listen 80;
    server_name $DOMAIN_CLEAN www.$DOMAIN_CLEAN;
    return 301 https://\$server_name\$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name $DOMAIN_CLEAN www.$DOMAIN_CLEAN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN_CLEAN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_CLEAN/privkey.pem;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;

    location /api/ {
      limit_req zone=api burst=20 nodelay;
      proxy_pass http://backend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_read_timeout 90s;
      proxy_send_timeout 90s;
      proxy_connect_timeout 30s;
      proxy_buffering off;
      proxy_cache off;
    }

    location /graphql {
      limit_req zone=api burst=20 nodelay;
      proxy_pass http://backend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_read_timeout 90s;
    }

    location /ws {
      proxy_pass http://backend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_read_timeout 86400s;
    }

    location /socket.io/ {
      proxy_pass http://backend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_read_timeout 86400s;
    }

    location /health {
      access_log off;
      proxy_pass http://backend_upstream/health;
      proxy_http_version 1.1;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /_next/static {
      proxy_pass http://frontend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      expires 365d;
      add_header Cache-Control "public, immutable";
    }

    location /static {
      proxy_pass http://frontend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      expires 30d;
      add_header Cache-Control "public, immutable";
    }

    location = /favicon.ico {
      proxy_pass http://frontend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Host \$host;
      access_log off;
      expires 30d;
    }

    location = /robots.txt {
      proxy_pass http://frontend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Host \$host;
      access_log off;
    }

    location / {
      limit_req zone=general burst=50 nodelay;
      proxy_pass http://frontend_upstream;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_read_timeout 60s;
    }
  }
}
NGINX

echo "nginx.conf generated for domain: $DOMAIN_CLEAN"
echo "To apply: copy nginx.conf to your server's nginx directory and reload"
