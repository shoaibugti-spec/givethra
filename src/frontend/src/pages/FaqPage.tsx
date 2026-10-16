import Layout from "@/components/Layout";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  { category: "Getting Started", items: [
    { q: "What is Givethra?", a: "A humanitarian platform that connects Help Seekers with Heroes through verified requests, direct assistance where practical, and community features. Tagline: From Need to Help." },
    { q: "How do I create an account?", a: "Sign in with your Google account, then complete and edit your profile. Heroes can browse eligible cases right away; Help Seekers must complete identity verification (KYC) before a request can be approved." },
    { q: "Is Givethra free?", a: "Creating an account is free. Your first Help Request is free, and if it is rejected your second is free too. Other features use credits (1 credit = USD 1) and the fee is always shown before you confirm." },
    { q: "Is Givethra a job, loan or bank?", a: "No. Givethra does not offer jobs, loans or instalment plans and is not a bank." },
  ]},
  { category: "For Help Seekers", items: [
    { q: "How do I request help?", a: "Choose a category, complete the form in your own words, upload the required documents, record your own appeal video and selfie confirmation, accept the declarations and submit." },
    { q: "Who can see my documents?", a: "Only authorised verification staff. Heroes, contributors and other users never see your documents. Your appeal video is locked and only an eligible Hero who unlocks your case can stream it - play only, no download button." },
    { q: "Why was my request rejected?", a: "Common reasons: wrong category, documents that do not support the need, unclear video, inconsistent amount or missing information. You will see the reason and how to fix it where correction is allowed." },
    { q: "How often can I request help?", a: "Utility bills and rent: once per monthly period. School and university fees: monthly for a distinct fee period. Other categories: after about three months from a completed request. After a rejection, retry after 30 days (some categories allow 15). Disability, widow, orphan and elderly support follow special rules." },
    { q: "What happens after five rejections?", a: "The account may be suspended. Reactivation requires the published fee (currently 5 credits) and review, and you can ask for a fair review of the decision." },
  ]},
  { category: "For Heroes", items: [
    { q: "How do I help someone?", a: "Browse verified cases, unlock a case with credits to see the approved payment reference and appeal video, pay the institution or provider directly through your own bank or wallet, then upload proof." },
    { q: "Do I send money to Givethra?", a: "For direct help, no. You pay the school, hospital, utility or landlord directly. Community donations and credits are separate features and are clearly labelled." },
    { q: "Is a verified case guaranteed?", a: "Verified means it passed our checks. It does not guarantee how a person's circumstances will change." },
    { q: "What is a Proud Heart?", a: "A recognition you earn when a case you helped is successfully completed." },
  ]},
  { category: "Credits, Donations & Withdrawals", items: [
    { q: "What are credits?", a: "A platform fee unit (1 credit = USD 1). They cannot be withdrawn or transferred and are not a guarantee of approval or assistance." },
    { q: "How do I add credits?", a: "In your Wallet pick an available payment method, pay, and upload the receipt. After review, credits are added - usually within 24 hours." },
    { q: "What is the community support feature?", a: "Eligible users can post and receive support units, up to 1,000 per post, with one new post per 24 hours. Support units are not cash or guaranteed income." },
    { q: "How do withdrawals work?", a: "The window opens on the 30th and closes on the 3rd of the next month. The minimum is PKR 300. Processing depends on checks and payment-provider availability." },
    { q: "Can I donate to the community?", a: "Yes, voluntarily. Donations are separate from help for a specific case; see the Donation Policy for how funds are used." },
  ]},
  { category: "Shop Dream Now", items: [
    { q: "What is Shop Dream Now?", a: "A product-participation feature: participants each contribute a small share toward a product's target, and when the target is reached one eligible participant receives it under the published selection method." },
    { q: "Will everyone get the product?", a: "No. A product is not guaranteed to every participant. A previous recipient cannot be selected again. Read the listing rules and Shop Dream Now Rules first." },
    { q: "What if the target isn't reached?", a: "Contributions are refunded as stated on the listing." },
  ]},
  { category: "Privacy & Safety", items: [
    { q: "How do I download or delete my data?", a: "Go to Privacy & Account to download a copy of your data or delete your account. You can also email our privacy contact." },
    { q: "How do I change my cookie choices?", a: "Use 'Cookie settings' in the footer at any time." },
    { q: "Will support staff ask for money or passwords?", a: "Never. Support (WhatsApp, Telegram, email) is guidance only. Report anyone asking for money, passwords or codes." },
    { q: "How do I report a problem?", a: "Use the Report page, the report option on content, or email support." },
  ]},
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between gap-3 py-4 text-left">
        <span className="font-medium text-sm text-foreground">{q}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-muted-foreground leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><HelpCircle className="h-6 w-6 text-primary" /></div>
          <h1 className="font-display text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Everything you need to know about using Givethra.</p>
        </div>
        <div className="space-y-6">
          {FAQS.map(({ category, items }) => (
            <div key={category} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold text-primary mb-2">{category}</h2>
              {items.map((i) => <FaqItem key={i.q} {...i} />)}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
