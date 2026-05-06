import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/settings");
  }

  const [userCount, accountCount, users, accounts] = await Promise.all([
    db.user.count(),
    db.savedEmailAccount.count(),
    db.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        _count: {
          select: {
            savedAccounts: true,
          },
        },
      },
    }),
    db.savedEmailAccount.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: 20,
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Admin
        </p>
        <h1 className="text-4xl">Authentication and account oversight</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Admin users can inspect who has access and how many Outlook accounts are
          currently stored in the database.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Saved Outlook Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{accountCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-border/70 bg-white/80 p-4"
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground">{user.email}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-primary">
                  {user.role} • {user._count.savedAccounts} saved accounts
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Saved Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-2xl border border-border/70 bg-white/80 p-4"
              >
                <div className="font-medium">{account.label}</div>
                <div className="text-muted-foreground">
                  {account.email} • {account.host}:{account.port}
                </div>
                <div className="mt-2 text-xs text-primary">
                  Owner: {account.owner.name} ({account.owner.email})
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
