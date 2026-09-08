// src/frontend/src/pages/BecomeHeroPage.tsx
// Givethra - Become a Hero (Auto-slide every 6s)

import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Star,
  UserPlus,
  Lock,
  Heart,
  Gift,
  CheckCircle,
  Target,
  Sparkles,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";

// Hero slides — same as before, but we can adjust text if needed
const HERO_SLIDES = [
  { icon: <Star className="w-10 h-10" />, title: "Hero", desc: "You can change a life today" },
  { icon: <UserPlus className="w-10 h-10" />, title: "Become a Hero", desc: "Step up and make a difference" },
  { icon: <Lock className="w-10 h-10" />, title: "Unlock a Case", desc: "Choose a case to support" },
  { icon: <Heart className="w-10 h-10" />, title: "Contribute & Help", desc: "Your contribution counts" },
  { icon: <Gift className="w-10 h-10" />, title: "3 Free Contributions", desc: "Welcome offer — try it now" },
  { icon: <CheckCircle className="w-10 h-10" />, title: "Help Verified People", desc: "Support those who need it most" },
  { icon: <Target className="w-10 h-10" />, title: "Make a Real Impact", desc: "Be the change you want to see" },
];

export default function BecomeHeroPage() {
  const { setRole: setAuthRole } = useAuth();
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleBecomeHero = () => {
    // Set role and navigate to cases (or wherever you want)
    setRole("hero");
    setAuthRole("hero");
    navigate({ to: "/cases" });
  };

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Slide area */}
        <div className="relative h-72 md:h-80 bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center transition-all duration-700 ease-in-out">
          <div className="flex flex-col items-center justify-center text-white text-center p-6">
            <div className="mb-4">{currentSlide.icon}</div>
            <h2 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{currentSlide.title}</h2>
            <p className="text-lg md:text-xl mt-2 text-white/90 drop-shadow-md">{currentSlide.desc}</p>
          </div>
          {/* Slide indicator dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content below slides */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Ready to Become a <span className="text-rose-600">Hero</span>?
            </h1>
            <p className="text-muted-foreground mt-2">
              Join our community of changemakers. Every contribution, big or small, makes a real difference.
            </p>
          </div>

          <button
            onClick={handleBecomeHero}
            className="w-full py-4 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <Heart className="w-6 h-6" />
            بیکم ہیرو — Start Helping Now
          </button>

          <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground border-t border-border pt-4">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Verified</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Globe className="h-5 w-5 text-primary" />
              <span>Global</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Impactful</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional footer / back link */}
      <div className="mt-6 text-sm text-muted-foreground">
        <button onClick={() => navigate({ to: "/" })} className="hover:underline">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
