import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, FilePlus2, FolderHeart, Headphones, LayoutDashboard, LogOut, ShieldCheck, UserRound, HandHeart } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/profile", label: "My profile", icon: UserRound },
  { href: "/kyc", label: "Identity verification", icon: ShieldCheck },
  { href: "/submit-case", label: "Submit a case", icon: FilePlus2 },
  { href: "/my-cases", label: "My Cases", icon: FolderHeart },
  { href: "/my-help", label: "My Help", icon: HandHeart },
  { href: "/cases", label: "Browse cases", icon: FolderHeart },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/support", label: "Support", icon: Headphones },
];

export function GivethraShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const navigation = user?.role === "admin" ? [...items, { href: "/admin", label: "Admin review", icon: ShieldCheck }] : items;

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const notificationsQuery = trpc.givethra.notifications.mine.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 10000, // Poll every 10 seconds for new updates
  });

  const [lastKnownCount, setLastKnownCount] = useState<number | null>(null);

  // Foreground notification chime and native push alerts active

  useEffect(() => {
    if (!notificationsQuery.data) return;
    const unreadItems = notificationsQuery.data.filter((item: { isRead?: number; title?: string; content?: string }) => !item.isRead);
    const count = unreadItems.length;

    if (lastKnownCount !== null && count > lastKnownCount) {
      playNotificationChime();
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const latest = unreadItems[0];
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          // Background service worker ready
        } else {
          new Notification(latest?.title || "Givethra Update", {
            body: latest?.content || "You have a new notification or support reply.",
          });
        }
      }
    }
    setLastKnownCount(count);
  }, [notificationsQuery.data, lastKnownCount]);

  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Ignore audio autoplay restrictions if unmuted interaction is pending
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      playNotificationChime();
      new Notification("Givethra Notifications Enabled", {
        body: "You will now receive foreground browser notifications and audio chimes for updates.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f5] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f8f8f5]/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-emerald-950">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-900 text-sm font-bold text-amber-100">G</span>
            Givethra
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {notifPermission !== "granted" && "Notification" in window && (
              <button
                onClick={requestNotificationPermission}
                className="hidden items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200 sm:inline-flex"
                title="Enable browser notifications"
              >
                <Bell className="h-3.5 w-3.5" /> Enable Notifications
              </button>
            )}
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
              return <Link key={item.href} href={item.href} className={`flex min-w-0 flex-wrap items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-amber-100 text-emerald-950" : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}</Link>;
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
