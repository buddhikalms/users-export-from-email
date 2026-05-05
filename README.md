# Outlook Sync Exporter

Next.js 15 App Router application for connecting to Outlook over IMAP, extracting unique contacts from selected folders, and exporting folder-wise results to Excel.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- IMAP via `imapflow`
- Excel export via `exceljs`
- Validation via `zod`

## Install

```bash
npm install
```

If you want the direct dependency command instead of `package.json` install:

```bash
npm install next react react-dom imapflow exceljs zod lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-checkbox @radix-ui/react-slot @radix-ui/react-tabs
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer
```

## Local Run

1. Copy `.env.example` to `.env` if you want to override IMAP timeout defaults.
2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.
4. Go to `/settings`, enter Outlook IMAP settings, test the connection, select folders, sync, and export the workbook.

## Default Outlook IMAP Settings

- Host: `outlook.office365.com`
- Port: `993`
- Security: `SSL/TLS`

## Notes

- The app uses IMAP only and does not depend on Microsoft Graph API.
- Passwords are handled server-side for IMAP calls and are not logged.
- Credentials remain in browser session storage by default. Persistent local storage is used only when the user explicitly enables password remembering.
- Sync results are stored in browser session storage only so the export page can build the workbook without server persistence.
