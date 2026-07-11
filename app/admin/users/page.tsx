import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AdminTable, type AdminTableRow } from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

const billingPlans = ["FREE", "STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"] as const;
const billingIntervals = ["MONTHLY", "YEARLY", "CUSTOM"] as const;
const subscriptionStatuses = [
  "FREE",
  "APPROVAL_PENDING",
  "ACTIVE",
  "SUSPENDED",
  "CANCELLED",
  "EXPIRED",
] as const;
const userRoles = ["USER", "ADMIN"] as const;

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

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

async function assertAdminUser() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized.");
  }
}

async function updateUserAccess(formData: FormData) {
  "use server";

  await assertAdminUser();

  const userId = String(formData.get("userId") ?? "");
  const plan = String(formData.get("plan") ?? "FREE").toUpperCase();
  const status = String(formData.get("status") ?? "FREE").toUpperCase();
  const interval = String(formData.get("interval") ?? "MONTHLY").toUpperCase();
  const currentPeriodEndValue = String(formData.get("currentPeriodEnd") ?? "");

  if (!userId || !billingPlans.includes(plan as (typeof billingPlans)[number])) {
    throw new Error("Invalid plan update.");
  }
  if (!subscriptionStatuses.includes(status as (typeof subscriptionStatuses)[number])) {
    throw new Error("Invalid subscription status.");
  }
  if (!billingIntervals.includes(interval as (typeof billingIntervals)[number])) {
    throw new Error("Invalid billing interval.");
  }

  const freePlan = plan === "FREE" || status === "FREE";
  const currentPeriodEnd = freePlan || !currentPeriodEndValue
    ? null
    : new Date(`${currentPeriodEndValue}T23:59:59.000Z`);

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: freePlan ? "FREE" : plan as (typeof billingPlans)[number],
      status: freePlan ? "FREE" : status as (typeof subscriptionStatuses)[number],
      interval: freePlan ? "MONTHLY" : interval as (typeof billingIntervals)[number],
      provider: "admin",
      currentPeriodEnd,
      lastPaymentAt: status === "ACTIVE" && !freePlan ? new Date() : null,
    },
    update: {
      plan: freePlan ? "FREE" : plan as (typeof billingPlans)[number],
      status: freePlan ? "FREE" : status as (typeof subscriptionStatuses)[number],
      interval: freePlan ? "MONTHLY" : interval as (typeof billingIntervals)[number],
      currentPeriodEnd,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

async function updateUserRole(formData: FormData) {
  "use server";

  await assertAdminUser();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "USER").toUpperCase();

  if (!userId || !userRoles.includes(role as (typeof userRoles)[number])) {
    throw new Error("Invalid role update.");
  }

  await db.user.update({
    where: { id: userId },
    data: { role: role as (typeof userRoles)[number] },
  });

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      subscription: true,
      _count: {
        select: {
          savedAccounts: true,
          contacts: true,
          integrationAccounts: true,
          automationRules: true,
          syncRuns: true,
          exportRuns: true,
          backgroundJobs: true,
          kitAccounts: true,
        },
      },
    },
  });
  const tableRows: AdminTableRow[] = users.map((user) => ({
    id: user.id,
    search: [
      user.name,
      user.email,
      user.role,
      user.subscription?.plan,
      user.subscription?.status,
    ].filter(Boolean).join(" "),
    cells: {
      user: `${user.name}\n${user.email}`,
      role: user.role,
      plan: formatLabel(user.subscription?.plan ?? "FREE"),
      status: formatLabel(user.subscription?.status ?? "FREE"),
      usage: `${formatNumber(user._count.contacts)} contacts / ${formatNumber(user._count.savedAccounts)} mailboxes`,
      created: formatDate(user.createdAt),
    },
  }));

  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users & Access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Filter users, grant temporary plan access, and update admin roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editable Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((user) => {
            const subscription = user.subscription;
            const currentPlan = subscription?.plan ?? "FREE";
            const currentStatus = subscription?.status ?? "FREE";
            const currentInterval = subscription?.interval ?? "MONTHLY";

            return (
              <article key={user.id} className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4 shadow-sm dark:bg-card/80">
                <div className="grid gap-5 xl:grid-cols-[0.85fr_1.35fr]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{user.role}</Badge>
                        <Badge className="capitalize">{formatLabel(currentPlan)}</Badge>
                        <Badge className="capitalize">{formatLabel(currentStatus)}</Badge>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                      <span>{formatNumber(user._count.contacts)} contacts</span>
                      <span>{formatNumber(user._count.savedAccounts)} mailboxes</span>
                      <span>{formatNumber(user._count.integrationAccounts + user._count.kitAccounts)} integrations</span>
                      <span>{formatNumber(user._count.automationRules)} rules</span>
                      <span>{formatNumber(user._count.syncRuns)} syncs</span>
                      <span>{formatNumber(user._count.exportRuns)} exports</span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Access until {formatDate(subscription?.currentPeriodEnd)}
                    </p>
                  </div>
                  <div className="grid gap-3 rounded-2xl border border-border/70 bg-secondary/35 p-3">
                    <form action={updateUserAccess} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
                      <input name="userId" type="hidden" value={user.id} />
                      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                        Plan
                        <select className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground" defaultValue={currentPlan} name="plan">
                          {billingPlans.map((plan) => <option key={plan} value={plan}>{formatLabel(plan)}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                        Status
                        <select className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground" defaultValue={currentStatus} name="status">
                          {subscriptionStatuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                        Interval
                        <select className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground" defaultValue={currentInterval} name="interval">
                          {billingIntervals.map((interval) => <option key={interval} value={interval}>{formatLabel(interval)}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                        Access until
                        <input className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground" defaultValue={toDateInputValue(subscription?.currentPeriodEnd)} name="currentPeriodEnd" type="date" />
                      </label>
                      <Button className="h-10" type="submit">Save</Button>
                    </form>
                    <form action={updateUserRole} className="grid gap-3 border-t border-border/70 pt-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <input name="userId" type="hidden" value={user.id} />
                      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                        User role
                        <select className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground" defaultValue={user.role} name="role">
                          {userRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                        </select>
                      </label>
                      <Button className="h-10" type="submit" variant="outline">Update Role</Button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filterable User Table</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: "user", label: "User" },
              { key: "role", label: "Role" },
              { key: "plan", label: "Plan" },
              { key: "status", label: "Status" },
              { key: "usage", label: "Usage" },
              { key: "created", label: "Created" },
            ]}
            emptyMessage="No users match this filter."
            rows={tableRows}
          />
        </CardContent>
      </Card>
    </main>
  );
}
