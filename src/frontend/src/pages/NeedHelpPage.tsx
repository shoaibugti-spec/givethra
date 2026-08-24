import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Gift, ShieldCheck, FileText, Camera, Video, CheckCircle2, Coins,
  Lock, Heart, Zap, Building2, Sparkles, Clock, ChevronDown,
  Zap as Bolt, Flame, Droplets, Home, GraduationCap, BookOpen,
  Stethoscope, Pill, ShoppingBasket, Baby, Users, Accessibility,
  HeartHandshake, Briefcase, Hammer, Wheat, CreditCard, Siren,
  AlertTriangle, ShieldAlert, Unlock, BadgeCheck,
} from "lucide-react";

export default function NeedHelpPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openCat, setOpenCat] = useState<string | null>(null);

  function goSubmit() {
    if (isAuthenticated) navigate({ to: "/submit-request" });
    else navigate({ to: "/sign-up" });
  }

  // ============================================================
  //  CATEGORY GUIDE DATA — matches CATEGORY_LIMITS / CATEGORIES
  //  and document requirements from the Submit Case form
  // ============================================================
  type CategoryGuide = {
    key: string;
    icon: React.ReactNode;
    amountLabel: string;
    amountBadge: "fixed" | "verified" | "max" | "percent";
    documents: string[];
    tip?: string;
  };

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
      amountLabel: "Maximum Rs 12,000 per family",
      amountBadge: "max",
      documents: [
        "Shop Owner's (Receiver's) payment details: name, contact, shop name, bank, account, address",
        "Job Status Proof",
      ],
    },
    {
      key: "Child Support",
      icon: <Baby className="h-5 w-5" />,
      amountLabel: "Fixed Rs 6,000 (stipend)",
      amountBadge: "fixed",
      documents: [
        "Parents' status: Both alive / Father passed away / Mother passed away / Both passed away",
        "If the father has passed away: Father's Death Certificate",
        "If the mother has passed away: Mother's Death Certificate",
        "Job Status Proof",
        "Identity documents based on gender/marital status — FRC, Nikah Nama, or B-Form (see the 'Personal Identity Documents' section below)",
      ],
    },
    {
      key: "Widow & Elderly Support",
      icon: <Users className="h-5 w-5" />,
      amountLabel: "Fixed Rs 6,000 (stipend)",
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
      key: "Disability Support",
      icon: <Accessibility className="h-5 w-5" />,
      amountLabel: "Fixed Rs 6,000 stipend, OR a verified product/treatment cost",
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
      amountLabel: "Rs 8,000–20,000 (based on verified need)",
      amountBadge: "max",
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
      amountLabel: "Maximum Rs 18,000",
      amountBadge: "max",
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
      amountBadge: "verified",
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
      amountBadge: "verified",
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
      amountLabel: "5% of total debt, maximum Rs 25,000",
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
      amountLabel: "Based on verified need",
      amountBadge: "verified",
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
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-bold">
            <Gift className="h-4 w-4" /> Your First Case is 100% FREE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Need Help?<br />
            <span className="text-primary">Submit Your Case Today.</span><br />
            Get Real, Direct Support.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Whether it's an electricity bill, school fees, medical treatment, or any genuine hardship —
            share your story with Givethra. After a quick verification, verified Heroes will help you directly.
          </p>
          <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-2xl" onClick={goSubmit}>
            <Heart className="h-5 w-5 mr-2" /> Submit My Case — FREE
          </Button>
          <p className="text-xs text-muted-foreground">👇 Before submitting, please review your category's guideline below — it lowers the chance of your case being rejected.</p>
        </div>
      </section>

      {/* FIRST CASE FREE HIGHLIGHT */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 text-white p-8 text-center space-y-3 shadow-lg">
          <Sparkles className="h-10 w-10 mx-auto" />
          <h2 className="text-2xl md:text-3xl font-bold">🎉 Your First Case is Completely FREE</h2>
          <p className="text-white/90 max-w-xl mx-auto">
            No fee, no cost. Complete your KYC, submit your case with documents, and it goes live for Heroes — at zero cost to you.
            After your first case, listing a new case costs just <strong>1 Credit</strong>.
          </p>
        </div>
      </section>

      {/* ============================================================
          CATEGORY GUIDE — full amount + document rules per category
          ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-14" id="category-guide">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold">
            <ShieldCheck className="h-4 w-4" /> Full Guideline for Every Category
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Select Your Category to See What's Required</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Tap any category to see: how much assistance is possible and which documents are required.
            Please read this fully before submitting — an incomplete case is likely to be rejected.
          </p>
        </div>

        <div className="space-y-3">
          {CATEGORY_GUIDES.map(c => {
            const isOpen = openCat === c.key;
            return (
              <div key={c.key} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCat(isOpen ? null : c.key)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{c.key}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.amountLabel}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 hidden sm:inline-block ${badgeStyle[c.amountBadge]}`}>
                    {badgeText[c.amountBadge]}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <div className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full sm:hidden ${badgeStyle[c.amountBadge]}`}>
                      {badgeText[c.amountBadge]}
                    </div>
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                      <p className="text-xs font-semibold text-primary mb-1">💰 Amount</p>
                      <p className="text-sm text-foreground">{c.amountLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">📎 Required Documents / Steps</p>
                      <ul className="space-y-1.5">
                        {c.documents.map((d, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {c.tip && (
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-2.5 text-xs text-amber-700 flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{c.tip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* PERSONAL IDENTITY DOCUMENTS — universal, gender/marital based */}
        <div className="mt-6 rounded-2xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            <p className="font-bold text-sm">Common to Every Case: Personal Identity Documents</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Along with each category, the following documents are also required based on your gender and marital status:
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" /> Single (Male/Female): Family Registration Certificate (FRC)</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" /> Married: Nikah Nama + FRC</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" /> Widow: Deceased spouse's Death Certificate + Nikah Nama + FRC</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" /> Divorced: Court Divorce Certificate + Nikah Nama + FRC</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" /> Orphan (Female/Child): Parent's Death Certificate</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" /> Child: B-Form + FRC</li>
          </ul>
          <div className="pt-2 border-t border-border grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <p className="flex items-start gap-2"><Briefcase className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> Employed: Last 6 months' Salary Slip + Bank Statement</p>
            <p className="flex items-start gap-2"><Briefcase className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> Unemployed: Last 6 months' Bank / EasyPaisa / JazzCash Statement</p>
            <p className="flex items-start gap-2"><Camera className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> Live Selfie (for identity verification)</p>
            <p className="flex items-start gap-2"><Video className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> 60-second Video explaining your situation in your own words</p>
          </div>
        </div>
      </section>

      {/* HOW SUBMISSION WORKS */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How Case Submission Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <ShieldCheck className="h-6 w-6" />, t: "1. Complete KYC", d: "Sign in and verify your identity — CNIC, live selfie. This protects you and builds Heroes' trust." },
            { icon: <FileText className="h-6 w-6" />, t: "2. Choose Your Category", d: "Electricity, gas, water, school fees, medical, and 15+ more — each with its own simple, guided form." },
            { icon: <Building2 className="h-6 w-6" />, t: "3. Select Institute / Bill", d: "For bills and schools, just pick from our verified list and enter your reference number — no bank details needed." },
            { icon: <Camera className="h-6 w-6" />, t: "4. Upload Proof", d: "Bill/challan photo, and proof of income (salary slip or bank statement) — this keeps every case authentic." },
            { icon: <Video className="h-6 w-6" />, t: "5. Live Selfie & Video", d: "Record a short video explaining your situation in your own words — Heroes connect with real stories." },
            { icon: <CheckCircle2 className="h-6 w-6" />, t: "6. Givethra Verifies", d: "Our team reviews your documents and reference details before your case goes live for Heroes." },
          ].map(c => (
            <div key={c.t} className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{c.icon}</div>
              <h3 className="font-bold text-foreground text-sm">{c.t}</h3>
              <p className="text-xs text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING / CREDITS */}
      <section className="bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What Does It Cost?</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border-2 border-teal-400 bg-card p-6 shadow-sm space-y-3 text-center">
              <Gift className="h-8 w-8 text-teal-600 mx-auto" />
              <h3 className="font-bold text-lg">First Case</h3>
              <p className="text-3xl font-bold text-teal-600">FREE</p>
              <p className="text-sm text-muted-foreground">Every new user's very first case is completely free — no credits, no charge.</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3 text-center">
              <Coins className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-bold text-lg">Next Cases</h3>
              <p className="text-3xl font-bold text-primary">1 Credit</p>
              <p className="text-sm text-muted-foreground">After your first case, each new case listing costs 1 Credit ($1) — this keeps Givethra genuine and sustainable.</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Note: This listing fee is separate from your case amount. 100% of what Heroes contribute or pay goes toward your bill or institute — not to Givethra.
          </p>

          {/* REJECTION / SUSPENSION POLICY */}
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/10 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <h3 className="font-bold text-red-700">⚠️ Please Read — How to Avoid Rejection</h3>
            </div>
            <ul className="space-y-2 text-sm text-red-700/90">
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">1.</span>
                <span>Every new account's <strong>first case is FREE</strong>. After that, each case's listing fee is <strong>1 Credit</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">2.</span>
                <span>If your cases are rejected <strong>3 or more times</strong>, free-case access is disabled — after that, every case will require a credit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold shrink-0">3.</span>
                <span>If a total of <strong>5 cases are rejected</strong>, your account will be <strong>suspended</strong> and you won't be able to submit a new case.</span>
              </li>
              <li className="flex items-start gap-2">
                <Unlock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Unlocking a suspended account requires <strong>5 Credits</strong>.</span>
              </li>
            </ul>
            <div className="rounded-xl bg-white dark:bg-card border border-red-200 p-3 text-xs text-foreground/80">
              💡 <strong>How to avoid this:</strong> carefully read your category's guideline above, attach all required documents clearly and completely, and make sure the amount and date are clearly visible on your bill/challan/prescription — this greatly reduces the chance of your case being rejected.
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="rounded-2xl bg-primary text-white p-8 text-center space-y-4 shadow-lg">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto"><Lock className="h-7 w-7" /></div>
          <h2 className="text-2xl font-bold">Your Privacy is Protected</h2>
          <p className="text-white/85 max-w-xl mx-auto text-sm leading-relaxed">
            The public only sees a short story, category, city, and amount needed. Your bills, income proof, and
            personal documents are never shown publicly — they're reviewed by Givethra and only summarized for
            verified Heroes so they can trust and help you with confidence.
          </p>
        </div>
      </section>

      {/* URGENCY / EXPIRY NOTE */}
      <section className="max-w-4xl mx-auto px-4 pb-6">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-6 flex items-start gap-3">
          <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-700">Submit Bills Before They're Due</h3>
            <p className="text-sm text-amber-700/90 mt-1">
              For bill-based cases, enter your due date honestly. This helps Heroes see how urgent your case is —
              and Givethra makes sure the amount matches your real bill, so Heroes trust every case they help.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16 text-center space-y-5">
        <h2 className="text-3xl font-bold">Ready to Get Help?</h2>
        <p className="text-muted-foreground">Your first case is FREE — it takes just a few minutes.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-2xl" onClick={goSubmit}>
            <Zap className="h-5 w-5 mr-2" /> {isAuthenticated ? "Submit My Case Now" : "Sign Up & Submit — FREE"}
          </Button>
        </div>
      </section>
    </Layout>
  );
}
