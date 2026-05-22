import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/auth";
import { KitSettingsForm } from "@/components/KitSettingsForm";
import { Button } from "@/components/ui/button";

export default async function KitSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Kit Integration
          </p>
          <h1 className="text-4xl">Kit Subscriber Sync Settings</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Connect Kit, choose default export targets, and map synced mailbox
            folders to Kit tags before uploading contacts.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/settings">Back To Email Settings</Link>
        </Button>
      </div>

      <KitSettingsForm />
    </main>
  );
}
