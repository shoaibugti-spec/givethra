import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Shield, Lock, Heart, CheckCircle2, FileText, Video, Building2,
  HandCoins, Users, Award, Globe, Sparkles, UserCheck, Coins, Unlock,
} from "lucide-react";

const PACKS = [
  { credits: 1, price: 1, name: "Starter Hero", desc: "Best for first-time Heroes." },
  { credits: 5, price: 5, name: "Helping Hand", desc: "Help multiple families." },
  { credits: 10, price: 10, name: "Community Hero", desc: "Support more verified cases.", popular: true },
  { credits: 25, price: 25, name: "Hope Builder", desc: "Ideal for regular Heroes." },
  { credits: 50, price: 50, name: "Guardian Hero", desc: "Create greater humanitarian impact." },
  { credits: 100, price: 100, name: "Global Hero", desc: "For organizations and generous supporters." },
];

export default function BecomeHeroPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function chooseCredits(credits: number) {
    try { sessionStorage.setItem("givethra_selected_credits", String(credits)); } catch {}
    if (isAuthenticated) navigate({ to: "/wallet" });
    else navigate({ to: "/sign-up" });
  }

  function goSignIn() {
    if (isAuthenticated) navigate({ to: "/cases" });
    else navigate({ to: "/sign-in" });
  }

  return (
    <Layout>
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
            <Sparkles className="h-4 w-4" /> Become a Hero
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Help Real People.<br />
            <span className="text-primary">Protect Their Dignity.</span><br />
            Change Lives.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every verified case on Givethra represents a real person facing a genuine hardship.
            To protect their dignity and privacy, sensitive information is only available to verified Heroes.
            Become a Hero today and make a real impact.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-2xl" onClick={goSignIn}>
              <Heart className="h-5 w-5 mr-2" /> Become a Hero
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-2xl" onClick={() => navigate({ to: "/cases" })}>
              Browse Verified Cases
            </Button>
          </div>

          {/* ====== FREE HELP ANNOUNCEMENT - TOP OF PAGE ====== */}
          <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-400 p-4 text-sm text-green-700 dark:text-green-300 text-center max-w-xl mx-auto font-medium">
            🎉 Your first <strong>3 helps are FREE</strong>! After that, 1 credit per help.
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: "1", icon: <UserCheck className="h-6 w-6" />, t: "Create Hero Account", d: "Sign in securely with Google and complete your profile." },
            { n: "2", icon: <Coins className="h-6 w-6" />, t: "Choose Hero Credits", d: "Deposit securely. Credits let you unlock verified cases (1 credit = 1 case)." },
            { n: "3", icon: <Unlock className="h-6 w-6" />, t: "Unlock Verified Cases", d: "Access private documents, bills, verification video and payment reference." },
            { n: "4", icon: <Building2 className="h-6 w-6" />, t: "Help Directly", d: "Pay the school, hospital or utility company directly — or contribute with others." },
          ].map(c => (
            <div key={c.n} className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{c.icon}</div>
                <span className="text-3xl font-bold text-primary/20">{c.n}</span>
              </div>
              <h3 className="font-bold text-foreground">{c.t}</h3>
              <p className="text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREDIT PACKAGES */}
      <section className="bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Choose Your Hero Credits</h2>
          <p className="text-center text-muted-foreground mb-2">One Credit unlocks one verified case. 1 Credit = $1.</p>

          {/* ====== FREE HELP REMINDER - ABOVE CREDIT PACKAGES ====== */}
          <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-3 text-sm text-green-700 dark:text-green-300 text-center max-w-2xl mx-auto mb-6">
            💚 Remember: Your first <strong>3 unlocks are FREE</strong> — you don't need credits for them!
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PACKS.map(p => (
              <div key={p.credits} className={`relative rounded-2xl border bg-card p-6 shadow-sm space-y-3 ${p.popular ? "border-primary border-2" : ""}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                )}
                <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-primary">${p.price}</span>
                  <span className="text-sm text-muted-foreground pb-1">{p.credits} Credit{p.credits > 1 ? "s" : ""}</span>
                </div>
                <p className="text-sm text-muted-foreground">Unlock {p.credits} Case{p.credits > 1 ? "s" : ""}. {p.desc}</p>
                <Button className="w-full rounded-xl" variant={p.popular ? "default" : "outline"} onClick={() => chooseCredits(p.credits)}>
                  Choose {p.name.split(" ")[0]}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            After choosing, you'll go to your secure Wallet to deposit. Credits are added after quick verification, then you can unlock cases immediately.
          </p>
        </div>
      </section>

      {/* WHY UNLOCK */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why do verified cases require Hero Credits?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <Shield className="h-5 w-5" />, t: "Protect beneficiary privacy", d: "Bills, documents and videos are personal. Only serious Heroes see them." },
            { icon: <Users className="h-5 w-5" />, t: "Prevent fake viewers", d: "A small fee stops curious visitors from exposing someone's hardship." },
            { icon: <Lock className="h-5 w-5" />, t: "Reduce fraud", d: "Verified Heroes and verified cases keep both sides safe." },
            { icon: <FileText className="h-5 w-5" />, t: "Support verification costs", d: "Every case is checked: documents, 1Bill references, calls to institutes." },
            { icon: <Heart className="h-5 w-5" />, t: "Keep the platform sustainable", d: "Credits keep Givethra running — ad-free and dignified." },
            { icon: <CheckCircle2 className="h-5 w-5" />, t: "Your donation stays full", d: "Hero Credits are not donations. Your payment goes directly to the verified institution." },
          ].map(c => (
            <div key={c.t} className="rounded-2xl border bg-card p-5 shadow-sm space-y-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{c.icon}</div>
              <h3 className="font-semibold text-foreground text-sm">{c.t}</h3>
              <p className="text-xs text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU SEE AFTER UNLOCK */}
      <section className="bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">What You'll See After Unlocking</h2>
          <div className="rounded-2xl border bg-card p-6 shadow-sm grid sm:grid-cols-2 gap-3">
            {[
              "Original verified documents",
              "Original bills / fee challans",
              "Givethra verification report",
              "Beneficiary's video statement",
              "Institution / company information",
              "1Bill consumer & reference numbers",
              "Payment instructions",
              "Progress & help history",
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO WAYS TO HELP */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Two Ways To Help</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-sm space-y-3">
            <div className="h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center"><Building2 className="h-6 w-6" /></div>
            <h3 className="font-bold text-lg">Option 1 — Direct Help</h3>
            <p className="text-sm text-muted-foreground">
              Pay the school, hospital, utility company or landlord directly using the verified reference (1Bill consumer number, fee challan).
              Upload your payment receipt, the beneficiary confirms, and the case closes with your named affidavit.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-sm space-y-3">
            <div className="h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center"><HandCoins className="h-6 w-6" /></div>
            <h3 className="font-bold text-lg">Option 2 — Community Contribution</h3>
            <p className="text-sm text-muted-foreground">
              Can't pay the full amount? Contribute any amount — Rs 500, Rs 1000, or more.
              When the fundraising target is reached, Givethra pays the institution directly and closes the case.
            </p>
          </div>
        </div>
      </section>

      {/* HERO BENEFITS */}
      <section className="bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Your Hero Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: <Award className="h-6 w-6" />, t: "Verified Hero Badge" },
              { icon: <Users className="h-6 w-6" />, t: "People Helped" },
              { icon: <CheckCircle2 className="h-6 w-6" />, t: "Cases Completed" },
              { icon: <HandCoins className="h-6 w-6" />, t: "Amount Contributed" },
              { icon: <Globe className="h-6 w-6" />, t: "Countries Reached" },
              { icon: <FileText className="h-6 w-6" />, t: "Signed Affidavits" },
            ].map(b => (
              <div key={b.t} className="rounded-2xl border bg-card p-5 shadow-sm flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{b.icon}</div>
                <p className="text-sm font-medium text-foreground">{b.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY PROMISE */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="rounded-2xl bg-primary text-white p-8 text-center space-y-4 shadow-lg">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto"><Lock className="h-7 w-7" /></div>
          <h2 className="text-2xl font-bold">Our Privacy Promise</h2>
          <p className="text-white/85 max-w-xl mx-auto text-sm leading-relaxed">
            Every beneficiary deserves dignity. Public visitors only see a limited case preview —
            story, category, city and amount. Private documents, videos and payment information
            are only available to verified Heroes after unlocking a case.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16 text-center space-y-5">
        <h2 className="text-3xl font-bold">Become Someone's Hero Today</h2>
        <p className="text-muted-foreground">One small act of kindness can completely change someone's life.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-2xl" onClick={goSignIn}>
            {isAuthenticated ? "Browse Verified Cases" : "Continue to Sign In"}
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-2xl" onClick={() => navigate({ to: "/cases" })}>
            Browse Verified Cases
          </Button>
        </div>
      </section>
    </Layout>
  );
}
