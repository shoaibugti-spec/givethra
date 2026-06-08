import { KycStatus, type LoginDevice, type UserPublic } from "@/backend";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useBackendActor } from "@/hooks/useBackend";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  Monitor,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type StatusKind = "verified" | "pending" | "failed" | "review" | "unknown";

function SectionTitle({
  title,
  icon,
}: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-primary">{icon}</div>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}

function StatusCard({
  label,
  description,
  status,
  action,
}: {
  label: string;
  description?: string;
  status: StatusKind;
  action?: React.ReactNode;
}) {
  const cfgMap: Record<
    StatusKind,
    { icon: React.ReactNode; text: string; cls: string }
  > = {
    verified: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: "Verified",
      cls: "text-green-600 dark:text-green-400",
    },
    pending: {
      icon: <Clock className="h-4 w-4" />,
      text: "Pending",
      cls: "text-muted-foreground",
    },
    review: {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: "Under Review",
      cls: "text-orange-500",
    },
    failed: {
      icon: <XCircle className="h-4 w-4" />,
      text: "Rejected",
      cls: "text-destructive",
    },
    unknown: {
      icon: <Clock className="h-4 w-4" />,
      text: "Not Set",
      cls: "text-muted-foreground",
    },
  };
  const c = cfgMap[status];
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${c.cls}`}
        >
          {c.icon}
          {c.text}
        </div>
        {action}
      </div>
    </div>
  );
}

function toStatusKind(s: KycStatus): StatusKind {
  if (s === KycStatus.Approved) return "verified";
  if (s === KycStatus.UnderReview) return "review";
  if (s === KycStatus.Rejected) return "failed";
  return "pending";
}

function kycBadge(s: KycStatus) {
  if (s === KycStatus.Approved)
    return {
      label: "Approved",
      cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  if (s === KycStatus.UnderReview)
    return {
      label: "Under Review",
      cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
  if (s === KycStatus.Rejected)
    return { label: "Rejected", cls: "bg-destructive/10 text-destructive" };
  return { label: "Pending", cls: "bg-muted text-muted-foreground" };
}

function timeAgo(ts: bigint): string {
  const diff = Date.now() - Number(ts) / 1_000_000;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 2) return "just now";
  if (m < 60) return `${m} minutes ago`;
  if (h < 24) return `${h} hours ago`;
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

export default function SecurityPage() {
  const { actor, isFetching } = useBackendActor();
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [devices, setDevices] = useState<LoginDevice[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    setProfileLoading(true);
    actor
      .getCallerUserProfile()
      .then((p) => setProfile(p ?? null))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [actor, isFetching]);

  useEffect(() => {
    if (!actor || isFetching) return;
    setDevicesLoading(true);
    actor
      .getLoginDevices()
      .then((d) => setDevices(d))
      .catch(() => setDevices([]))
      .finally(() => setDevicesLoading(false));
  }, [actor, isFetching]);

  const handleLogoutAll = async () => {
    if (!actor) return;
    setLogoutAllLoading(true);
    try {
      const count = await actor.logoutAllOtherDevices();
      toast.success(
        `Logged out ${Number(count)} other session${Number(count) !== 1 ? "s" : ""} successfully.`,
      );
      const d = await actor.getLoginDevices();
      setDevices(d);
    } catch {
      toast.error("Failed to logout other sessions. Please try again.");
    } finally {
      setLogoutAllLoading(false);
    }
  };

  const isLoading = profileLoading || isFetching;

  return (
    <Layout>
      <div
        className="max-w-xl mx-auto px-4 pt-6 pb-24"
        data-ocid="security.page"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Security Center
          </h1>
        </div>

        {/* Verification Status */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 shadow-card">
          <SectionTitle
            title="Verification Status"
            icon={<Shield className="h-5 w-5" />}
          />
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div data-ocid="security.verification_status.card">
              <StatusCard
                label="Email Verification"
                description={
                  profile?.email
                    ? `Verified: ${profile.email}`
                    : "No email linked"
                }
                status={profile?.email ? "verified" : "unknown"}
              />
              <StatusCard
                label="Mobile Verification"
                description={
                  profile?.phoneNumber
                    ? `Linked: ${profile.phoneNumber}`
                    : "No phone linked"
                }
                status={profile?.phoneNumber ? "verified" : "unknown"}
              />
              <StatusCard
                label="Identity Verification"
                description="Government ID document check"
                status={profile ? toStatusKind(profile.kycStatus) : "unknown"}
              />
              <StatusCard
                label="KYC Status"
                description="Know Your Customer verification"
                status={profile ? toStatusKind(profile.kycStatus) : "unknown"}
                action={
                  profile ? (
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge
                        className={`text-xs px-2 py-0.5 ${kycBadge(profile.kycStatus).cls}`}
                      >
                        {kycBadge(profile.kycStatus).label}
                      </Badge>
                      {profile.kycStatus === KycStatus.Rejected && (
                        <Link to="/edit-profile">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs h-7"
                            data-ocid="security.resubmit_kyc_button"
                          >
                            Re-submit KYC
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : null
                }
              />
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 shadow-card">
          <SectionTitle
            title="Session Info"
            icon={<Clock className="h-5 w-5" />}
          />
          {isLoading ? (
            <Skeleton className="h-8 w-48 rounded" />
          ) : profile ? (
            <div data-ocid="security.session_info.card">
              <p className="text-sm text-muted-foreground">
                Last seen:{" "}
                <span className="font-medium text-foreground">
                  {profile.lastLoginAt > 0n
                    ? timeAgo(profile.lastLoginAt)
                    : "\u2014"}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since:{" "}
                <span className="font-medium text-foreground">
                  {profile.createdAt > 0n
                    ? new Date(
                        Number(profile.createdAt) / 1_000_000,
                      ).toLocaleDateString()
                    : "\u2014"}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign in to view session info.
            </p>
          )}
        </div>

        {/* Login Devices */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 shadow-card">
          <SectionTitle
            title="Login Devices"
            icon={<Monitor className="h-5 w-5" />}
          />
          {devicesLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : devices.length === 0 ? (
            <div
              data-ocid="security.devices.empty_state"
              className="text-center py-6"
            >
              <Smartphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No devices found.</p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="security.devices.list">
              {devices.map((device, i) => (
                <div
                  key={device.id}
                  data-ocid={`security.devices.item.${i + 1}`}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-card border border-border shrink-0">
                      {device.os.toLowerCase().includes("mobile") ||
                      device.os.toLowerCase().includes("android") ||
                      device.os.toLowerCase().includes("ios") ? (
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {device.deviceName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {device.os}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IP: {device.ipAddress} &middot;{" "}
                        {new Date(
                          Number(device.lastAccess) / 1_000_000,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Remove device"
                    data-ocid={`security.devices.delete_button.${i + 1}`}
                    onClick={() =>
                      toast.info("Device removal coming in a future update.")
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
          <SectionTitle
            title="Active Sessions"
            icon={<LogOut className="h-5 w-5" />}
          />
          {devicesLoading ? (
            <Skeleton className="h-10 w-full rounded" />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {devices.length > 0
                  ? `You have ${devices.length} active session${devices.length !== 1 ? "s" : ""}.`
                  : "No active sessions found."}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    data-ocid="security.logout_all.open_modal_button"
                    disabled={devices.length === 0}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout All Other Devices
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="security.logout_all.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Logout all other devices?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will end all active sessions on other devices. You
                      will remain signed in on this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="security.logout_all.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-ocid="security.logout_all.confirm_button"
                      onClick={handleLogoutAll}
                      disabled={logoutAllLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {logoutAllLoading ? "Logging out..." : "Logout All"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
