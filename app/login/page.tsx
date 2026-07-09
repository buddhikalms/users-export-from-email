import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions, googleAuthEnabled } from "@/auth";
import { AuthPageHeader } from "@/components/AuthPageHeader";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/settings");
  }

  return (
<<<<<<< HEAD
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-5 py-6 dark:bg-slate-950 sm:px-8 sm:py-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,127,212,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,127,212,0.055)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[110px] dark:bg-secondary/10" />
=======
    <main className="relative min-h-screen overflow-hidden bg-brand-white px-5 py-6 dark:bg-brand-navy sm:px-8 sm:py-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(4,130,230,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(1,188,182,0.055)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-light-purple/20 blur-[110px] dark:bg-brand-purple/20" />
>>>>>>> 218bcf8 (feature : load balance)
      <div className="relative mx-auto max-w-6xl">
        <AuthPageHeader />
        <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-md items-center pb-16">
          <LoginForm googleAuthEnabled={googleAuthEnabled} />
        </div>
      </div>
    </main>
  );
}
