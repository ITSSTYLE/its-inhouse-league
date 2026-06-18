import { Crown, History, LayoutDashboard, ListOrdered, LogOut, Menu, Swords, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Player } from "@/types/domain";

const navItems = [
  { href: "/roster", label: "Roster", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: ListOrdered },
  { href: "/drafts", label: "Drafts", icon: Crown },
  { href: "/matches", label: "Matches", icon: History },
  { href: "/admin", label: "Admin", icon: LayoutDashboard }
];

export function AppShell({
  children,
  player
}: {
  children: React.ReactNode;
  player: Player | null;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-white">
              <Swords className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black sm:text-base">iT&apos;s In-House League</span>
              <span className="block truncate text-xs text-slate-500">Discord drafts and ELO</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {player ? (
              <>
                <div className="flex items-center gap-2">
                  {player.avatar_url ? (
                    <Image
                      src={player.avatar_url}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-700">
                      {player.username.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden max-w-32 truncate text-sm font-bold sm:block">{player.username}</span>
                </div>
                <Link
                  href="/api/auth/logout"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
                  aria-label="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <Link
                href="/api/auth/login"
                className="rounded-md bg-discord px-4 py-2 text-sm font-bold text-white transition hover:bg-[#4752c4]"
              >
                Login
              </Link>
            )}
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
