"use client";

import Link from "next/link";
import { useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ googleAuthEnabled }: { googleAuthEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/settings");
    router.refresh();
  }

  return (
    <Card className="w-full border-slate-200/80 bg-white/95 shadow-[0_30px_80px_-32px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900/90">
      <CardHeader className="px-7 pb-5 pt-8 text-center sm:px-8">
        <CardTitle className="text-3xl text-slate-950 dark:text-white">Sign In</CardTitle>
        <CardDescription>Use your OMAZYNC workspace credentials.</CardDescription>
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
            <Label htmlFor="login-email">Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-12 rounded-xl pl-11" id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-12 rounded-xl pl-11" id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
          </div>

          {error ? (
            <Alert className="border-destructive/25 bg-destructive/5">
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button className="h-12 w-full rounded-xl bg-blue-600 shadow-lg shadow-blue-600/15 hover:bg-blue-700" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400" href="/register">Register</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
