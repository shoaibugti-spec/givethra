import { useEffect, useState } from "react";
import { DollarSign, HandHelping, WalletCards } from "lucide-react";

type PanelTab = "earning" | "support" | "wallet";
interface SlidingHomePanelProps { children: React.ReactNode; onTabChange?: (tab: PanelTab) => void; notificationCount?: number; }
const TABS: Array<{ id: PanelTab; label: string; icon: typeof DollarSign }> = [
  { id: "earning", label: "Earnings", icon: DollarSign },
  { id: "support", label: "Help", icon: HandHelping },
  { id: "wallet", label: "Wallet", icon: WalletCards },
];

/** Full-page money/help view. The old swipe sheet is intentionally removed. */
export default function SlidingHomePanel({ children, onTabChange, notificationCount = 0 }: SlidingHomePanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>(() => {
    if (typeof window === "undefined") return "support";
    const saved = window.localStorage.getItem("givethra_home_mode");
    return saved === "earning" ? "earning" : "support";
  });
  useEffect(() => {
    const onModeChange = (event: Event) => {
      const tab = (event as CustomEvent<PanelTab>).detail;
      if (tab === "support" || tab === "earning" || tab === "wallet") setActiveTab(tab);
    };
    window.addEventListener("givethra-home-panel-tab", onModeChange);
    return () => window.removeEventListener("givethra-home-panel-tab", onModeChange);
  }, []);
  const chooseTab = (tab: PanelTab) => {
    setActiveTab(tab);
    localStorage.setItem("givethra_home_mode", tab);
    onTabChange?.(tab);
    window.dispatchEvent(new CustomEvent("givethra-home-panel-tab", { detail: tab }));
  };
  return <div className="min-h-screen bg-background pb-20" data-testid="home-money-view">
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 px-3 py-3 shadow-sm backdrop-blur-xl">
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-2" role="tablist" aria-label="Help, earnings and wallet tabs">
        {TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => chooseTab(id)} className={`relative flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition active:scale-[0.97] ${activeTab === id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}><Icon className="h-4 w-4" /><span>{label}</span>{id === "support" && notificationCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] leading-4 text-white shadow-sm">{notificationCount > 99 ? "99+" : notificationCount}</span> : null}</button>)}
      </div>
    </div>
    {children}
  </div>;
}
export type { PanelTab };
