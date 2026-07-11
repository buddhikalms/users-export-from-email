"use client";

import { useEffect, useState } from "react";
import { Ban, Plus, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ignoredEmailSchema } from "@/lib/validation";

interface IgnoredEmail {
  id: string;
  email: string;
  createdAt: string;
}

export function IgnoredEmailsForm() {
  const [email, setEmail] = useState("");
  const [ignoredEmails, setIgnoredEmails] = useState<IgnoredEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function loadIgnoredEmails() {
    setLoading(true);

    try {
      const response = await fetch("/api/ignored-emails");
      const payload = (await response.json()) as {
        ignoredEmails?: IgnoredEmail[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load ignored emails.");
      }

      setIgnoredEmails(payload.ignoredEmails ?? []);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to load ignored emails.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIgnoredEmails();
  }, []);

  async function addEmail() {
    setStatus(null);

    const parsed = ignoredEmailSchema.safeParse({ email });
    if (!parsed.success) {
      setStatus({
        type: "error",
        message: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
      });
      return;
    }

    setBusyId("add");

    try {
      const response = await fetch("/api/ignored-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as {
        ignoredEmail?: IgnoredEmail;
        error?: string;
        message?: string;
      };

      if (!response.ok || !payload.ignoredEmail) {
        throw new Error(payload.error ?? "Unable to add ignored email.");
      }

      setIgnoredEmails((current) => [
        payload.ignoredEmail as IgnoredEmail,
        ...current.filter((item) => item.id !== payload.ignoredEmail?.id),
      ].sort((left, right) => left.email.localeCompare(right.email)));
      setEmail("");
      setStatus({
        type: "success",
        message: payload.message ?? "Ignored email saved.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to add ignored email.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function removeEmail(item: IgnoredEmail) {
    setStatus(null);
    setBusyId(item.id);

    try {
      const response = await fetch(`/api/ignored-emails/${item.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to remove ignored email.");
      }

      setIgnoredEmails((current) =>
        current.filter((ignoredEmail) => ignoredEmail.id !== item.id),
      );
      setStatus({
        type: "success",
        message: payload.message ?? "Ignored email removed.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to remove ignored email.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="border-white/80">
      <CardHeader>
        <CardTitle>Emails to Ignore</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Add forwarders, your own inboxes, and company addresses that should never
          appear in synced results or Excel exports.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="ignored-email">Email address</Label>
            <div className="relative">
              <Ban className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="ignored-email"
                className="pl-10"
                placeholder="Email address to ignore"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void addEmail();
                  }
                }}
              />
            </div>
          </div>
          <Button
            className="self-end"
            disabled={busyId === "add"}
            onClick={() => void addEmail()}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
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
              {status.type === "error" ? "Update failed" : "Ignore list updated"}
            </AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-6 text-center text-sm text-muted-foreground">
            Loading ignored emails...
          </div>
        ) : ignoredEmails.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/60 dark:bg-card/70 p-6 text-center text-sm text-muted-foreground">
            No ignored emails yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {ignoredEmails.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/85 dark:bg-card/85 px-4 py-3"
              >
                <span className="text-sm font-medium">{item.email}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === item.id}
                  onClick={() => void removeEmail(item)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
