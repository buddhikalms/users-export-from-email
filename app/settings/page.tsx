import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { ConnectionForm } from "@/components/ConnectionForm";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Workspace
          </p>
          <h1 className="text-4xl">Saved Outlook Accounts & Connection Settings</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Add multiple Outlook IMAP accounts to the database, keep passwords
            encrypted server-side, and choose any saved account or one-time manual
            connection when you want to sync folders.
          </p>
        </div>

        <Badge>
          Signed in as {session?.user?.name} ({session?.user?.role})
        </Badge>
      </div>

      <ConnectionForm />
    </main>
  );
}
