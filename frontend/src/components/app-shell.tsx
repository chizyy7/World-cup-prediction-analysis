"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  ["Dashboard", "/"],
  ["Countries", "/countries"],
  ["History", "/history"],
  ["Compare", "/compare"],
  ["Match", "/match"],
  ["Simulation", "/simulation"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-sm font-bold uppercase tracking-wide">World Cup AI Predictor</h1>
          <ThemeToggle />
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={cn("rounded-md px-3 py-1 text-sm", pathname === href ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800")}>{label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
