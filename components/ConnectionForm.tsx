"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Server, ShieldCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearSyncArtifacts, getStoredConnectionSettings, saveConnectionSettings } from "@/lib/storage";
import { connectionSettingsSchema, defaultConnectionSettings } from "@/lib/validation";

type FormState = {
  email: string;
  host: string;
  port: string;
  security: "ssl_tls" | "starttls";
  username: string;
  password: string;
  rememberPassword: boolean;
};

function toFormState() {
  return {
    ...defaultConnectionSettings,
    port: String(defaultConnectionSettings.port),
  } satisfies FormState;
}

export function ConnectionForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = getStoredConnectionSettings();
    if (!stored) {
      return;
    }

    setForm({
      email: stored.email,
      host: stored.host,
      port: String(stored.port),
      security: stored.security,
      username: stored.username,
      password: stored.password,
      rememberPassword: Boolean(stored.rememberPassword),
    });
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const parsed = connectionSettingsSchema.safeParse({
      ...form,
      port: Number(form.port),
    });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Please review the connection details.";
      setStatus({
        type: "error",
        message,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/imap/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: parsed.data,
        }),
      });

      const payload = (await response.json()) as
        | { message?: string; error?: string }
        | undefined;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to connect to Outlook over IMAP.");
      }

      saveConnectionSettings(parsed.data);
      clearSyncArtifacts();
      setStatus({
        type: "success",
        message: payload?.message ?? "Connection successful. Loading folders next.",
      });
      router.push("/folders");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while testing the connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-white/80">
      <CardHeader>
        <CardTitle>Outlook Incoming Mail Server Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  autoComplete="email"
                  className="pl-10"
                  placeholder="name@outlook.com"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  autoComplete="username"
                  className="pl-10"
                  placeholder="Usually the full Outlook email"
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="host">Incoming mail server host</Label>
              <div className="relative">
                <Server className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="host"
                  className="pl-10"
                  placeholder="outlook.office365.com"
                  value={form.host}
                  onChange={(event) => updateField("host", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                inputMode="numeric"
                placeholder="993"
                value={form.port}
                onChange={(event) => updateField("port", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="security">Security type</Label>
              <select
                id="security"
                className="flex h-11 w-full rounded-2xl border border-input bg-white/85 px-4 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={form.security}
                onChange={(event) =>
                  updateField("security", event.target.value as FormState["security"])
                }
              >
                <option value="ssl_tls">SSL/TLS</option>
                <option value="starttls">STARTTLS</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password or app password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-10"
                  placeholder="Enter account password or Outlook app password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-secondary/50 p-4">
            <Checkbox
              id="remember-password"
              checked={form.rememberPassword}
              onCheckedChange={(checked) =>
                updateField("rememberPassword", Boolean(checked))
              }
            />
            <div className="space-y-1">
              <Label htmlFor="remember-password">
                Remember password on this device
              </Label>
              <p className="text-sm leading-6 text-muted-foreground">
                Leave this off to keep credentials in the current browser session only.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-5 text-sm leading-7 text-muted-foreground">
            Outlook defaults: <strong>Host</strong> `outlook.office365.com`,{" "}
            <strong>Port</strong> `993`, <strong>Security</strong> `SSL/TLS`.
            If your tenant requires app passwords or modern auth exceptions, use the
            approved account credential here.
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
                {status.type === "error" ? "Connection failed" : "Connection ready"}
              </AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="sm:min-w-52" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Testing connection..." : "Test Connection & Continue"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(toFormState())}
            >
              Reset Defaults
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
