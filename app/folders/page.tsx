"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FolderSelector } from "@/components/FolderSelector";
import { Button } from "@/components/ui/button";
import { getSelectedFolders, getStoredConnectionSettings } from "@/lib/storage";
import type { ConnectionSettings } from "@/types/email";

export default function FoldersPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ConnectionSettings | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedSettings = getStoredConnectionSettings();
    if (!storedSettings) {
      router.replace("/settings");
      return;
    }

    setSettings(storedSettings);
    setSelection(getSelectedFolders());
    setReady(true);
  }, [router]);

  if (!ready || !settings) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <div className="rounded-[1.75rem] border border-dashed border-border bg-white/70 p-8 text-sm text-muted-foreground">
          Preparing your folder selection workspace...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Step 2
          </p>
          <h1 className="text-4xl">Folder Selection</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Load the Outlook mailbox folder list, choose the folders you want to scan,
            and continue to contact extraction.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/settings">Edit Connection</Link>
        </Button>
      </div>

      <FolderSelector initialSelection={selection} settings={settings} />
    </main>
  );
}
