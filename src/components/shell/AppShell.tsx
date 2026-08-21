"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCount } from "@/components/shell/AlertCount";
import { NAV_ITEMS } from "@/lib/nav";
import {
  IconCommand,
  IconResearch,
  IconSignals,
  IconWatch,
} from "./icons";

const ICONS = {
  "/": IconCommand,
  "/research": IconResearch,
  "/watchlist": IconWatch,
  "/indicators": IconSignals,
} as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-panel/80 lg:flex lg:flex-col">
        <div className="border-b border-line px-5 py-5">
          <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
            CrystalBall
          </p>
          <p className="mt-1 text-sm text-fog">Command center</p>
        </div>
        <nav className="flex flex-col gap-1 p-3" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.href as keyof typeof ICONS];
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                  active
                    ? "bg-raised text-paper"
                    : "text-fog hover:bg-raised/70 hover:text-paper"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-amber" : ""}`} />
                <span>{item.label}</span>
                {item.href === "/watchlist" ? <AlertCount /> : null}
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-fog/70">
                  {item.hint}
                </span>
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto px-5 py-4 font-mono text-[10px] leading-5 text-fog/70">
          US equities · ETFs · key futures
          <br />
          EOD + 15–30 min refresh
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-ink/90 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
                CrystalBall
              </p>
              <p className="text-sm text-fog">
                {pathname.startsWith("/pair/")
                  ? "Pair profile"
                  : (NAV_ITEMS.find((item) => isActive(pathname, item.href))
                      ?.label ?? "Command")}
              </p>
            </div>
            <span className="font-mono text-[10px] tracking-widest text-fog uppercase">
              Live tape
            </span>
          </div>
          <div className="tape-scan h-px bg-line" />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel/95 backdrop-blur-md lg:hidden"
          aria-label="Primary"
        >
          <ul className="grid grid-cols-4">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.href as keyof typeof ICONS];
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] ${
                      active ? "text-amber" : "text-fog"
                    }`}
                  >
                    <span className="relative">
                      <Icon className="h-5 w-5" />
                      {item.href === "/watchlist" ? (
                        <AlertCount compact />
                      ) : null}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
