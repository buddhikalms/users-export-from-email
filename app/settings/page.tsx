import Link from "next/link";

import { ConnectionForm } from "@/components/ConnectionForm";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Step 1
          </p>
          <h1 className="text-4xl">Connection Settings</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Enter the Outlook incoming mail server details, test the IMAP connection,
            and continue to folder selection once the account validates successfully.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/">Back Home</Link>
        </Button>
      </div>

      <ConnectionForm />
    </main>
  );
}
