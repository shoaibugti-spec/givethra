// src/frontend/src/pages/SecurityPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Monitor,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getKycSubmission } from "@/lib/api";

export default function SecurityPage() {
  const { user, isAuthenticated } = useAuth();
  const [kycData, setKycData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadKyc();
    else setIsLoading(false);
  }, [user]);

  async function loadKyc() {
    setIsLoading(true);
    try {
      const data = await getKycSubmission(user!.id);
      setKycData(data);
    } catch (err) {
      console.error("Failed to load KYC:", err);
      setKycData(null);
    } finally {
      setIsLoading(false);
    }
  }

  function StatusRow({
    label,
    description,
    status,
    action,
  }: {
    label: string;
    description?: string;
    status: "verified" | "pending" | "unknown" | "failed";
    action?: React.ReactNode;
  }) {
    const config = {
      verified: { icon: <CheckCircle2 className="h-4 w-4" />, text: "Verified", cls: "text-green-600" },
      pending: { icon: <Clock className="h-4 w-4" />, text: "Pending", cls: "text-orange-500" },
      failed: { icon: <XCircle className="h-4 w-4" />, text: "Rejected", cls: "text-red-500" },
      unknown: { icon: <Clock className="h-4 w-4" />, text: "Not Set", cls: "text-muted-foreground" },
    };
    const c = config[status];
    return (
      <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1 text-xs font-semibold ${c.cls}`}>
            {c.icon} {c.text}
          </div>
          {action}
        </div>
      </div>
    );
  }

  const kycStatus = kycData?.status ?? "unknown";
  const kycStatusKind =
    kycStatus === "approved"
      ? "verified"
      : kycStatus === "rejected"
      ? "failed"
      : kycData
      ? "pending"
      : "unknown";

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Security Center</h1>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Verification Status</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            <>
              <StatusRow
                label="Email Verification"
                description={user?.email ? `Verified: ${user.email}` : "No email linked"}
                status={user?.email ? "verified" : "unknown"}
              />
              <StatusRow
                label="Mobile Verification"
                description="No phone linked"
                status="unknown"
              />
              <StatusRow
                label="Identity Verification"
                description="Government ID document check"
                status={kycStatusKind}
              />
              <StatusRow
                label="KYC Status"
                description="Know Your Customer verification"
                status={kycStatusKind}
                action={
                  kycStatus !== "approved" ? (
                    <Link to="/kyc">
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        {kycStatus === "rejected"
                          ? "Re-submit KYC"
                          : kycData
                          ? "View KYC"
                          : "Complete KYC"}
                      </Button>
                    </Link>
                  ) : null
                }
              />
            </>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Session Info</h2>
          </div>
          {isAuthenticated ? (
            <div className="text-sm text-muted-foreground">
              <p>
                Email: <span className="font-medium text-foreground">{user?.email}</span>
              </p>
              <p className="mt-1">
                Name: <span className="font-medium text-foreground">{user?.fullName}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign in to view session info.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Active Sessions</h2>
          </div>
          <p className="text-sm text-muted-foreground">No active sessions found.</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Session Management</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            No active sessions found.
          </p>
          <Button variant="destructive" className="w-full" disabled>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out All Other Devices
          </Button>
        </div>
      </div>
    </Layout>
  );
}
