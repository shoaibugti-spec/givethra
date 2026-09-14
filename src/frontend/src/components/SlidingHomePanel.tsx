import { useEffect, useState } from "react";
type PanelTab = "earning" | "support" | "wallet";
interface SlidingHomePanelProps { children: React.ReactNode; onTabChange?: (tab: PanelTab) => void; }

/** Full-page money/help view. The old swipe sheet is intentionally removed. */
export default function SlidingHomePanel({ children, onTabChange }: SlidingHomePanelProps) {
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
    {children}
  </div>;
}
export type { PanelTab };
