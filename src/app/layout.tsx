import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getCurrentPlayer } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "iT's In-House League",
  description: "Discord-first in-house league drafts, matches, and leaderboard."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const player = await getCurrentPlayer();

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell player={player}>{children}</AppShell>
      </body>
    </html>
  );
}
