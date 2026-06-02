import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AuthPageHeader } from "@/components/AuthPageHeader";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/settings");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_55%,#ffffff_100%)] px-6 py-8 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)] lg:px-10">
      <div className="mx-auto max-w-5xl">
        <AuthPageHeader />
        <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            EmailExporter
          </p>
          <h1 className="text-4xl text-slate-950 dark:text-white">Sign in to your lead extraction workspace.</h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Access mailbox syncs, CRM contacts, export filters, integration accounts,
            automation rules, and role-ready SaaS controls from one workspace.
          </p>
          <p className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link className="font-medium text-primary hover:text-primary/80" href="/register">
              Register here
            </Link>
          </p>
        </section>

        <LoginForm />
        </div>
      </div>
    </main>
  );
}
