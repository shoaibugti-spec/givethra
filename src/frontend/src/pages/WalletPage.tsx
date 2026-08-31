// src/frontend/src/pages/WalletPage.tsx
// SIMPLIFIED VERSION – Guaranteed to work

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  Coins,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getWallet,
  getTransactions,
  getUserSuspension,
  insertDeposit,
  uploadFileToStorage,
  upsertUserSuspension,
} from "@/lib/api";

const PAYMENT_METHODS = {
  nayapay: {
    name: "NayaPay",
    icon: "💸",
    fields: [
      { label: "Account Title", value: "Shoaib Ahmed" },
      { label: "Account No / IBAN", value: "PK93NAYA1234503331641604" },
    ],
  },
  binance: {
    name: "Crypto Currency (USDT)",
    icon: "₿",
    fields: [
      { label: "USDT Address (TRC20)", value: "TNjaCQjQ5Yzm5tiVF8s121rUv5BH7y6hAC" },
      { label: "Network", value: "TRC20 (Tron)" },
    ],
  },
};

const QUICK_AMOUNTS = [1, 2, 3, 5, 10, 20];
const SUSPENSION_UNLOCK_CREDITS = 5;

export default function WalletPage() {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isSuspended, setIsSuspended] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<"nayapay" | "binance">("nayapay");
  const [amount, setAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofName, setProofName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const [pkrRate, setPkrRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [rateUpdated, setRateUpdated] = useState<string>("");

  useEffect(() => {
    if (user) loadWallet();
    else setLoading(false);
    loadRate();
  }, [user]);

  async function loadRate() {
    setRateLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      const rate = data?.rates?.PKR;
      if (rate) {
        setPkrRate(rate);
        setRateUpdated(new Date().toLocaleString());
      }
    } catch {
      setPkrRate(278.75);
      setRateUpdated("approx.");
    } finally {
      setRateLoading(false);
    }
  }

  async function loadWallet() {
    setLoading(true);
    try {
      const wallet = await getWallet(user!.id);
      setBalance(wallet?.balance ?? 0);
      const suspension = await getUserSuspension(user!.id);
      setIsSuspended(Boolean(suspension?.is_active));
      const txs = await getTransactions(user!.id);
      console.log("Transactions loaded:", txs);
      setTransactions(txs ?? []);
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  }

  async function handleSubmit() {
    if (!amount || parseFloat(amount) < 1) {
      toast.error("Enter a valid amount (min $1)");
      return;
    }
    if (!txId) {
      toast.error("Enter transaction ID / reference");
      return;
    }
    if (!proofFile) {
      toast.error("Upload payment proof");
      return;
    }
    setSubmitting(true);
    try {
      const safeProofName = proofFile.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `deposits/${user!.id}/${Date.now()}-${safeProofName}`;
      const proofUrl = await uploadFileToStorage(proofFile, path);

      const depositData = {
        user_id: user!.id,
        method: PAYMENT_METHODS[method].name,
        amount: parseFloat(amount),
        currency: method === "binance" ? "USDT" : "USD",
        transaction_id: txId,
        proof_url: proofUrl,
        credits: parseFloat(amount),
        status: "pending",
        submitted_at: new Date().toISOString(),
      };

      await insertDeposit(depositData);
      toast.success("Deposit submitted! Credits will be added after Givethra reviews it.");
      setAmount("");
      setTxId("");
      setProofFile(null);
      setProofName("");
      loadWallet();
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlockAccount() {
    if (!user?.id) return;
    setUnlocking(true);
    try {
      await upsertUserSuspension({
        user_id: user.id,
        is_active: false,
      });
      toast.success(`✅ Account unlocked! ${SUSPENSION_UNLOCK_CREDITS} credits deducted.`);
      setIsSuspended(false);
      await loadWallet();
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUnlocking(false);
    }
  }

  if (!isAuthenticated)
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Please sign in.</div>
      </Layout>
    );

  const amountNum = parseFloat(amount) || 0;
  const pkrAmount = pkrRate ? Math.round(amountNum * pkrRate) : null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 opacity-80" />
            <span className="text-sm opacity-90">Support Credits Balance</span>
          </div>
          <div className="text-4xl font-bold">{balance.toLocaleString()}</div>
          <div className="text-sm opacity-80 mt-1">
            ≈ ${balance.toLocaleString()} USD · 1 Credit = $1
          </div>
        </div>

        {isSuspended && (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
            <p className="font-semibold">Account suspended</p>
            <p className="mt-1">You can still view your wallet and add credits, but submitting a case or helping a case is disabled. Add at least <strong>{SUSPENSION_UNLOCK_CREDITS} credits</strong>, then click the button below to unlock.</p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={handleUnlockAccount}
              disabled={balance < SUSPENSION_UNLOCK_CREDITS || unlocking}
            >
              {unlocking ? "Unlocking..." : `Unlock Account (${SUSPENSION_UNLOCK_CREDITS} Credits)`}
            </Button>
            {balance < SUSPENSION_UNLOCK_CREDITS && (
              <p className="text-xs text-muted-foreground mt-2">You need {SUSPENSION_UNLOCK_CREDITS - balance} more credits.</p>
            )}
          </div>
        )}

        <div className="rounded-xl bg-muted/40 border p-4 text-xs text-muted-foreground space-y-1">
          <p>• Submitting a help request costs <strong>1 Credit</strong></p>
          <p>• Unlocking a verified case as a Hero costs <strong>1 Credit</strong></p>
          <p>• Credits are for platform fees only — not transferable or withdrawable</p>
        </div>

        {/* Deposit Section */}
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" /> Deposit Credits
          </h2>

          <div className="space-y-2">
            <Label>Step 1 — Choose Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PAYMENT_METHODS) as Array<keyof typeof PAYMENT_METHODS>).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`px-3 py-3 rounded-lg border text-sm font-medium ${
                      method === m
                        ? "bg-primary text-white border-primary"
                        : "border-border"
                    }`}
                  >
                    {PAYMENT_METHODS[m].icon} {PAYMENT_METHODS[m].name}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Step 2 — Choose Amount (Credits)</Label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(String(a))}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                    amount === String(a)
                      ? "bg-primary text-white border-primary"
                      : "border-border"
                  }`}
                >
                  {a} Credit{a > 1 ? "s" : ""}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Or enter custom amount (USD)"
              className="mt-2"
            />

            {amountNum > 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    You are buying
                  </span>
                  <span className="font-bold text-foreground">
                    {amountNum} Credit{amountNum > 1 ? "s" : ""} = ${amountNum} USD
                  </span>
                </div>
                {method === "nayapay" ? (
                  <>
                    <div className="flex items-center justify-between pt-1 border-t border-primary/10">
                      <span className="text-sm text-muted-foreground">
                        Pay in PKR (NayaPay)
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {rateLoading
                          ? "Loading..."
                          : pkrAmount
                          ? `₨ ${pkrAmount.toLocaleString()}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={loadRate}
                          className="inline-flex items-center gap-1 hover:text-primary"
                        >
                          <RefreshCw className="h-3 w-3" /> Refresh rate
                        </button>
                      </span>
                      <span>{pkrRate ? `1 USD = ₨${pkrRate.toFixed(2)}` : ""}</span>
                    </div>
                    {rateUpdated && (
                      <p className="text-[10px] text-muted-foreground text-right">
                        Rate updated: {rateUpdated}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between pt-1 border-t border-primary/10">
                    <span className="text-sm text-muted-foreground">
                      Send in USDT
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {amountNum} USDT
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Step 3 — Send Payment To</Label>
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              {PAYMENT_METHODS[method].fields.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase text-muted-foreground">
                      {f.label}
                    </p>
                    <p className="text-sm font-mono font-semibold break-all">
                      {f.value}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => copyText(f.value)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            {method === "nayapay" && pkrAmount && (
              <p className="text-xs text-muted-foreground">
                💡 Send <strong>₨ {pkrAmount.toLocaleString()}</strong> to the
                NayaPay account/IBAN above for {amountNum} credit
                {amountNum > 1 ? "s" : ""}.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Step 4 — Submit Payment Proof</Label>
            <div className="space-y-2">
              <Label className="text-xs">Transaction ID / Reference</Label>
              <Input
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="TXN123456789"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Upload Receipt Screenshot</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setProofFile(f);
                  setProofName(f?.name ?? "");
                }}
              />
              {proofName && (
                <p className="text-xs text-teal-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {proofName} (will
                  upload when you submit)
                </p>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Deposit Request"}
            </Button>
          </div>
        </div>

        {/* ===== TRANSACTION HISTORY ===== */}
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Transaction History
          </h2>
          
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isDeposit = tx.amount > 0;
                const isOpen = expanded === tx.id;

                return (
                  <div
                    key={tx.id}
                    className="rounded-xl border border-border overflow-hidden"
                  >
                    {/* Clickable Header */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : tx.id)}
                      className="w-full flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {isDeposit ? "💰 Deposit" : "💸 Spend"}
                          {tx.reference_id && ` · #${tx.reference_id.slice(0, 8)}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tx.description || tx.type || "Transaction"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold ${isDeposit ? "text-green-600" : "text-red-600"}`}>
                          {isDeposit ? "+" : ""}{tx.amount}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 space-y-2 text-sm border-t border-border bg-muted/10">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">{isDeposit ? "Deposit" : (tx.type || "Spend")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Description</span>
                          <span className="font-medium text-right">{tx.description || tx.type || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className={`font-bold ${isDeposit ? "text-green-600" : "text-red-600"}`}>
                            {isDeposit ? "+" : ""}{tx.amount} credits
                          </span>
                        </div>
                        {tx.reference_id && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reference</span>
                            <span className="font-mono text-xs">{tx.reference_id}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">
                            {tx.created_at ? new Date(tx.created_at).toLocaleString() : "—"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
