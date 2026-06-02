"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VaultSetup({
  busy,
  onSetup,
}: {
  busy?: boolean;
  onSetup: (masterPassword: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);

    if (password.length < 10) {
      setError("Use at least 10 characters for the master password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The confirmation does not match the master password.");
      return;
    }

    await onSetup(password);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Security Vault</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert className="border-amber-300/60 bg-amber-50">
          <ShieldAlert className="mb-2 h-4 w-4" />
          <AlertTitle>Recovery warning</AlertTitle>
          <AlertDescription>
            Your master password is never stored. If you lose it, encrypted credentials
            cannot be recovered. You can delete the vault and create a new one.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vault-master-password">Master password</Label>
            <Input
              id="vault-master-password"
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vault-master-confirm">Confirm master password</Label>
            <Input
              id="vault-master-confirm"
              autoComplete="new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>

        <p className="text-sm font-medium text-destructive">
          If you forget this password, your saved credentials cannot be recovered.
        </p>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button disabled={busy} onClick={() => void submit()}>
          {busy ? "Creating vault..." : "Create Encrypted Vault"}
        </Button>
      </CardContent>
    </Card>
  );
}
