import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, HandHelping, Heart, ShieldCheck } from "lucide-react";
import { useState } from "react";

const roles = [
  {
    id: "hero" as UserRole,
    icon: Heart,
    title: "Become a Hero",
    subtitle: "I want to help others",
    description:
      "Browse verified cases, unlock case details, and support real people through direct institution payments.",
    accent: "text-primary",
    bg: "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40",
    selected: "bg-primary/10 border-primary ring-2 ring-primary/30",
  },
  {
    id: "help_seeker" as UserRole,
    icon: HandHelping,
    title: "Request Help",
    subtitle: "I need assistance",
    description:
      "Submit a verified help request, upload supporting documents, and connect with Heroes who can assist you directly.",
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
    selected:
      "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300 dark:bg-emerald-900 dark:border-emerald-500",
  },
];

export default function OnboardingPage() {
  const { setRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UserRole>(null);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  const handleContinue = () => {
    if (!selected) return;
    setSaving(true);
    setRole(selected);
    setTimeout(() => {
      if (selected === "hero") navigate({ to: "/cases" });
      else navigate({ to: "/my-requests" });
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            How would you like to use Givethra?
          </h1>
          <p className="text-muted-foreground text-sm">
            You can switch roles at any time from your profile settings.
          </p>
        </div>

        <div className="grid gap-4">
          {roles.map(
            ({
              id,
              icon: Icon,
              title,
              subtitle,
              description,
              accent,
              bg,
              selected: selClass,
            }) => (
              <button
                key={id}
                type="button"
                data-ocid={`onboarding.role_${id}`}
                onClick={() => setSelected(id)}
                className={cn(
                  "w-full text-left rounded-2xl border-2 p-5 transition-smooth",
                  selected === id ? selClass : bg,
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "mt-0.5 rounded-xl p-2.5 bg-background shadow-sm",
                      accent,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-foreground">
                      {title}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {subtitle}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                  {selected === id && (
                    <div className="shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ),
          )}
        </div>

        <Button
          data-ocid="onboarding.continue_button"
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full h-11 font-semibold text-base"
        >
          {saving ? "Setting up your account..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
