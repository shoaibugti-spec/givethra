import Layout from "@/components/Layout";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-xs text-muted-foreground">Last updated: August 2026</p>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-semibold text-foreground mb-1">1. Information We Collect</h2>
            <p>To verify help seekers and Heroes, Givethra collects: your name, email, phone number, CNIC details for KYC, a live selfie, a video statement, and documents you submit for a case (such as bills, challans, or medical reports).</p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground mb-1">2. How We Use Your Information</h2>
            <p>Your information is used solely to verify your identity, review and approve help requests, confirm payments between Heroes and beneficiaries, and prevent fraud. We do not sell your data to third parties.</p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground mb-1">3. Who Can See Your Information</h2>
            <p>The public only sees a limited case preview (story, category, city, amount, verification badges). Private documents, videos, and payment references are visible only to verified Heroes after they unlock a case, and to the Givethra team for verification purposes.</p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground mb-1">4. Data Storage &amp; Security</h2>
            <p>Your data is stored securely using Cloudflare D1 with row-level security and encrypted connections. Access is restricted to authorized systems only.</p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground mb-1">5. Your Rights</h2>
            <p>You can download a copy of your data or request account deletion at any time from your Profile → Privacy settings.</p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground mb-1">6. Contact Us</h2>
            <p>Questions about this policy? Email us at <a href="mailto:info@givethra.org" className="text-primary">info@givethra.org</a>.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
