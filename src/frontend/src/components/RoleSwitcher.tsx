// src/frontend/src/components/RoleSwitcher.tsx
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Users, HeartHandshake } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getKycStatus } from "@/lib/api";

export default function RoleSwitcher() {
  const { role, setRole } = useRole();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (newRole: "hero" | "requester") => {
    if (newRole === role || switching) return;
    
    setSwitching(true);
    try {
      // If switching to Requester, check KYC
      if (newRole === "requester" && user?.id) {
        const kyc = await getKycStatus(user.id);
        const status = String(kyc?.status || "none").toLowerCase();
        
        if (status !== "approved") {
          // Store the new role temporarily, but redirect to KYC
          setRole("requester");
          navigate({ to: "/kyc" });
          toast.info("Please complete KYC verification to become a Requester.");
          return;
        }
      }
      
      // Switch role
      setRole(newRole);
      toast.success(`Switched to ${newRole === "hero" ? "Hero" : "Requester"} mode`);
      
    } catch (error) {
      toast.error("Could not switch role. Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  const isHero = role === "hero";
  const isRequester = role === "requester";

  // Only show if authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1 shadow-sm border border-border/50">
      {/* Hero Button */}
      <button
        onClick={() => handleSwitch("hero")}
        disabled={switching}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${isHero 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }
          ${switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-pressed={isHero}
      >
        <HeartHandshake className="h-4 w-4" />
        <span className="hidden sm:inline">Hero</span>
      </button>

      {/* Requester Button */}
      <button
        onClick={() => handleSwitch("requester")}
        disabled={switching}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${isRequester 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }
          ${switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-pressed={isRequester}
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Requester</span>
      </button>
    </div>
  );
}
