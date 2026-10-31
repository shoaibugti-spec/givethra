// src/frontend/src/pages/WalletPage.tsx
// The wallet now lives inside the Profile page (Credits card -> Deposit).
// This route is kept so old links (/wallet) still open the same deposit screen.

import Layout from "@/components/Layout";
import DepositPanel from "@/components/DepositPanel";
import { useNavigate } from "@tanstack/react-router";

export default function WalletPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-4 pb-24">
        <DepositPanel onBack={() => navigate({ to: "/profile/$id", params: { id: "me" } })} />
      </div>
    </Layout>
  );
}
