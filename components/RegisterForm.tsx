"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
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
    <Card className="border-slate-200 bg-white/90 shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-slate-950/80">
      <CardHeader>
        <CardTitle className="text-slate-950 dark:text-white">Create Account</CardTitle>
        <CardDescription>Start extracting, cleaning, and syncing contacts securely.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="register-name">Full name</Label>
            <Input
              id="register-name"
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email address</Label>
            <Input
              id="register-email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
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

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link className="font-medium text-primary hover:text-primary/80" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
