// src/frontend/src/components/RoleSwitcher.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { DollarSign, HeartHandshake } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RoleSwitcher() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = (tab: "support" | "earning") => {
    if (switching) return;
    setSwitching(true);
    try {
      localStorage.setItem("givethra_home_mode", tab);
      window.dispatchEvent(new CustomEvent("givethra-home-panel-tab", { detail: tab }));
      navigate({ to: "/home" });
      toast.success(tab === "earning" ? "Earnings view opened" : "Help view opened");
    } finally {
      window.setTimeout(() => setSwitching(false), 250);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted p-1 shadow-sm" aria-label="Home view switcher">
      <button type="button" onClick={() => handleSwitch("support")} disabled={switching} className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
        <HeartHandshake className="h-4 w-4" />
        <span className="hidden sm:inline">Help</span>
      </button>
      <button type="button" onClick={() => handleSwitch("earning")} disabled={switching} className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
        <DollarSign className="h-4 w-4" />
        <span className="hidden sm:inline">Earnings</span>
      </button>
    </div>
  );
}
