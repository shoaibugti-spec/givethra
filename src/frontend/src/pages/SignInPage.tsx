import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Download, Loader2, Mail, MessageCircle } from "lucide-react";
import { useEffect } from "react";

export default function SignInPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, isLoggingIn, isAuthenticated, loginError, setRole: setAuthRole } = useAuth();
  const { setRole: setSelectedRole } = useRole();
  const redirect = new URLSearchParams(window.location.search).get("redirect");

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("role");
    if (selected === "hero" || selected === "requester") {
      setSelectedRole(selected);
      setAuthRole(selected === "requester" ? "help_seeker" : "hero");
    }
  }, [setAuthRole, setSelectedRole]);

  useEffect(() => {
    if (isAuthenticated) {
      if (redirect === "/need-help") navigate({ to: "/need-help" });
      else if (redirect === "/community") navigate({ to: "/community" });
      else navigate({ to: "/home" });
    }
  }, [isAuthenticated, navigate, redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-4 ring-primary/15">
              <img src="/assets/givethra-google-logo.png" alt="Givethra G+ logo" className="h-full w-full object-cover" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Givethra</CardTitle>
          <CardDescription>Sign in to continue to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={loginWithGoogle}
            disabled={isLoggingIn}
            className="w-full h-12 gap-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm"
            variant="outline"
          >
            {isLoggingIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
          <div className="grid grid-cols-2 gap-2 text-center text-xs"><div className="rounded-xl border border-border bg-muted/30 p-3"><strong className="block text-foreground">Support</strong><span className="text-muted-foreground">Help verified people</span></div><div className="rounded-xl border border-border bg-muted/30 p-3"><strong className="block text-foreground">Earnings</strong><span className="text-muted-foreground">Earn from your posts</span></div></div>
          <p className="text-center text-sm font-medium text-primary">Support others, become eligible, earn through your own posts, and use your separate Earnings Wallet.</p>
          {loginError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {loginError}
            </p>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
          <div className="space-y-4 border-t border-border pt-5 text-center text-xs text-muted-foreground"><div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-teal-50 p-4"><p className="text-2xl">📱</p><p className="mt-1 font-bold text-foreground">Get the Givethra Android App</p><p className="mt-1">Verified cases, anytime — right on your phone.</p><Button variant="outline" size="sm" className="mt-3 gap-2"><Download className="h-4 w-4" />Download App</Button></div><div className="grid grid-cols-2 gap-2 text-[11px]"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">Verified &amp; Secure</span><span className="rounded-lg bg-sky-50 p-2 text-sky-700">100% Transparency</span><span className="rounded-lg bg-rose-50 p-2 text-rose-700">Compassion Driven by Humanity</span><span className="rounded-lg bg-amber-50 p-2 text-amber-700">Global Community</span><span className="rounded-lg bg-violet-50 p-2 text-violet-700">Help Beyond Borders</span><span className="rounded-lg bg-teal-50 p-2 text-teal-700">Safe &amp; Private</span></div><div className="space-y-2"><p className="font-semibold text-foreground">Connect with Givethra</p><p>Follow us and reach out — we're here to help.</p><div className="flex justify-center gap-4"><a href="https://wa.me/message/42CJXLUYEI2KM1?src=qr" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600"><MessageCircle className="h-4 w-4" />Get WhatsApp Support 24/7</a><a href="mailto:info@givethra.org" className="inline-flex items-center gap-1 text-primary"><Mail className="h-4 w-4" />info@givethra.org</a></div></div><nav className="flex flex-wrap justify-center gap-x-3 gap-y-1"><Link to="/about">About</Link><Link to="/faq">FAQ</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms</Link><Link to="/community-guidelines">Community Guidelines</Link><Link to="/contact">Contact Us</Link></nav><p>© {new Date().getFullYear()} Givethra. All rights reserved.</p><p className="italic">“Be the reason someone believes in kindness.”</p><p className="font-semibold text-foreground">givethra.org</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
