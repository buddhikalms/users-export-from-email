# Email Contact Exporter

Next.js 16 App Router application for securely managing multiple email IMAP accounts, extracting unique contacts from selected folders, and exporting folder-wise results to Excel.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- IMAP via `imapflow`
- Excel export via `exceljs`
- Validation via `zod`
- Authentication via `next-auth`
- Database via Prisma + MySQL

## Features

- Email/password authentication with hashed passwords
- First registered user becomes `ADMIN`
- Database-backed IMAP account storage per user
- Encrypted email account passwords before database persistence
- Manual one-time IMAP connection or saved-account sync
- Folder-wise contact extraction and Excel export
- Google Sheets export with one tab per synced folder
- Last-seen date filtering before export
- Direct Kit subscriber sync with tags, forms, folder mappings, and encrypted API key storage
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
- `KIT_API_KEY` (optional fallback/documentation placeholder; saved user keys are stored encrypted)
- `KIT_API_SECRET` (reserved for Kit API workflows that require a secret)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` (required for Google Sheets export)
- `GOOGLE_PRIVATE_KEY` or `GOOGLE_PRIVATE_KEY_BASE64` (required for Google Sheets export)

## Database Setup

Generate the Prisma client:

```bash
npm run db:generate
```

Start the local MySQL database:

```bash
npm run db:start
```

Initialize the Prisma schema in MySQL:

```bash
npm run db:init
```

Optional Prisma schema push:

```bash
npm run db:push
```

`npm run db:init` is a small wrapper around `prisma db push` that validates `DATABASE_URL` and applies the schema to MySQL.

## Local Run

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Run:

```bash
npm run db:start
npm run db:generate
npm run db:init
npm run dev
```

4. Open `http://localhost:3000`.
5. Register a user account.
6. Save one or more IMAP accounts in `/settings`.
7. Choose a saved account or use a one-time manual connection.
8. Select folders, sync, filter by last seen date if needed, and export the workbook.
9. Optional: open `/settings/kit`, connect one or more Kit accounts, then use `Export Contacts to Kit` from `/export`.
10. Optional: configure Google Sheets credentials, then use `Google Sheet` from `/export`.

## Google Sheets Export

1. Create a Google Cloud service account.
2. Enable the Google Sheets API and Google Drive API for that project.
3. Add `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` to `.env`.
4. Restart the app.
5. Open `/export` after a mailbox sync and click `Google Sheet`.

The export creates a spreadsheet owned by the service account, writes an `All Contacts` tab plus one tab per synced folder, and shares editor access with the signed-in user's email address.

## Default IMAP Settings

Outlook / Microsoft 365:
- Host: `outlook.office365.com`
- Port: `993`
- Security: `SSL/TLS`

Zoho Mail:
- Host: `imap.zoho.com`
- Port: `993`
- Security: `SSL/TLS`

Zoho paid organization/domain accounts:
- Host: `imappro.zoho.com`
- Port: `993`
- Security: `SSL/TLS`

## Security Notes

- The app uses IMAP only and does not depend on Microsoft Graph API.
- Passwords for manual connections are used server-side for IMAP calls and are not logged.
- Saved email account passwords are encrypted before database storage.
- Saved Kit API keys are encrypted before database storage and are never exposed to the browser after saving.
- User login passwords are hashed with `bcryptjs`.
- Sync results remain in browser session storage for the export flow.
- The current implementation is suited to local or controlled deployments; production deployments should rotate secrets, use stronger operational monitoring, and store MySQL credentials securely.

## Kit Sync

1. Run `npm install` to install dependencies, including `axios`.
2. Run `npm run db:generate`.
3. Run `npm run db:push` to add `KitSettings` and `KitFolderTagMap`.
4. Start the app and open `/settings/kit`.
5. Add one or more Kit accounts. Paste a Kit V4 API key, or choose legacy V3 and paste both the V3 API key and API secret.
6. Set a default Kit account if desired.
7. Open `/export`, choose the Kit account, wait for that account's tags/forms to load, choose a tag or form, and click `Export to Selected Kit Account`.

The Kit sync cleans and normalizes emails, skips common system senders, dedupes contacts, upserts subscribers in Kit, applies selected tags, optionally adds subscribers to a selected form, retries failed uploads once, and returns a summary with upload logs.


## Keywords - search on email exporter 
Subject wise filter and keywords filter
