import { AdminTable, type AdminTableRow } from "@/components/admin/AdminTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatLabel(value: string | null | undefined) {
  return value ? value.replace(/_/g, " ").toLowerCase() : "none";
}

export default async function AdminIntegrationsPage() {
  const [integrationAccounts, kitAccounts, savedAccounts, vaults] = await Promise.all([
    db.integrationAccount.findMany({
      orderBy: { updatedAt: "desc" },
      take: 150,
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { destinations: true, syncRuns: true, exportRuns: true } },
      },
    }),
    db.kitAccount.findMany({
      orderBy: { updatedAt: "desc" },
      take: 150,
      include: { owner: { select: { name: true, email: true } } },
    }),
    db.savedEmailAccount.findMany({
      orderBy: { updatedAt: "desc" },
      take: 150,
      include: { owner: { select: { name: true, email: true } } },
    }),
    db.encryptedVault.findMany({
      orderBy: { updatedAt: "desc" },
      take: 150,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);
  const integrationRows: AdminTableRow[] = integrationAccounts.map((account) => ({
    id: account.id,
    search: [account.owner.email, account.name, account.platform, account.health].join(" "),
    cells: {
      name: account.name,
      owner: account.owner.email,
      platform: formatLabel(account.platform),
      health: formatLabel(account.health),
      destinations: formatNumber(account._count.destinations),
      activity: `${formatNumber(account._count.syncRuns)} syncs / ${formatNumber(account._count.exportRuns)} exports`,
      updated: formatDate(account.updatedAt),
    },
  }));
  const kitRows: AdminTableRow[] = kitAccounts.map((account) => ({
    id: account.id,
    search: [account.owner.email, account.name, account.apiVersion].join(" "),
    cells: {
      name: account.name,
      owner: account.owner.email,
      version: account.apiVersion,
      default: account.isDefault ? "Yes" : "No",
      updated: formatDate(account.updatedAt),
    },
  }));
  const mailboxRows: AdminTableRow[] = savedAccounts.map((account) => ({
    id: account.id,
    search: [account.owner.email, account.label, account.email, account.host].join(" "),
    cells: {
      label: account.label,
      owner: account.owner.email,
      email: account.email,
      host: `${account.host}:${account.port}`,
      security: account.security,
      default: account.isDefault ? "Yes" : "No",
      updated: formatDate(account.updatedAt),
    },
  }));
  const vaultRows: AdminTableRow[] = vaults.map((vault) => ({
    id: vault.id,
    search: [vault.user.email, vault.name, vault.kdf].join(" "),
    cells: {
      name: vault.name,
      owner: vault.user.email,
      kdf: vault.kdf,
      iterations: formatNumber(vault.iterations),
      updated: formatDate(vault.updatedAt),
    },
  }));

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Integrations & Accounts</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inspect connected platforms, Kit accounts, saved mailboxes, and encrypted vault records.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Marketing Platform Accounts</CardTitle></CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: "name", label: "Name" },
              { key: "owner", label: "Owner" },
              { key: "platform", label: "Platform" },
              { key: "health", label: "Health" },
              { key: "destinations", label: "Destinations" },
              { key: "activity", label: "Activity" },
              { key: "updated", label: "Updated" },
            ]}
            emptyMessage="No platform integrations match this filter."
            rows={integrationRows}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Kit Accounts</CardTitle></CardHeader>
          <CardContent>
            <AdminTable
              columns={[
                { key: "name", label: "Name" },
                { key: "owner", label: "Owner" },
                { key: "version", label: "API Version" },
                { key: "default", label: "Default" },
                { key: "updated", label: "Updated" },
              ]}
              emptyMessage="No Kit accounts match this filter."
              rows={kitRows}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Encrypted Vaults</CardTitle></CardHeader>
          <CardContent>
            <AdminTable
              columns={[
                { key: "name", label: "Name" },
                { key: "owner", label: "Owner" },
                { key: "kdf", label: "KDF" },
                { key: "iterations", label: "Iterations" },
                { key: "updated", label: "Updated" },
              ]}
              emptyMessage="No vaults match this filter."
              rows={vaultRows}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Saved Mailboxes</CardTitle></CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: "label", label: "Label" },
              { key: "owner", label: "Owner" },
              { key: "email", label: "Mailbox" },
              { key: "host", label: "Host" },
              { key: "security", label: "Security" },
              { key: "default", label: "Default" },
              { key: "updated", label: "Updated" },
            ]}
            emptyMessage="No saved mailboxes match this filter."
            rows={mailboxRows}
          />
        </CardContent>
      </Card>
    </main>
  );
}
