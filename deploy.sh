#!/bin/bash
# deploy.sh — Run on the Hostinger VPS to deploy/update Morgan 3D Prints
# First deploy: run this entire script
# Updates: run from the "pull latest changes" section onward

set -e

APP_DIR="/var/www/morgan3dprints"
NODE_VERSION="20"

echo "=== Morgan 3D Prints Deploy ==="

# ─── First-time setup (comment out after first run) ──────────────────────────

# Install Node.js via NVM (if not installed)
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# source ~/.bashrc
# nvm install $NODE_VERSION && nvm use $NODE_VERSION && nvm alias default $NODE_VERSION

# Install PM2 globally
# npm install -g pm2

# Install Certbot for SSL
# sudo apt install certbot python3-certbot-nginx -y

# Create app directory
# sudo mkdir -p $APP_DIR
# sudo chown $USER:$USER $APP_DIR

# Clone repo (replace with your actual repo URL)
# git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git $APP_DIR

# ─── Deploy / Update ─────────────────────────────────────────────────────────

cd $APP_DIR

echo "→ Pulling latest changes..."
git pull origin main

echo "→ Installing dependencies..."
npm ci --omit=dev

echo "→ Generating Prisma client..."
npx prisma generate

echo "→ Running database migrations..."
npx prisma migrate deploy

echo "→ Building Next.js..."
npm run build

echo "→ Restarting app with PM2..."
pm2 startOrRestart ecosystem.config.cjs --env production

echo "→ Saving PM2 process list..."
pm2 save

echo ""
echo "✅ Deploy complete! App running at http://localhost:3000"
echo ""
echo "To check status: pm2 status"
echo "To view logs:    pm2 logs morgan3dprints"
echo ""

# ─── First-time SSL setup (run once after DNS points to server) ──────────────
# sudo certbot --nginx -d morgan3dokc.com -d www.morgan3dokc.com
# Then update nginx.conf to uncomment SSL certificate lines and the HTTP→HTTPS redirect
# sudo nginx -t && sudo systemctl reload nginx
