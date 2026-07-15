"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to send your message.");
      }

      form.reset();
      setStatus({
        type: "success",
        message: data.message || "Thanks. Your message has been sent.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to send your message.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]"
      onSubmit={onSubmit}
    >
      <Input name="name" placeholder="Name" aria-label="Name" autoComplete="name" required />
      <Input
        name="email"
        placeholder="Work email"
        aria-label="Work email"
        type="email"
        autoComplete="email"
        required
      />
      <Input name="company" placeholder="Company" aria-label="Company" autoComplete="organization" />
      <textarea
        className="min-h-36 rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
        name="message"
        placeholder="Tell us what you want to export or sync"
        aria-label="Message"
        required
      />
      {status.type !== "idle" ? (
        <p
          className={
            status.type === "success"
              ? "text-sm font-medium text-emerald-600 dark:text-emerald-300"
              : "text-sm font-medium text-red-600 dark:text-red-300"
          }
        >
          {status.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
