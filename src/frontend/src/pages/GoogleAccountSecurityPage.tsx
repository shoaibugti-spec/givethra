import type { UserPublic } from "@/backend";
import Layout from "@/components/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBackendActor } from "@/hooks/useBackend";
import {
  CheckCircle2,
  ExternalLink,
  Info,
  KeyRound,
  LogOut,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function GoogleAccountSecurityPage() {
  const { actor, isFetching } = useBackendActor();
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getCallerUserProfile()
      .then((p) => setProfile(p ?? null))
      .catch(() => setProfile(null));
  }, [actor, isFetching]);

  const handleSignOutAll = async () => {
    if (!actor) return;
    setLogoutLoading(true);
    try {
      const count = await actor.logoutAllOtherDevices();
      toast.success(
        `Signed out of ${Number(count)} other device${Number(count) !== 1 ? "s" : ""}.`,
      );
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <Layout>
      <div
        className="max-w-xl mx-auto px-4 pt-6 pb-24"
        data-ocid="google-account-security.page"
      >
        <div className="flex items-center gap-3 mb-6">
          <KeyRound className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Account Security
          </h1>
        </div>

        {/* Google Connected Card */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 shadow-card">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm">
                  {profile?.fullName ?? "Your Account"}
                </p>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected via Google
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {profile?.email ?? "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Manage Login */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-semibold text-foreground">
              Manage your Google Login
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your account is secured by Google. To change your password or manage
            login methods, visit your Google Account settings.
          </p>
          <Button
            className="w-full gap-2"
            data-ocid="google-account-security.open_google_button"
            onClick={() =>
              window.open(
                "https://myaccount.google.com/security",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <ExternalLink className="h-4 w-4" />
            Open Google Security Settings
          </Button>
        </div>

        {/* Recovery Options */}
        <div className="rounded-2xl bg-muted/50 border border-border p-5 mb-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h2 className="font-display text-base font-semibold text-foreground mb-1">
                Google Recovery Options
              </h2>
              <p className="text-sm text-muted-foreground">
                Recovery options such as a backup phone number, backup email,
                and recovery codes are managed through your Google Account.
                Visit{" "}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  myaccount.google.com
                </a>{" "}
                to update these settings.
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out All */}
        <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <LogOut className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-base font-semibold text-foreground">
              Sign out of all devices
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This will end all active sessions on other devices. You will remain
            signed in on this device.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                data-ocid="google-account-security.logout_all.open_modal_button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out of all other devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="google-account-security.logout_all.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Sign out of all other devices?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will end all active sessions on other devices. You will
                  remain signed in on this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="google-account-security.logout_all.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="google-account-security.logout_all.confirm_button"
                  onClick={handleSignOutAll}
                  disabled={logoutLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {logoutLoading ? "Signing out..." : "Sign out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Layout>
  );
}
