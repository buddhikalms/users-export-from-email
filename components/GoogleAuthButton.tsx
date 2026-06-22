"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function GoogleAuthButton({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState(false);

  if (!enabled) {
    return null;
  }

  return (
    <Button
      className="h-12 w-full rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10"
      disabled={loading}
      type="button"
      variant="outline"
      onClick={() => {
        setLoading(true);
        void signIn("google", { callbackUrl: "/settings" });
      }}
    >
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.24-2.55c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.77-5.61-4.14H3.04v2.62A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.92a6.02 6.02 0 0 1 0-3.84V7.46H3.04a10 10 0 0 0 0 9.08l3.35-2.62Z" />
        <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.71 9.39 5.94 12 5.94Z" />
      </svg>
      {loading ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}
