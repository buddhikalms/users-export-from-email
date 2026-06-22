import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AppChrome } from "@/components/layout/AppChrome";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ChatUp - Extract, Clean & Sync Email Contacts",
  description:
    "Extract contacts from Outlook and IMAP mailboxes, clean duplicates, export to Excel, and sync to Kit, Mailchimp, Brevo, HubSpot, and more.",
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
        className={`${inter.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <AppChrome
              user={
                session?.user
                  ? {
                      email: session.user.email,
                      name: session.user.name,
                      role: session.user.role,
                    }
                  : null
              }
            >
              {children}
            </AppChrome>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
