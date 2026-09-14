import { useEffect, useState } from "react";
import { DollarSign, HandHelping, WalletCards } from "lucide-react";
type PanelTab = "earning" | "support" | "wallet";
interface SlidingHomePanelProps { children: React.ReactNode; onTabChange?: (tab: PanelTab) => void; }
const TABS: Array<{ id: PanelTab; label: string; icon: typeof DollarSign }> = [
  { id: "earning", label: "Earnings", icon: DollarSign },
  { id: "support", label: "Support", icon: HandHelping },
  { id: "wallet", label: "Wallet", icon: WalletCards },
];

/** Full-page money/help view. The old swipe sheet is intentionally removed. */
export default function SlidingHomePanel({ children, onTabChange }: SlidingHomePanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>(() => {
    if (typeof window === "undefined") return "support";
    const saved = window.localStorage.getItem("givethra_home_mode");
    return saved === "earning" || saved === "wallet" ? saved : "support";
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
    // These are sections inside the current Home view. They must not trigger
    // the global Help/Earnings navigation switcher.
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  return <div className="min-h-screen bg-background pb-20" data-testid="home-money-view">
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 px-3 py-3 shadow-sm backdrop-blur-xl">
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-2" role="tablist" aria-label="Earnings, Help and Wallet sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => chooseTab(id)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition active:scale-[0.97] ${activeTab === id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
            <Icon className="h-4 w-4" /><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
    {children}
  </div>;
}
export type { PanelTab };
