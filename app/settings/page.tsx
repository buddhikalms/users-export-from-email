import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";
import { ConnectionForm } from "@/components/ConnectionForm";
import { IgnoredEmailsForm } from "@/components/IgnoredEmailsForm";
import { BillingManagement } from "@/components/settings/BillingManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const subscription = session?.user?.id
    ? await db.subscription.findUnique({
        where: { userId: session.user.id },
        select: {
          plan: true,
          interval: true,
          status: true,
          paypalSubscriptionId: true,
          currentPeriodEnd: true,
        },
      })
    : null;

  return (
    <main className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Workspace
          </p>
          <h1 className="text-4xl">Saved Email Accounts & Connection Settings</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Add one-time IMAP settings or move durable credentials into the zero-knowledge
            Security Vault. Vault secrets are encrypted in the browser before they reach
            the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href={"/settings/security-vault" as "/settings"}>Security Vault</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={"/settings/kit" as "/settings"}>Kit Settings</Link>
          </Button>
          <Badge>
            Signed in as {session?.user?.name} ({session?.user?.role})
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        <BillingManagement subscription={subscription} />
        <IgnoredEmailsForm />
        <ConnectionForm />
      </div>
    </main>
  );
}
