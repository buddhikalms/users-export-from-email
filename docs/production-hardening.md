# Omazync Production Hardening

## Load tests

Install k6 on the runner, then point tests at staging or production:

```bash
BASE_URL=https://example.com SESSION_COOKIE='next-auth.session-token=...' npm run load:smoke
BASE_URL=https://example.com SESSION_COOKIE='next-auth.session-token=...' npm run load:dashboard
BASE_URL=https://example.com SESSION_COOKIE='next-auth.session-token=...' npm run load:export
BASE_URL=https://example.com SESSION_COOKIE='next-auth.session-token=...' SAVED_ACCOUNT_ID=... IMAP_FOLDERS=INBOX npm run load:sync
```

Use a staging mailbox and staging Kit account for sync tests. Do not load-test provider APIs with real customer credentials unless the provider account has explicit capacity.

## Deploy

```bash
npm ci
npm run db:generate
npx prisma migrate deploy
npm run build
pm2 startOrReload ecosystem.config.js --env production
pm2 save
curl -f https://example.com/api/health
```

## Redis and background sync worker

Install Redis on Debian:

```bash
sudo apt update
sudo apt install -y redis-server
sudo systemctl enable --now redis-server
redis-cli ping
```

Set `REDIS_URL=redis://127.0.0.1:6379` in the production environment. Background syncs use BullMQ; PM2 starts both `next-app` and `email-sync-worker` from `ecosystem.config.js`.

For local Windows development without Docker, use one of these:

```powershell
# Option 1: WSL Ubuntu
wsl --install -d Ubuntu
# Then inside Ubuntu:
sudo apt update
sudo apt install -y redis-server
sudo service redis-server start
redis-cli ping
```

```powershell
# Option 2: remote Redis provider
# Put the provider URL in .env:
REDIS_URL="redis://default:password@host:6379"
```

Check whether the app can reach local Redis:

```bash
npm run redis:check
```

Useful worker settings:

```bash
EMAIL_SYNC_WORKER_CONCURRENCY=2
EMAIL_SYNC_IMAP_BATCH_SIZE=100
EMAIL_SYNC_JOB_ATTEMPTS=2
EMAIL_SYNC_JOB_TIMEOUT_MS=900000
EMAIL_SYNC_MAX_STALLED_COUNT=1
```

## Debian, PM2, and Nginx

Copy `docs/nginx-omazync.conf` to `/etc/nginx/sites-available/omazync`, replace `example.com`, enable it, and validate:

```bash
sudo ln -s /etc/nginx/sites-available/omazync /etc/nginx/sites-enabled/omazync
sudo nginx -t
sudo systemctl reload nginx
```

Use HTTPS before enabling HSTS in public production. If Brotli is installed for Nginx, enable `brotli on;` and include `text/css application/javascript application/json image/svg+xml`.

## Security checklist

- Keep `NEXTAUTH_SECRET`, `DATABASE_URL`, `ACCOUNT_ENCRYPTION_KEY`, PayPal, Google, and provider secrets only in server environment files.
- Rotate credentials that were ever committed or pasted into logs.
- Require HTTPS at Nginx and set secure cookies in production.
- Keep `/api/health` unauthenticated but non-sensitive.
- Review PM2 and Nginx logs for redacted structured API errors only.

## Performance checklist

- Run `npm run build` and inspect route sizes after marketing-page changes.
- Keep contact list pages bounded and use indexed filters.
- Run k6 smoke before each deploy, dashboard load before traffic campaigns, and export/sync tests against staging.
- Watch MySQL slow query logs for contact search and dashboard group queries.
