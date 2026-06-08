import type { PrivacySettingsPublic } from "@/backend";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBackendActor } from "@/hooks/useBackend";
import { Bell, Database, Eye, Lock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function SectionHeader({
  icon,
  title,
}: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-primary">{icon}</div>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}

function CheckRow({
  label,
  description,
  checked,
  onCheckedChange,
  ocid,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  ocid?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        data-ocid={ocid}
      />
    </div>
  );
}

export default function PrivacyPage() {
  const { actor, isFetching } = useBackendActor();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [profileVisibility, setProfileVisibility] = useState("public");
  const [countryVisibility, setCountryVisibility] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [inAppNotificationsEnabled, setInAppNotificationsEnabled] =
    useState(true);
  const [caseUpdatesEnabled, setCaseUpdatesEnabled] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor
      .getPrivacySettings()
      .then((s: PrivacySettingsPublic | null) => {
        if (s) {
          setProfileVisibility(s.profileVisibility || "public");
          setCountryVisibility(s.countryVisibility);
          setActivityVisibility(s.activityVisibility);
          setEmailNotificationsEnabled(s.emailNotificationsEnabled);
          setInAppNotificationsEnabled(s.inAppNotificationsEnabled);
          setCaseUpdatesEnabled(s.caseUpdatesEnabled);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor, isFetching]);

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.updatePrivacySettings(
        profileVisibility,
        countryVisibility,
        activityVisibility,
        emailNotificationsEnabled,
        inAppNotificationsEnabled,
        caseUpdatesEnabled,
      );
      toast.success("Privacy settings saved.");
    } catch {
      toast.error("Failed to save privacy settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDataDownload() {
    if (!actor) return;
    setDownloadLoading(true);
    try {
      const msg = await actor.requestDataDownload();
      toast.success(
        msg ||
          "Data download request submitted. We will email you within 48 hours.",
      );
    } catch {
      toast.error("Failed to request data download.");
    } finally {
      setDownloadLoading(false);
    }
  }

  async function handleAccountDeletion() {
    if (!actor) return;
    try {
      const msg = await actor.requestAccountDeletion();
      toast.success(
        msg ||
          "Account deletion requested. Your account will be deleted after a 30-day grace period.",
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch {
      toast.error("Failed to request account deletion.");
    }
  }

  return (
    <Layout>
      <div
        className="max-w-xl mx-auto px-4 pt-6 pb-28"
        data-ocid="privacy.page"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Privacy Settings
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4" data-ocid="privacy.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border p-5 h-40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Section 1 — Visibility Controls */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <SectionHeader
                icon={<Eye className="h-5 w-5" />}
                title="Visibility Controls"
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    value={profileVisibility}
                    onValueChange={setProfileVisibility}
                  >
                    <SelectTrigger
                      id="profile-visibility"
                      data-ocid="privacy.profile_visibility.select"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        Public — Anyone can view your profile
                      </SelectItem>
                      <SelectItem value="friends">
                        Friends Only — Only your connections
                      </SelectItem>
                      <SelectItem value="private">
                        Private — Only you can see your profile
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CheckRow
                  label="Country Visibility"
                  description="Show your country to others on the platform"
                  checked={countryVisibility}
                  onCheckedChange={setCountryVisibility}
                  ocid="privacy.country_visibility.switch"
                />
                <CheckRow
                  label="Activity Visibility"
                  description="Show your support history publicly"
                  checked={activityVisibility}
                  onCheckedChange={setActivityVisibility}
                  ocid="privacy.activity_visibility.switch"
                />
              </div>
            </div>

            {/* Section 2 — Notification Preferences */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <SectionHeader
                icon={<Bell className="h-5 w-5" />}
                title="Notification Preferences"
              />
              <CheckRow
                label="Email Notifications"
                description="Receive case and account updates by email"
                checked={emailNotificationsEnabled}
                onCheckedChange={setEmailNotificationsEnabled}
                ocid="privacy.email_notifications.switch"
              />
              <CheckRow
                label="In-App Notifications"
                description="Show notifications inside the platform"
                checked={inAppNotificationsEnabled}
                onCheckedChange={setInAppNotificationsEnabled}
                ocid="privacy.inapp_notifications.switch"
              />
              <CheckRow
                label="Case Updates"
                description="Notify when a case you follow changes status"
                checked={caseUpdatesEnabled}
                onCheckedChange={setCaseUpdatesEnabled}
                ocid="privacy.case_updates.switch"
              />
            </div>

            {/* Save for sections 1–2 */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="min-w-[140px]"
                data-ocid="privacy.save_button"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {/* Section 3 — Data & Account */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <SectionHeader
                icon={<Database className="h-5 w-5" />}
                title="Data &amp; Account"
              />
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Request Data Download
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    We will prepare your data and email it to you within 48
                    hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDataDownload}
                    disabled={downloadLoading}
                    className="border-primary text-primary hover:bg-primary/10"
                    data-ocid="privacy.data_download.button"
                  >
                    {downloadLoading
                      ? "Requesting..."
                      : "Request Data Download"}
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Request Account Deletion
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This permanently deletes your account after a 30-day grace
                    period.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        data-ocid="privacy.delete_account.open_modal_button"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Request Account Deletion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="privacy.delete_account.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete your account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all
                          associated data after a 30-day grace period. Type{" "}
                          <strong>DELETE</strong> below to confirm.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        data-ocid="privacy.delete_account.input"
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDeleteConfirmText("")}
                          data-ocid="privacy.delete_account.cancel_button"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deleteConfirmText !== "DELETE"}
                          onClick={handleAccountDeletion}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                          data-ocid="privacy.delete_account.confirm_button"
                        >
                          Delete My Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
