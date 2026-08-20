import Layout from "@/components/Layout";
import { Mail, MapPin, Clock, Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground">We'd love to hear from you — whether you need help, want to become a Hero, or have a question about Givethra.</p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Email</p>
              <a href="mailto:info@givethra.org" className="text-sm text-primary">info@givethra.org</a>
              <p className="text-xs text-muted-foreground mt-0.5">We aim to respond within 24-48 hours.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Operating From</p>
              <p className="text-sm text-muted-foreground">Balochistan, Pakistan — serving verified Heroes and beneficiaries worldwide.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">In-App Support</p>
              <p className="text-sm text-muted-foreground">Signed-in users can chat directly with our team via the Support page.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <p className="font-semibold text-center">Follow Givethra</p>
          <div className="flex items-center justify-center gap-3">
            <a href="https://www.facebook.com/profile.php?id=61590715263595" target="_blank" rel="noopener noreferrer" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="https://www.instagram.com/givethra.community" target="_blank" rel="noopener noreferrer" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="https://www.linkedin.com/company/givethra-org/" target="_blank" rel="noopener noreferrer" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-colors"><Linkedin className="h-5 w-5" /></a>
            <a href="https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J" target="_blank" rel="noopener noreferrer" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-colors"><MessageCircle className="h-5 w-5" /></a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Givethra™ is a verified humanitarian platform. Formal organizational registration is currently in process.
        </p>
      </div>
    </Layout>
  );
}
