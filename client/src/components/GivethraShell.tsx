import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, FilePlus2, FolderHeart, Headphones, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/profile", label: "My profile", icon: UserRound },
  { href: "/kyc", label: "Identity verification", icon: ShieldCheck },
  { href: "/submit-case", label: "Submit a case", icon: FilePlus2 },
  { href: "/cases", label: "Browse cases", icon: FolderHeart },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/support", label: "Support", icon: Headphones },
];

export function GivethraShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const navigation = user?.role === "admin" ? [...items, { href: "/admin", label: "Admin review", icon: ShieldCheck }] : items;

  return (
    <div className="min-h-screen bg-[#f8f8f5] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f8f8f5]/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-emerald-950">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-900 text-sm font-bold text-amber-100">G</span>
            Givethra
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:block">{user?.email}</span>
            <button onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3.5 py-2 font-medium text-slate-700 transition hover:border-emerald-800 hover:text-emerald-900 active:scale-[.97]">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="container grid gap-8 py-7 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-[1.6rem] bg-emerald-950 p-3 text-emerald-50 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className="border-b border-emerald-800 px-3 py-4">
            <p className="font-medium leading-tight">{user?.name || "Your Givethra space"}</p>
            <p className="mt-1 text-xs text-emerald-200/70">Private &amp; secure workspace</p>
          </div>
          <nav className="mt-3 grid gap-1" aria-label="Workspace">
            {navigation.map(item => {
              const Icon = item.icon;
              const active = location === item.href;
              return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-amber-100 text-emerald-950" : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}</Link>;
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
