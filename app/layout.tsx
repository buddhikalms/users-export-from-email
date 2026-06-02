import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AppChrome } from "@/components/layout/AppChrome";
import { AuthProvider } from "@/components/AuthProvider";
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
  title: "Email Exporter - Extract, Clean & Sync Email Contacts",
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
        className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
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
