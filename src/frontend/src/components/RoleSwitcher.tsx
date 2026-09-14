// src/frontend/src/components/RoleSwitcher.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { DollarSign, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";

export default function RoleSwitcher({ supportPostCount = 0 }: { supportPostCount?: number }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [activeTab, setActiveTab] = useState<"support" | "earning">(() =>
    typeof window !== "undefined" && (window.localStorage.getItem("givethra_home_mode") === "earning" || window.localStorage.getItem("givethra_home_mode") === "wallet") ? "earning" : "support"
  );

  useEffect(() => {
    const onModeChange = (event: Event) => {
      const tab = (event as CustomEvent<"support" | "earning">).detail;
      if (tab === "support" || tab === "earning") setActiveTab(tab);
    };
    window.addEventListener("givethra-home-panel-tab", onModeChange);
    return () => window.removeEventListener("givethra-home-panel-tab", onModeChange);
  }, []);
  const handleSwitch = (tab: "support" | "earning") => {
    if (switching) return;
    setSwitching(true);
    try {
      setActiveTab(tab);
      localStorage.setItem("givethra_home_mode", tab);
      window.dispatchEvent(new CustomEvent("givethra-home-panel-tab", { detail: tab }));
      navigate({ to: "/home" });
    } finally {
      window.setTimeout(() => setSwitching(false), 250);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted p-1 shadow-sm" aria-label="Home view switcher">
      <button type="button" aria-label="Home" aria-pressed={false} onClick={() => { localStorage.setItem("givethra_home_mode", "support"); window.dispatchEvent(new CustomEvent("givethra-home-panel-tab", { detail: "support" })); navigate({ to: "/home" }); }} disabled={switching} className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-all active:scale-[.97] hover:bg-background hover:text-foreground">
        <HeartHandshake className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </button>
      <button type="button" aria-label="Support" aria-pressed={activeTab === "support"} onClick={() => handleSwitch("support")} disabled={switching} className={`relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all active:scale-[.97] ${activeTab === "support" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}>
        <DollarSign className="h-4 w-4" />
        <span className="hidden sm:inline">Support</span>
        {supportPostCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] leading-4 text-white shadow-sm">{supportPostCount > 99 ? "99+" : supportPostCount}</span> : null}
      </button>
    </div>
  );
}
