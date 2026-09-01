// src/frontend/src/pages/RoleSelectionPage.tsx
// Givethra - Role Selection Landing Page
// Only English, no Urdu

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Heart, HandHelping, ShieldCheck, Users, Globe, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function RoleSelectionPage() {
  const { isAuthenticated, user, setRole: setAuthRole } = useAuth();
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleRoleSelect = async (role: "hero" | "requester") => {
    setRole(role);
    setAuthRole(role === "requester" ? "help_seeker" : "hero");
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { role } });
    } else {
      navigate({ to: "/home" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header with stats */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <span className="text-2xl font-bold text-foreground">ivethra</span>
          </div>
          <div className="flex justify-center gap-8 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              23,456+ <span className="hidden sm:inline">Heroes</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-primary" />
              19,873+ <span className="hidden sm:inline">Lives Helped</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              100% <span className="hidden sm:inline">Verified Cases</span>
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Real People. <br className="sm:hidden" />
              <span className="text-primary">Real Needs. Real Help.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A trusted platform where real people with genuine needs get support from kind-hearted Heroes.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">How are you today?</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Become a Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Become a Hero</h2>
              <p className="text-sm text-muted-foreground">
                Support someone in need and change a life. Be a part of a trusted community of helpers. Even a small help can make a big difference.
              </p>
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold"
                onClick={() => handleRoleSelect("hero")}
              >
                <Heart className="h-5 w-5 mr-2" /> Become a Hero
              </Button>
            </div>
          </motion.div>

          {/* Request Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <HandHelping className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Request Help</h2>
              <p className="text-sm text-muted-foreground">
                Facing a difficult time? You are not alone. Submit your request with complete details. Get help from verified Heroes around the world.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base font-semibold border-primary/50 hover:bg-primary/10"
                onClick={() => handleRoleSelect("requester")}
              >
                <HandHelping className="h-5 w-5 mr-2" /> Request Help
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Verified & Secure</span>
            <span className="text-[10px]">100% Transparency</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart className="h-5 w-5 text-primary" />
            <span>Compassion</span>
            <span className="text-[10px]">Driven by Humanity</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Globe className="h-5 w-5 text-primary" />
            <span>Global Community</span>
            <span className="text-[10px]">Help Beyond Borders</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Safe & Private</span>
            <span className="text-[10px]">Your Data is Protected</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>"Be the reason someone believes in kindness."</p>
          <p className="mt-2">givethra.org</p>
        </div>
      </div>
    </div>
  );
}
