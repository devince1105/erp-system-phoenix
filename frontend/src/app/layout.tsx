import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP System Phoenix",
  description: "Enterprise Resource Planning System - Phoenix",
};

import { AuthProvider } from "@/features/core/contexts/AuthContext";
import { AppLayout } from "@/features/core/components/AppLayout";
import { ThemeProvider } from "@/features/core/components/ThemeProvider";

import { CommandPaletteProvider } from "@/features/core/contexts/CommandPaletteContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CommandPaletteProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </CommandPaletteProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
