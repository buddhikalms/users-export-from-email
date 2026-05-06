# Outlook Sync Exporter

Next.js 15 App Router application for securely managing multiple Outlook IMAP accounts, extracting unique contacts from selected folders, and exporting folder-wise results to Excel.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- IMAP via `imapflow`
- Excel export via `exceljs`
- Validation via `zod`
- Authentication via `next-auth`
- Database via Prisma + SQLite

## Features

- Email/password authentication with hashed passwords
- First registered user becomes `ADMIN`
- Database-backed Outlook account storage per user
- Encrypted Outlook passwords before database persistence
- Manual one-time IMAP connection or saved-account sync
- Folder-wise contact extraction and Excel export
- Last-seen date filtering before export
- Admin overview page for users and stored accounts

## Install

```bash
npm install
```

If you want the direct dependency command instead of relying on `package.json`:

```bash
npm install next react react-dom next-auth prisma @prisma/client bcryptjs imapflow exceljs zod lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-checkbox @radix-ui/react-slot @radix-ui/react-tabs
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer
```

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

Required keys:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ACCOUNT_ENCRYPTION_KEY`
- `IMAP_CONNECT_TIMEOUT_MS`
- `IMAP_SOCKET_TIMEOUT_MS`

## Database Setup

Generate the Prisma client:

```bash
npm run db:generate
```

Initialize the local SQLite database:

```bash
npm run db:init
```

Optional Prisma schema push:

```bash
npm run db:push
```

Note:
On this machine, `prisma db push` may fail if Prisma cannot start its schema engine. The app includes `npm run db:init` as a reliable local fallback that creates the required SQLite tables directly.

## Local Run

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Run:

```bash
npm run db:generate
npm run db:init
npm run dev
```

4. Open `http://localhost:3000`.
5. Register a user account.
6. Save one or more Outlook IMAP accounts in `/settings`.
7. Choose a saved account or use a one-time manual connection.
8. Select folders, sync, filter by last seen date if needed, and export the workbook.

## Default Outlook IMAP Settings

- Host: `outlook.office365.com`
- Port: `993`
- Security: `SSL/TLS`

## Security Notes

- The app uses IMAP only and does not depend on Microsoft Graph API.
- Passwords for manual connections are used server-side for IMAP calls and are not logged.
- Saved Outlook account passwords are encrypted before database storage.
- User login passwords are hashed with `bcryptjs`.
- Sync results remain in browser session storage for the export flow.
- The current implementation is suited to local or controlled deployments; production deployments should rotate secrets, use stronger operational monitoring, and move from SQLite to a managed database.
