"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VaultUnlock({
  busy,
  onUnlock,
}: {
  busy?: boolean;
  onUnlock: (masterPassword: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);

    try {
      await onUnlock(password);
      setPassword("");
    } catch {
      setError("Unable to unlock the vault. Check the master password and try again.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unlock Vault</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert>
          <LockKeyhole className="mb-2 h-4 w-4" />
          <AlertTitle>Zero-knowledge unlock</AlertTitle>
          <AlertDescription>
            The password stays in this browser. The server returns only encrypted vault
            material and never decrypts credentials.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="vault-unlock-password">Master password</Label>
          <Input
            id="vault-unlock-password"
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void submit();
              }
            }}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button disabled={busy || !password} onClick={() => void submit()}>
          {busy ? "Unlocking..." : "Unlock Vault"}
        </Button>
      </CardContent>
    </Card>
  );
}
