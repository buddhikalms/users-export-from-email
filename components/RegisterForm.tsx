"use client";

import Link from "next/link";
import { useState } from "react";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm({ googleAuthEnabled }: { googleAuthEnabled: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(key: "name" | "email" | "password", value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create your account.");
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setStatus({
        type: "success",
        message: payload.message ?? "Account created successfully.",
      });
      router.push("/settings");
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create your account right now.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border-slate-200/80 bg-white/95 shadow-[0_30px_80px_-32px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900/90">
      <CardHeader className="px-7 pb-5 pt-8 text-center sm:px-8">
        <CardTitle className="text-3xl text-slate-950 dark:text-white">Create Account</CardTitle>
        <CardDescription>Start extracting, cleaning, and syncing contacts securely.</CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-8 sm:px-8">
        <GoogleAuthButton enabled={googleAuthEnabled} />
        {googleAuthEnabled ? (
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="register-name">Full name</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-12 rounded-xl pl-11" id="register-name" autoComplete="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-12 rounded-xl pl-11" id="register-email" type="email" autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-12 rounded-xl pl-11" id="register-password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required minLength={8} />
            </div>
          </div>

          {status ? (
            <Alert
              className={
                status.type === "error"
                  ? "border-destructive/25 bg-destructive/5"
                  : "border-primary/20 bg-primary/5"
              }
            >
              <AlertTitle>
                {status.type === "error" ? "Registration failed" : "Account ready"}
              </AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}

<<<<<<< HEAD
          <Button className="h-12 w-full rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" disabled={loading} type="submit">
=======
          <Button className="h-12 w-full rounded-xl bg-brand-turquoise shadow-lg shadow-brand-turquoise/15 hover:bg-brand-blue" disabled={loading} type="submit">
>>>>>>> 218bcf8 (feature : load balance)
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="pt-1 text-center text-sm text-muted-foreground">
            Already registered?{" "}
<<<<<<< HEAD
            <Link className="font-semibold text-secondary hover:text-secondary dark:text-secondary" href="/login">
=======
            <Link className="font-semibold text-brand-blue hover:text-brand-purple dark:text-brand-light-purple" href="/login">
>>>>>>> 218bcf8 (feature : load balance)
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
