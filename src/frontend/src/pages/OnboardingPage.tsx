// src/frontend/src/pages/OnboardingPage.tsx
// Givethra - Mandatory Onboarding Guide (Role-based slideshow)
// This page cannot be skipped. User must go through all slides.

import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Heart,
  HandHelping,
  ShieldCheck,
  Users,
  Sparkles,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Award,
  HandCoins,
  Unlock,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion-react";
import { getKycStatus, getOnboardingStatus, setOnboardingStatus } from "@/lib/api";

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Check if user already completed onboarding or KYC not approved
  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.id) {
        navigate({ to: "/" });
        return;
      }
      try {
        const kyc = await getKycStatus(user.id);
        if (kyc?.status !== "approved") {
          navigate({ to: "/home" });
          return;
        }
        const onboardingDone = await getOnboardingStatus(user.id);
        if (onboardingDone) {
          navigate({ to: "/home" });
          return;
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [user, navigate]);

  // Hero slides
  const heroSlides: Slide[] = [
    {
      title: "Welcome, Hero! 🦸",
      description:
        "You've chosen to be a Hero. Your kindness can change lives. Let's show you how Givethra works.",
      icon: <Heart className="h-12 w-12 text-primary" />,
      color: "from-primary/20 to-primary/5",
    },
    {
      title: "Browse Verified Cases",
      description:
        "Every case on Givethra is verified by our team. You can browse real people with real needs.",
      icon: <Users className="h-12 w-12 text-primary" />,
      color: "from-blue-200 to-blue-50",
    },
    {
      title: "Unlock a Case",
      description:
        "When you find a case you want to support, tap Unlock. Your first 3 unlocks are completely FREE!",
      icon: <Unlock className="h-12 w-12 text-primary" />,
      color: "from-purple-200 to-purple-50",
    },
    {
      title: "Choose Your Help Type",
      description:
        "You can either pay the institute directly (Direct Help) or contribute to a fundraising pool (Contribution).",
      icon: <HandCoins className="h-12 w-12 text-primary" />,
      color: "from-amber-200 to-amber-50",
    },
    {
      title: "Submit Proof",
      description:
        "After helping, submit your payment proof and TXN number. Givethra will verify and complete the case.",
      icon: <CheckCircle2 className="h-12 w-12 text-primary" />,
      color: "from-green-200 to-green-50",
    },
    {
      title: "Track Your Impact",
      description:
        "All your help is tracked in 'My Help'. You can see your contributions, direct helps, and unlock history.",
      icon: <FileText className="h-12 w-12 text-primary" />,
      color: "from-indigo-200 to-indigo-50",
    },
    {
      title: "Earn Hero Badges",
      description:
        "Unlock cases to become a Newborn Hero. Contribute to become a Young Hero. Direct Help makes you a Hero. Do all three to become a Super Hero!",
      icon: <Award className="h-12 w-12 text-primary" />,
      color: "from-yellow-200 to-yellow-50",
    },
    {
      title: "You're Ready! 🚀",
      description:
        "Now you know how to help. Browse cases and start changing lives today. Remember: even a small help can make a big difference.",
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      color: "from-green-200 to-green-50",
    },
  ];

  // Requester slides
  const requesterSlides: Slide[] = [
    {
      title: "Welcome! 🤲",
      description:
        "You've chosen to seek help. You are not alone. Givethra connects you with verified Heroes who care.",
      icon: <HandHelping className="h-12 w-12 text-primary" />,
      color: "from-primary/20 to-primary/5",
    },
    {
      title: "Complete Your KYC",
      description:
        "Before you can submit a case, you need to complete KYC. This helps us verify that you are a real person.",
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      color: "from-blue-200 to-blue-50",
    },
    {
      title: "Submit Your Case",
      description:
        "Fill in all details about your need. Upload your bill, take a selfie, and record a video explaining your situation.",
      icon: <FileText className="h-12 w-12 text-primary" />,
      color: "from-purple-200 to-purple-50",
    },
    {
      title: "Your First Case is FREE",
      description:
        "Your first case is completely FREE. After that, a 1 credit listing fee applies.",
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      color: "from-amber-200 to-amber-50",
    },
    {
      title: "Wait for Review",
      description:
        "Our team reviews your case. If everything is verified, your case will be approved and shown to Heroes.",
      icon: <CheckCircle2 className="h-12 w-12 text-primary" />,
      color: "from-green-200 to-green-50",
    },
    {
      title: "Heroes Will Help",
      description:
        "When Heroes unlock and help your case, you'll receive direct support. You'll get an affidavit as proof.",
      icon: <Heart className="h-12 w-12 text-primary" />,
      color: "from-rose-200 to-rose-50",
    },
    {
      title: "Share Your Feedback",
      description:
        "After your case is completed, you must share a feedback video (60 seconds) within 24 hours. This builds trust for future Heroes.",
      icon: <Users className="h-12 w-12 text-primary" />,
      color: "from-indigo-200 to-indigo-50",
    },
    {
      title: "You're Ready! 🚀",
      description:
        "Now you know how to seek help. Submit your case and wait for Heroes to support you. Remember: you are not alone.",
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      color: "from-green-200 to-green-50",
    },
  ];

  const slides = role === "hero" ? heroSlides : requesterSlides;
  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  const goToNext = async () => {
    if (isLastSlide) {
      // Mark onboarding as completed
      try {
        if (user?.id) {
          await setOnboardingStatus(user.id, true);
        }
      } catch (err) {
        console.error("Failed to update onboarding status:", err);
      }
      navigate({ to: "/home" });
    } else {
      setCurrentSlide(currentSlide + 1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  };

  const goToPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isLastSlide]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-muted h-1 fixed top-0 left-0 z-50">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pb-24 pt-8 px-4 max-w-2xl mx-auto w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center text-sm text-muted-foreground">
              {currentSlide + 1} / {totalSlides}
            </div>

            <div className="flex justify-center">
              <div
                className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center`}
              >
                {slides[currentSlide].icon}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
              {slides[currentSlide].title}
            </h1>

            <p className="text-lg text-muted-foreground text-center max-w-md mx-auto leading-relaxed">
              {slides[currentSlide].description}
            </p>

            {currentSlide === 2 && role === "hero" && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-center">
                💡 <strong>Free tip:</strong> Your first 3 unlocks are FREE. After that, 1 credit per unlock.
              </div>
            )}

            {currentSlide === 3 && role === "hero" && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-center">
                💡 <strong>Direct Help:</strong> Pay the institute directly (1 credit). <br />
                <strong>Contribution:</strong> Contribute any amount to a fundraising pool (1 credit).
              </div>
            )}

            {currentSlide === 6 && role === "requester" && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 text-center">
                ⚠️ <strong>Important:</strong> You must submit a feedback video within 24 hours after your case is completed. Failure to do so will suspend your account.
              </div>
            )}

            {currentSlide === 3 && role === "requester" && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 text-center">
                🎉 <strong>Good news:</strong> Your first case is FREE! After that, it's 1 credit per case.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentSlide === 0}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          <div className="flex-1 flex justify-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : index < currentSlide
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={goToNext}
            className="shrink-0 gap-1 bg-primary hover:bg-primary/90"
          >
            {isLastSlide ? (
              <>Get Started <ArrowRight className="h-4 w-4 ml-1" /></>
            ) : (
              <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground mt-2">
          {isLastSlide
            ? "Tap 'Get Started' to begin your journey!"
            : "Use arrow keys or tap Next/Back to navigate"}
        </p>
      </div>
    </div>
  );
}
