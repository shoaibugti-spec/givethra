import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { Button } from "@/components/ui/button";
import { openCookieSettings } from "@/lib/consent";

const sections: LegalSection[] = [
  { title: "What cookies are", paragraphs: [
    "Cookies and similar technologies (local storage, SDKs, pixels) are small items stored on your device. We use them to keep you signed in, protect the platform, remember choices and, only with your consent, to measure and improve the service.",
  ]},
  { title: "Categories we use", bullets: [
    "Strictly necessary: Google sign-in session, security, fraud prevention, load balancing and storing your cookie choice. These do not need consent.",
    "Preferences: language, theme and similar settings. Off until you allow them.",
    "Analytics: aggregated usage statistics. Off until you allow them.",
    "Marketing & social: campaign measurement and embedded third-party content. Off until you allow them.",
  ]},
  { title: "Your choices", bullets: [
    "On your first visit you can Accept all, Reject all or Customize. Rejecting is as easy as accepting.",
    "You can change or withdraw your choice at any time using \"Cookie settings\" in the footer.",
    "We respect the Global Privacy Control browser signal and treat it as a rejection of optional cookies.",
    "You can also block cookies in your browser; some features (such as sign-in) may stop working.",
  ]},
  { title: "Duration", paragraphs: [
    "Your consent choice is remembered for up to 12 months and is asked again if our cookie categories change. Session cookies expire when you close the browser.",
  ]},
  { title: "Third parties", paragraphs: [
    "Providers such as Google (sign-in and, if enabled, analytics), Cloudflare (security and delivery) and social platforms (embedded content) may set cookies under their own policies. A current list of cookies is available on request at the privacy contact.",
  ]},
];

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" sections={sections} intro="How Givethra uses cookies and how you stay in control.">
      <Button variant="outline" onClick={openCookieSettings}>Open cookie settings</Button>
    </LegalPage>
  );
}
