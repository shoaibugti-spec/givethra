// src/frontend/src/pages/PrivacyPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Database, Lock, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getUserCases,
  getUserKycSubmissions,
  getUserDeposits,
  deleteUserAccount,
} from "@/lib/api";

export default function PrivacyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDataDownload() {
    if (!user) return;
    try {
      const [cases, kyc, deposits] = await Promise.all([
        getUserCases(user.id),
        getUserKycSubmissions(user.id),
        getUserDeposits(user.id),
      ]);
      const myData = {
        account: { id: user.id, email: user.email, name: user.fullName },
        kyc_submissions: kyc,
        cases: cases,
        deposits: deposits,
        exported_at: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(myData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `givethra-my-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Your data has been downloaded.");
    } catch {
      toast.error("Failed to download data.");
    }
  }

  async function handleAccountDeletion() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserAccount(user.id);
      toast.success("Your account data has been deleted. Signing out...");
      setTimeout(async () => {
        await logout();
        navigate({ to: "/" });
      }, 2000);
    } catch {
      toast.error("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Privacy & Account</h1>
        </div>

        <div className="space-y-4">
          {/* Data Download */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Data</h2>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <p className="text-sm font-medium mb-1">Download Your Data</p>
              <p className="text-xs text-muted-foreground mb-3">
                Download a copy of all your account data (cases, KYC, deposits).
              </p>
              <Button
                variant="outline"
                onClick={handleDataDownload}
                className="gap-2 border-primary text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4" /> Download My Data
              </Button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">Delete Account</h2>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <p className="text-sm font-medium mb-1">Delete Your Account</p>
              <p className="text-xs text-muted-foreground mb-3">
                This permanently deletes your account and all your data. This cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes your account and all data. Type <strong>DELETE</strong> to confirm.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteConfirmText !== "DELETE" || deleting}
                      onClick={handleAccountDeletion}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Note: Password change is not supported with Google login */}
          <div className="text-xs text-muted-foreground text-center border-t border-border pt-4">
            ⚠️ Password change is not available because you sign in with Google.
          </div>
        </div>
      </div>
    </Layout>
  );
}
