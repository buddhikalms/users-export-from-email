import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/settings");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Secure Access
          </p>
          <h1 className="text-4xl">Create your authenticated email sync workspace.</h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Registration unlocks database-backed multi-account storage, encrypted IMAP
            credential handling, and admin-aware access control.
          </p>
        </section>

        <RegisterForm />
      </div>
    </main>
  );
}
