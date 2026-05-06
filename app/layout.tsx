import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AuthProvider } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Outlook Sync Exporter",
  description:
    "Connect to Outlook over IMAP, extract unique contacts from selected folders, and export them to Excel.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <AuthProvider>
          <div className="mx-auto w-full max-w-7xl px-6 pt-6 lg:px-10">
            <header className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Link className="text-lg font-semibold text-foreground" href="/">
                  Outlook Sync Exporter
                </Link>
                <nav className="flex flex-wrap gap-2 text-sm">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/">Home</Link>
                  </Button>
                  {session?.user ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/settings">Workspace</Link>
                    </Button>
                  ) : null}
                </nav>
              </div>

              {session?.user ? (
                <UserMenu
                  email={session.user.email}
                  name={session.user.name}
                  role={session.user.role}
                />
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Create Account</Link>
                  </Button>
                </div>
              )}
            </header>
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
