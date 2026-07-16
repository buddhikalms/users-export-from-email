# OMAZYNC Enterprise Admin Operations

## Installation

```bash
npm install
npm run services:start
npm run db:generate
npm run db:push
```

For migration-based environments:

```bash
npx prisma migrate deploy
npm run build
pm2 start ecosystem.config.js
pm2 save
```

## Redis

Local Redis is defined in `docker-compose.yml`.

```bash
npm run redis:start
npm run redis:check
```

Production should set `REDIS_URL=redis://host:6379` for the web process and all PM2 worker processes.

## Admin Roles

The app accepts the existing `User.role = ADMIN` as a platform admin and adds scoped admin roles in `AdminRole`:

- `SUPER_ADMIN`: full access
- `ADMIN`: full access
- `OPERATIONS_ADMIN`: queues, workers, sync jobs, health
- `BILLING_ADMIN`: packages, subscriptions, licences
- `SUPPORT_ADMIN`: users, workspaces, sync history, logs
- `SECURITY_ADMIN`: security logs, sessions, account controls
- `READ_ONLY_ADMIN`: view-only access

Create the first admin through Prisma Studio or a trusted seed script:

```bash
npx prisma studio
```

Set the bootstrap user `User.role` to `ADMIN`, then add scoped `AdminRole` records as needed.

## Queue Management

Queues are declared in `lib/queues/queue-names.ts`. Admin controls are available at `/admin/queues` and settings at `/admin/queues/settings`.

Safe queue actions:

- Pause queue
- Resume queue
- Retry failed jobs
- Clean old completed and failed jobs

Dangerous actions require browser confirmation and are audited in `AdminAuditLog`.

Use `QueueConfiguration` to control:

- Queue enabled state
- Worker concurrency
- Jobs per minute
- Jobs per tenant/user
- Timeout
- Retry attempts and backoff
- Priority weight
- Heartbeat interval
- Retention windows

Tenant fairness should be enforced by enqueue code using workspace/user identifiers and package priority before jobs enter BullMQ.

## PM2 Deployment

`ecosystem.config.js` defines:

- `omazync-web`
- `omazync-email-worker`
- `omazync-contact-worker`
- `omazync-export-worker`
- `omazync-marketing-worker`
- `omazync-scheduler`

Deploy:

```bash
npm ci
npx prisma migrate deploy
npm run build
pm2 start ecosystem.config.js --update-env
pm2 logs
```

## Security Checklist

- Keep admin APIs behind `requireAdminApi`.
- Never return encrypted mailbox passwords, OAuth tokens, API keys, or raw credentials.
- Use `writeAdminAuditLog` for every admin mutation.
- Validate mutating inputs with Zod.
- Keep PM2/browser operations allowlisted; never execute arbitrary shell commands from admin routes.
- Use server-side pagination for users, jobs, contacts, and logs.
- Confirm destructive queue actions.
- Review `/admin/security` and `/admin/logs/audit` after incidents.
