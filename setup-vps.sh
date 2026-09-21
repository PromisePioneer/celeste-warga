#!/bin/bash

# ===========================================
# Celeste Warga - VPS Setup Script
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/var/www/celeste-warga"
DB_NAME="celeste_warga"
DB_USER="celeste"
DB_PASS="celeste123"
DOMAIN="celeste-cantik.my.id"
API_DOMAIN="api.celeste-cantik.my.id"

echo_step() {
    echo -e "\n${GREEN}==>${NC} $1"
}

echo_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo_error "Please run as root: sudo $0"
    exit 1
fi

# ===========================================
# 1. System Update & Dependencies
# ===========================================
echo_step "Updating system..."
apt update && apt upgrade -y

echo_step "Installing dependencies..."
apt install -y curl git unzip nginx mysql-server php8.2-fpm php8.2-cli php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd nodejs npm

# ===========================================
# 2. MySQL Setup
# ===========================================
echo_step "Setting up MySQL..."

# Start MySQL
service mysql start

# Create database and user
mysql <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}MySQL database created: $DB_NAME${NC}"

# ===========================================
# 3. Clone & Setup Project
# ===========================================
echo_step "Cloning repository..."

cd /var/www
if [ -d "celeste-warga" ]; then
    echo "Project exists, pulling latest..."
    cd celeste-warga
    git pull origin main
else
    git clone https://github.com/PromisePioneer/celeste-warga.git
    cd celeste-warga
fi

# ===========================================
# 4. Backend Setup
# ===========================================
echo_step "Setting up Backend..."

cd $PROJECT_DIR/backend

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure .env
cat > .env <<EOF
APP_NAME="Celeste Warga"
APP_ENV=production
APP_KEY=$(php artisan key:generate --show)
APP_DEBUG=false
APP_URL=https://$API_DOMAIN

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=$DB_NAME
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASS

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true

CACHE_STORE=file
QUEUE_CONNECTION=sync

FILESYSTEM_DISK=local

MAIL_MAILER=log

ADMIN_EMAIL=admin@celeste.local
ADMIN_PASSWORD=password

FRONTEND_URL=https://$DOMAIN
EOF

# Run migrations & seed
php artisan migrate:fresh --seed --force

# Create storage link
php artisan storage:link

# Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# ===========================================
# 5. Frontend Setup
# ===========================================
echo_step "Setting up Frontend..."

cd $PROJECT_DIR/frontend

# Install Node dependencies
npm install

# Configure environment
cat > .env.local <<EOF
VITE_API_URL=https://$API_DOMAIN/api
EOF

# Build for production
npm run build

# Set permissions
chown -R www-data:www-data dist

# ===========================================
# 6. Nginx Configuration
# ===========================================
echo_step "Configuring Nginx..."

# Backend (API)
cat > /etc/nginx/sites-available/celeste-api <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $API_DOMAIN;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $API_DOMAIN;

    root $PROJECT_DIR/backend/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/$API_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_DOMAIN/privkey.pem;

    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Frontend (SPA)
cat > /etc/nginx/sites-available/celeste-frontend <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    root $PROJECT_DIR/frontend/dist;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Enable sites
ln -sf /etc/nginx/sites-available/celeste-api /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/celeste-frontend /etc/nginx/sites-enabled/

# Disable default
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

# ===========================================
# 7. SSL Certificate (Let's Encrypt)
# ===========================================
echo_step "Getting SSL certificates..."

# Install certbot
apt install -y certbot python3-certbot-nginx

# Get certificates
certbot --nginx -d $DOMAIN -d $API_DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || true

# Auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

# ===========================================
# 8. PM2 for Backend
# ===========================================
echo_step "Setting up PM2 for backend..."

# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > $PROJECT_DIR/backend/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'celeste-api',
    script: 'artisan',
    args: 'serve --host=127.0.0.1 --port=8000',
    interpreter: 'php',
    cwd: '$PROJECT_DIR/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      APP_ENV: 'production'
    }
  }]
};
EOF

# Start with PM2
cd $PROJECT_DIR/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# ===========================================
# 9. Firewall
# ===========================================
echo_step "Configuring firewall..."

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "\n${GREEN}===========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo -e "Frontend: ${YELLOW}https://$DOMAIN${NC}"
echo -e "API:      ${YELLOW}https://$API_DOMAIN${NC}"
echo ""
echo -e "Admin Login:"
echo -e "  Email:    ${YELLOW}admin@celeste.local${NC}"
echo -e "  Password:  ${YELLOW}password${NC}"
echo ""
