// src/frontend/src/pages/MyHelpPage.tsx
// Data + UI now live in shared files so this page and the "My Help" tab on My Cases always match:
//   - "@/lib/helpRecords"            (loading, status rules, records)
//   - "@/components/HelpHistory"     (filters, cards, empty states)
//   - "@/components/FilterTabs"      (tabs that never overlap on small screens)

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import HelpHistory from "@/components/HelpHistory";
import { useHelpRecords } from "@/lib/helpRecords";

export default function MyHelpPage() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const { records, loading } = useHelpRecords(user?.id, isAuthenticated);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) navigate({ to: "/sign-in" });
  }, [isAuthenticated, isInitializing]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">My Help</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading your help history...</div>
        ) : (
          <HelpHistory records={records} />
        )}
      </div>
    </Layout>
  );
}
