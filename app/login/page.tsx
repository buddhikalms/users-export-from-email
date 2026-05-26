import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/settings");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            BuddhiEmailExtractor
          </p>
          <h1 className="text-4xl">Sign in to your lead extraction workspace.</h1>
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
    </main>
  );
}
