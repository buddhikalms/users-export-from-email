"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/ThemeProvider";

const navItems = [
  ["Features", "/features"],
  ["Integrations", "/integrations"],
  ["Pricing", "/pricing"],
  ["Security", "/security"],
  ["Use Cases", "/use-cases"],
] as const;

export function MarketingHeader({ signedIn = false }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const logoSrc = isDark ? "/Omazync-light-logo.png" : "/Omazync-logo.png";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-blue/10 bg-brand-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-brand-navy/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 font-semibold" href="/">
          <Image
            alt="OMAZYNC"
            className="h-10 w-36 rounded-md object-cover"
            height={1024}
            priority
            src={logoSrc}
            width={1536}
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-brand-navy/65 dark:text-slate-300 lg:flex">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              className="hover:text-brand-blue dark:hover:text-white"
              href={href as any}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleTheme}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button asChild variant="ghost">
            <Link href={(signedIn ? "/dashboard" : "/login") as any}>
              {signedIn ? "Dashboard" : "Login"}
            </Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-brand-turquoise to-brand-blue text-white hover:opacity-90"
          >
            <Link href={(signedIn ? "/dashboard" : "/register") as any}>
              Start Free
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleTheme}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              animate={{ x: 0 }}
              className="ml-auto h-full w-[min(360px,88vw)] border-l border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-950"
              exit={{ x: 380 }}
              initial={{ x: 380 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between">
                <Image
                  alt="OMAZYNC"
                  className="h-10 w-36 rounded-md object-cover"
                  height={1024}
                  src={logoSrc}
                  width={1536}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="mt-8 grid gap-2">
                {navItems.map(([label, href]) => (
                  <Link
                    key={href}
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10"
                    href={href as any}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 grid gap-3">
                <Button variant="outline" onClick={toggleTheme}>
                  {isDark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {isDark ? "Light theme" : "Dark theme"}
                </Button>
                <Button asChild variant="outline">
                  <Link href={(signedIn ? "/dashboard" : "/login") as any}>
                    {signedIn ? "Dashboard" : "Login"}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={(signedIn ? "/dashboard" : "/register") as any}>
                    Start Free
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
