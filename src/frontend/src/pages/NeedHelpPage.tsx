// src/pages/NeedHelpPage.tsx
// Premium + Globalized NeedHelpPage — currencies converted per user country.

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getKycStatus, getProfile } from "@/lib/api";
import { getCountryProfile, CURRENCY_SYMBOLS, scaleFromPKR } from "@/lib/countryProfiles";
import { motion } from "framer-motion";
import {
  Gift, ShieldCheck, FileText, Camera, Video, CheckCircle2, Coins,
  Lock, Heart, Zap, Building2, Sparkles, Clock, ChevronDown,
  Zap as Bolt, Flame, Droplets, Home, GraduationCap, BookOpen,
  Stethoscope, Pill, ShoppingBasket, Baby, Users, Accessibility,
  HeartHandshake, Briefcase, Hammer, Wheat, CreditCard, Siren,
  AlertTriangle, ShieldAlert, Unlock, BadgeCheck, Globe, TrendingUp,
} from "lucide-react";

export default function NeedHelpPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState<string>("PKR");

  // Load user's country → determine currency
  useEffect(() => {
    if (!user?.id) return;
    getProfile(user.id).then((profile) => {
      const profileData = getCountryProfile(profile?.country || "");
      setUserCurrency(profileData.currency || "USD");
    }).catch(() => setUserCurrency("USD"));
  }, [user?.id]);

  // 🌍 Format fixed amounts in user's local currency
  function money(amountInPKR: number) {
    if (userCurrency === "PKR") return `Rs ${Number(amountInPKR || 0).toLocaleString()}`;
    const converted = scaleFromPKR(Number(amountInPKR || 0), userCurrency);
    const symbol = CURRENCY_SYMBOLS[userCurrency] ?? userCurrency;
    return `${symbol} ${converted.toLocaleString()}`;
  }

  async function goSubmit() {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { role: "requester", redirect: "/need-help" } });
      return;
    }
    try {
      const kyc = await getKycStatus(user!.id);
      const status = String(kyc?.status || "none").trim().toLowerCase();
      if (status !== "approved") {
        try { sessionStorage.setItem("givethra_kyc_return_to", "/need-help"); } catch {}
      }
      navigate({ to: status === "approved" ? "/onboarding-submit" : "/kyc" });
    } catch {
      try { sessionStorage.setItem("givethra_kyc_return_to", "/need-help"); } catch {}
      navigate({ to: "/kyc" });
    }
  }

  type CategoryGuide = {
    key: string;
    icon: React.ReactNode;
    amountLabel: string;
    amountBadge: "fixed" | "verified" | "max" | "percent";
    documents: string[];
    tip?: string;
  };

  // 🌍 All amounts now use money() so they display in user's currency
  const CATEGORY_GUIDES: CategoryGuide[] = [
    {
      key: "Electricity Bill",
      icon: <Bolt className="h-5 w-5" />,
      amountLabel: "1 month's verified bill amount",
      amountBadge: "verified",
      documents: [
        "Select your company from the list (e.g. K-Electric, LESCO, etc.)",
        "Consumer / Reference Number",
        "Bill Owner Name — exactly as printed on the bill",
        "Clear photo of the bill (amount and due date must be clearly visible)",
        "Property Ownership: Owned (owner's CNIC) or Rented (Rent Agreement + Landlord's CNIC)",
        "Job Status Proof: Salary Slip + Bank Statement (if employed) or Bank Statement only (if unemployed)",
      ],
      tip: "One case = one bill only. Submit before the due date passes.",
    },
    {
      key: "Gas Bill",
      icon: <Flame className="h-5 w-5" />,
      amountLabel: "1 month's verified bill amount",
      amountBadge: "verified",
      documents: [
        "Select your gas company from the list",
        "Consumer / Reference Number",
        "Bill Owner Name",
        "Clear photo of the bill",
        "Property Ownership proof (Owned / Rented)",
        "Job Status Proof",
      ],
      tip: "One case = one bill only. Submit before the due date passes.",
    },
    {
      key: "Water Bill",
      icon: <Droplets className="h-5 w-5" />,
      amountLabel: "1 month's verified bill amount",
      amountBadge: "verified",
      documents: [
        "Select your water company from the list",
        "Consumer / Reference Number",
        "Bill Owner Name",
        "Clear photo of the bill",
        "Property Ownership proof (Owned / Rented)",
        "Job Status Proof",
      ],
      tip: "One case = one bill only. Submit before the due date passes.",
    },
    {
      key: "House Rent",
      icon: <Home className="h-5 w-5" />,
      amountLabel: "1 month's verified rent",
      amountBadge: "verified",
      documents: [
        "Clear photo of the Rental Agreement / Contract",
        "Landlord's CNIC",
        "Landlord's (Receiver's) full payment details: name, contact number, bank name, account number, address",
        "Job Status Proof",
      ],
      tip: "This category is only for tenants (rented property).",
    },
    {
      key: "School, College & University Fees",
      icon: <GraduationCap className="h-5 w-5" />,
      amountLabel: "1 student's 1-month verified fee",
      amountBadge: "verified",
      documents: [
        "Select the institute from the list (or add it manually)",
        "Student's full name, Father's name, Roll No / Registration No",
        "Fee Challan / Voucher (amount and due date must be clearly visible)",
        "Student's B-Form / CNIC / School ID",
        "Job Status Proof",
      ],
      tip: "One case = one student's one-month fee only.",
    },
    {
      key: "Education, Books & Admission",
      icon: <BookOpen className="h-5 w-5" />,
      amountLabel: "Verified cost of Admission Fee / Books / Uniform",
      amountBadge: "verified",
      documents: [
        "First select: Admission Fee, Books, or Uniform",
        "Admission: Offer Letter / Merit List, Fee Challan, Student ID",
        "Books: Books List / Quotation from the shop, Student ID",
        "Uniform: Uniform Quotation from the shop, Student ID, list of required items",
        "Job Status Proof",
      ],
    },
    {
      key: "Medical & Treatment",
      icon: <Stethoscope className="h-5 w-5" />,
      amountLabel: "Actual amount from a verified treatment bill",
      amountBadge: "verified",
      documents: [
        "Select the hospital from the list",
        "Patient's name and details of the Illness / Treatment",
        "Clear photo of the Hospital Bill / Medical Receipt",
        "Doctor's handwritten or letterhead prescription / report",
        "Job Status Proof",
      ],
      tip: "One case = one patient only.",
    },
    {
      key: "Medicines",
      icon: <Pill className="h-5 w-5" />,
      amountLabel: "Verified prescription / medicine cost",
      amountBadge: "verified",
      documents: [
        "Patient's name and Illness / Condition",
        "Doctor's Prescription / Report",
        "Photo of the Prescription / Medicine Estimate",
        "Payment Receiver's (Pharmacy / Shop Owner's) details: name, contact, bank, account, address",
        "Job Status Proof",
      ],
    },
    {
      key: "Food & Groceries",
      icon: <ShoppingBasket className="h-5 w-5" />,
      amountLabel: `Fixed ${money(6000)} per family`,
      amountBadge: "fixed",
      documents: [
        "Shop Owner's (Receiver's) payment details: name, contact, shop name, bank, account, address",
        "Job Status Proof",
      ],
    },
    {
      key: "Child Support",
      icon: <Baby className="h-5 w-5" />,
      amountLabel: `Fixed ${money(2000)} (stipend)`,
      amountBadge: "fixed",
      documents: [
        "Parents' status: Both alive / Father passed away / Mother passed away / Both passed away",
        "If the father has passed away: Father's Death Certificate",
        "If the mother has passed away: Mother's Death Certificate",
        "Job Status Proof",
        "Identity documents based on gender/marital status — FRC, Nikah Nama, or B-Form",
      ],
    },
    {
      key: "Widow & Elderly Support",
      icon: <Users className="h-5 w-5" />,
      amountLabel: `Fixed ${money(3000)} (stipend)`,
      amountBadge: "fixed",
      documents: [
        "You must select Gender = Female and Marital Status = Widow",
        "Husband's Death Certificate",
        "Nikah Nama (marriage certificate with the deceased husband)",
        "Family Registration Certificate (FRC)",
        "Job Status Proof",
      ],
    },
    {
      key: "Orphan Support",
      icon: <HeartHandshake className="h-5 w-5" />,
      amountLabel: `Fixed ${money(3000)} (stipend)`,
      amountBadge: "fixed",
      documents: [
        "Orphan status verification documents",
        "Orphan Proof (Parent's Death Certificate)",
        "Family Registration Certificate (FRC)",
        "Job Status Proof",
      ],
    },
    {
      key: "Disability Support",
      icon: <Accessibility className="h-5 w-5" />,
      amountLabel: `Fixed ${money(3000)} stipend, OR a verified product/treatment cost`,
      amountBadge: "fixed",
      documents: [
        "CNIC that marks the disability (or a Disability Certificate)",
        "Clear photo of the disability",
        "Select the type of disability",
        "Then choose one of three options:",
        "— Product: Shop name + contact, Shop Quotation/Receipt",
        "— Treatment: Hospital, Treatment Amount, Bill Expiry Date, Patient/Bill Number",
        "— Monthly Stipend: Bank/Account Title and Number",
      ],
    },
    {
      key: "Marriage Support",
      icon: <HeartHandshake className="h-5 w-5" />,
      amountLabel: "Based on verified need",
      amountBadge: "verified",
      documents: [
        "Your relation to the person getting married",
        "If the relation is not 'Myself', Relation Proof (B-Form/FRC) is required",
        "Marriage Expenses Quotation / List",
        "Payment Receiver's (Marriage Vendor's) full details",
        "Job Status Proof",
      ],
    },
    {
      key: "Business / Work Help",
      icon: <Briefcase className="h-5 w-5" />,
      amountLabel: "Based on verified need",
      amountBadge: "fixed",
      documents: [
        "Business Equipment / Supply Quotation",
        "Business Proof (License / Registration)",
        "Payment Receiver's (Business Owner's / Supplier's) full details",
        "Job Status Proof",
      ],
    },
    {
      key: "Home Repair",
      icon: <Hammer className="h-5 w-5" />,
      amountLabel: "Based on verified need",
      amountBadge: "fixed",
      documents: [
        "Property Ownership: Owned (owner's CNIC) or Rented (Rent Agreement + Landlord's CNIC)",
        "If using a contractor: Contractor Agreement / Work Order",
        "Payment Receiver's (Contractor's / Material Shop's) full details",
        "Job Status Proof",
      ],
    },
    {
      key: "Funeral Expenses",
      icon: <Users className="h-5 w-5" />,
      amountLabel: "Based on verified need",
      amountBadge: "fixed",
      documents: [
        "Your relation to the deceased (father/mother/husband/wife/child/other)",
        "For a spouse: Nikah Nama — for a parent/child: B-Form / FRC",
        "Payment Receiver's (Funeral Service Provider's) full details",
        "Job Status Proof",
      ],
    },
    {
      key: "Livestock / Farming",
      icon: <Wheat className="h-5 w-5" />,
      amountLabel: "Based on verified need",
      amountBadge: "fixed",
      documents: [
        "Livestock / Farming Equipment Quotation",
        "Proof of livestock / farming (photo or document)",
        "Payment Receiver's (Supplier's / Farm Owner's) full details",
        "Job Status Proof",
      ],
    },
    {
      key: "Debt Relief",
      icon: <CreditCard className="h-5 w-5" />,
      amountLabel: `5% of total debt, maximum ${money(25000)}`,
      amountBadge: "percent",
      documents: [
        "Total Outstanding Debt Amount (5% is calculated automatically)",
        "Creditor's (Payment Receiver's) full details",
        "Job Status Proof",
      ],
      tip: "You don't enter the amount yourself — the system calculates 5% once you enter the total debt.",
    },
    {
      key: "Emergency Help",
      icon: <Siren className="h-5 w-5" />,
      amountLabel: `Fixed ${money(3000)}`,
      amountBadge: "fixed",
      documents: [
        "Write the full details of the emergency in the description",
        "Payment Receiver's full details",
        "Job Status Proof",
      ],
    },
  ];

  const badgeStyle: Record<CategoryGuide["amountBadge"], string> = {
    fixed: "bg-teal-100 text-teal-700",
    verified: "bg-blue-100 text-blue-700",
    max: "bg-amber-100 text-amber-700",
    percent: "bg-purple-100 text-purple-700",
  };
  const badgeText: Record<CategoryGuide["amountBadge"], string> = {
    fixed: "Fixed Amount",
    verified: "Verified Bill/Need",
    max: "Maximum Limit",
    percent: "Percentage Based",
  };

  return (
    <Layout>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-lg">
            <Gift className="h-4 w-4" /> Your First Case is 100% FREE
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Need Help?<br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">Submit Your Case Today.</span><br />
            Get Real, Direct Support.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-teal-100 md:text-lg">
            Electricity bill, school fees, medical treatment, or any genuine hardship —
            share your story with Givethra. After verification, Heroes help you directly.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={goSubmit} className="h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-base font-black text-amber-950 shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95">
              <Heart className="mr-2 h-5 w-5" fill="currentColor" /> Submit My Case — FREE
            </Button>
            <a href="#category-guide" className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
              View Full Guidelines
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 rounded-2xl border border-yellow-300/40 bg-yellow-400/15 px-4 py-3 text-sm font-semibold text-yellow-100 backdrop-blur-md">
            <Globe className="h-5 w-5 shrink-0 text-yellow-300" />
            <span>Amounts shown in <strong className="text-yellow-200">{userCurrency}</strong> for your country</span>
          </motion.div>

          <p className="mx-auto mt-4 max-w-md text-xs font-medium text-teal-100/80">👇 Before submitting, review your category's guideline — it lowers the chance of rejection.</p>
        </div>
      </section>

      {/* ===== FIRST CASE FREE HIGHLIGHT ===== */}
      <section className="bg-slate-50 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 p-8 text-center text-white shadow-2xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-yellow-400/20 blur-2xl" />
            <div className="relative">
              <Sparkles className="mx-auto h-10 w-10 text-yellow-300" />
              <h2 className="mt-3 font-display text-2xl font-black md:text-3xl">🎉 Your First Case is Completely FREE</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-teal-100 md:text-base">
                No fee, no cost. Complete your KYC, submit your case with documents, and it goes live for Heroes — at zero cost.
                After your first case, listing a new case costs just <strong className="text-yellow-200">1 Credit</strong>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORY GUIDE ===== */}
      <section className="bg-white py-16" id="category-guide">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
              <ShieldCheck className="h-3 w-3" /> Full Guideline
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Category Guidelines</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-slate-500">
              Tap any category to see required documents and amount limits. Please read fully before submitting — an incomplete case is likely to be rejected.
            </p>
          </div>

          <div className="space-y-3">
            {CATEGORY_GUIDES.map(c => {
              const isOpen = openCat === c.key;
              return (
                <div key={c.key} className={`overflow-hidden rounded-2xl border bg-white transition-all ${isOpen ? "border-teal-300 shadow-lg" : "border-slate-200 shadow-sm hover:border-teal-200"}`}>
                  <button type="button" onClick={() => setOpenCat(isOpen ? null : c.key)} className="flex w-full items-center gap-3 p-4 text-left">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isOpen ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md" : "bg-teal-50 text-teal-600"}`}>
                      {c.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900">{c.key}</p>
                      <p className="truncate text-xs font-medium text-slate-500">{c.amountLabel}</p>
                    </div>
                    <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider sm:inline-block ${badgeStyle[c.amountBadge]}`}>
                      {badgeText[c.amountBadge]}
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 p-4">
                      <div className="inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider sm:hidden ${badgeStyle[c.amountBadge]}">
                        {badgeText[c.amountBadge]}
                      </div>
                      <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-teal-700"><TrendingUp className="h-3.5 w-3.5" /> Amount</p>
                        <p className="text-sm font-bold text-slate-900">{c.amountLabel}</p>
                      </div>
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-black text-slate-800"><FileText className="h-3.5 w-3.5" /> Required Documents / Steps</p>
                        <ul className="space-y-1.5">
                          {c.documents.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {c.tip && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{c.tip}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Personal Identity Documents */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <p className="font-black text-slate-900">Common to Every Case: Personal Identity Documents</p>
            </div>
            <p className="text-xs font-medium text-slate-500">Based on your gender and marital status:</p>
            <ul className="mt-2 grid gap-2 text-xs font-medium text-slate-600 sm:grid-cols-2">
              {[
                "Single (Male/Female): Family Registration Certificate (FRC)",
                "Married: Nikah Nama + FRC",
                "Widow: Deceased spouse's Death Certificate + Nikah Nama + FRC",
                "Divorced: Court Divorce Certificate + Nikah Nama + FRC",
                "Orphan (Female/Child): Parent's Death Certificate",
                "Child: B-Form + FRC",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 text-xs font-medium text-slate-600 sm:grid-cols-2">
              {[
                { icon: Briefcase, text: "Employed: Last 6 months' Salary Slip + Bank Statement" },
                { icon: Briefcase, text: "Unemployed: Last 6 months' Bank / EasyPaisa / JazzCash Statement" },
                { icon: Camera, text: "Live Selfie (for identity verification)" },
                { icon: Video, text: "60-second Video explaining your situation" },
              ].map(({ icon: Icon, text }) => (
                <p key={text} className="flex items-start gap-2 rounded-lg bg-teal-50/50 p-2">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                  <span>{text}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW SUBMISSION WORKS ===== */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
              <Zap className="h-3 w-3" /> Simple Steps
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">How Case Submission Works</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "1. Complete KYC", d: "Sign in and verify your identity — CNIC, live selfie. This protects you and builds Heroes' trust.", color: "from-blue-500 to-sky-500" },
              { icon: FileText, t: "2. Choose Your Category", d: "Electricity, gas, water, school fees, medical, and 15+ more — each with its own simple guided form.", color: "from-teal-500 to-emerald-500" },
              { icon: Building2, t: "3. Select Institute / Bill", d: "For bills and schools, just pick from our verified list and enter your reference number.", color: "from-amber-400 to-orange-500" },
              { icon: Camera, t: "4. Upload Proof", d: "Bill/challan photo, and proof of income — this keeps every case authentic.", color: "from-violet-500 to-purple-500" },
              { icon: Video, t: "5. Live Selfie & Video", d: "Record a short video explaining your situation in your own words — Heroes connect with real stories.", color: "from-pink-500 to-rose-500" },
              { icon: CheckCircle2, t: "6. Givethra Verifies", d: "Our team reviews your documents and reference details before your case goes live.", color: "from-teal-500 to-emerald-500" },
            ].map((c, i) => (
              <motion.div key={c.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-sm font-black text-slate-900">{c.t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING / CREDITS ===== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
              <Coins className="h-3 w-3" /> Cost
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">What Does It Cost?</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl border-2 border-teal-400 bg-gradient-to-br from-teal-50 to-emerald-50 p-6 text-center shadow-lg">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-200/40 blur-2xl" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg">
                  <Gift className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-display text-xl font-black text-slate-900">First Case</h3>
                <p className="mt-2 font-display text-4xl font-black text-teal-700">FREE</p>
                <p className="mt-2 text-sm font-medium text-slate-600">Every new user's very first case is completely free — no credits, no charge.</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-950 shadow-lg">
                  <Coins className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-display text-xl font-black text-slate-900">Next Cases</h3>
                <p className="mt-2 font-display text-4xl font-black text-amber-600">1 Credit</p>
                <p className="mt-2 text-sm font-medium text-slate-600">After your first case, each new case listing costs 1 Credit ($1).</p>
              </div>
            </motion.div>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-center text-xs font-medium text-slate-500">
            This listing fee is separate from your case amount. 100% of what Heroes contribute or pay goes toward your bill or institute — not to Givethra.
          </p>

          {/* Rejection/Suspension Warning */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <h3 className="font-display text-lg font-black text-red-700">⚠️ Important — Please Read</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm font-medium text-red-800/90">
              {[
                { n: "1", text: <>Every new account's <strong>first case is FREE</strong>. After that, each case's listing fee is <strong>1 Credit</strong>.</> },
                { n: "2", text: <>If your cases are rejected <strong>3 or more times</strong>, free-case access is disabled — after that, every case will require a credit.</> },
                { n: "3", text: <>If a total of <strong>5 cases are rejected</strong>, your account will be <strong>suspended</strong>.</> },
                { n: "4", icon: Unlock, text: <>Unlocking a suspended account requires <strong>5 Credits</strong>.</> },
              ].map(({ n, icon: Icon, text }) => (
                <li key={n} className="flex items-start gap-2">
                  {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> : <span className="shrink-0 font-black text-red-600">{n}.</span>}
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-red-200 bg-white p-3 text-xs font-medium text-slate-700">
              💡 <strong>How to avoid this:</strong> carefully read your category's guideline above, attach all required documents clearly and completely — this greatly reduces the chance of rejection.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PRIVACY ===== */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 p-8 text-center text-white shadow-2xl md:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-yellow-400/20 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-black md:text-3xl">Your Privacy is Protected</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-teal-100 md:text-base">
                The public only sees a short story, category, city, and amount needed. Your bills, income proof, and personal documents are never shown publicly — they're reviewed by Givethra and only summarized for verified Heroes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== URGENCY NOTE ===== */}
      <section className="bg-white pb-6 pt-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
            <Clock className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-display text-lg font-black text-amber-900">Submit Bills Before They're Due</h3>
              <p className="mt-1 text-sm font-medium text-amber-800/90">
                For bill-based cases, enter your due date honestly. This helps Heroes see how urgent your case is — and Givethra makes sure the amount matches your real bill, so Heroes trust every case they help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 py-16 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-yellow-300" /> Start Today
          </div>
          <h2 className="mt-4 font-display text-3xl font-black tracking-tight md:text-4xl">Ready to Get Help?</h2>
          <p className="mt-3 text-teal-100">Your first case is FREE — it takes just a few minutes.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={goSubmit} className="h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-base font-black text-amber-950 shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95">
              <Zap className="mr-2 h-5 w-5" /> {isAuthenticated ? "Submit My Case Now" : "Sign Up & Submit — FREE"}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
