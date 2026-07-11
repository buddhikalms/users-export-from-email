"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/ThemeProvider";

export function AuthPageHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="mb-10 flex items-center justify-between gap-4">
      <Link className="flex items-center gap-3 font-semibold text-foreground" href="/">
        <Image
          alt="OMAZYNC"
          className="h-11 w-40 rounded-md object-cover"
          height={1024}
          priority
          src="/Omazync-logo.png"
          width={1536}
        />
      </Link>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
