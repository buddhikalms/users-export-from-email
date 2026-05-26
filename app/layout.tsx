import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AuthProvider } from "@/components/AuthProvider";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
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
  title: "BuddhiEmailExtractor",
  description:
    "Enterprise email lead extraction, CRM cleanup, file export, and marketing platform sync.",
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
          <ThemeProvider>
            {session?.user ? (
              <DashboardShell
                user={{
                  email: session.user.email,
                  name: session.user.name,
                  role: session.user.role,
                }}
              >
                {children}
              </DashboardShell>
            ) : (
              children
            )}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
