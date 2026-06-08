import { CreditTxnKind } from "@/backend";
import type { CreditTransaction } from "@/backend";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getBackendActor } from "@/lib/actor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CreditCard,
  Download,
  Loader2,
  Minus,
  Plus,
  Receipt,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatDate(ts: bigint): string {
  const ms = Number(ts) < 1e15 ? Number(ts) * 1000 : Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(ts: bigint): string {
  const ms = Number(ts) < 1e15 ? Number(ts) * 1000 : Number(ts) / 1_000_000;
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function txKindLabel(kind: CreditTxnKind): string {
  switch (kind) {
    case CreditTxnKind.Purchase:
      return "Credit Purchase";
    case CreditTxnKind.AdminGrant:
      return "Admin Grant";
    case CreditTxnKind.SpentOnCase:
      return "Case Submission";
    case CreditTxnKind.SpentOnUnlock:
      return "Case Unlock";
    default:
      return "Transaction";
  }
}

interface TxRowProps {
  tx: CreditTransaction;
  runningBalance: number;
  showReceipt: boolean;
}

function TxRow({ tx, runningBalance, showReceipt }: TxRowProps) {
  const isCredit =
    tx.kind === CreditTxnKind.Purchase || tx.kind === CreditTxnKind.AdminGrant;
  const amount = Number(tx.amount);

  function handleDownloadReceipt() {
    const lines = [
      "GIVETHRA PAYMENT RECEIPT",
      "-".repeat(40),
      `Id: ${tx.id.toString()}`,
      `Date: ${formatDate(tx.createdAt)} at ${formatTime(tx.createdAt)}`,
      `Type: ${txKindLabel(tx.kind)}`,
      `Amount: ${isCredit ? "+" : "-"}${Math.abs(amount)} Credits`,
      `USD Value: $${Math.abs(amount).toFixed(2)} USD`,
      `Description: ${tx.note ?? txKindLabel(tx.kind)}`,
      `Balance After: ${runningBalance} Credits`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `givethra-receipt-${tx.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  }

  return (
    <div
      className="flex items-start gap-3 py-3"
      data-ocid={`wallet.tx_item.${tx.id}`}
    >
      <div
        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCredit ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400"}`}
      >
        {isCredit ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {tx.note ?? txKindLabel(tx.kind)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(tx.createdAt)} at {formatTime(tx.createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-semibold ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
        >
          {isCredit ? "+" : "-"}
          {Math.abs(amount)}
        </p>
        <p className="text-xs text-muted-foreground">{runningBalance} bal</p>
      </div>
      {showReceipt && isCredit && (
        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Download receipt"
          data-ocid={`wallet.receipt_button.${tx.id}`}
          title="Download receipt"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function EmptyTransactions({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-ocid="wallet.empty_state"
    >
      <Receipt className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        No {label} yet
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Your {label.toLowerCase()} will appear here.
      </p>
    </div>
  );
}

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const actor = getBackendActor();
  const [creditsToBuy, setCreditsToBuy] = useState(5);

  const {
    data: balance = BigInt(0),
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useQuery<bigint>({
    queryKey: ["wallet"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getWallet();
    },
    enabled: !!actor && isAuthenticated,
  });

  const {
    data: transactions = [],
    isLoading: txLoading,
    refetch: refetchTx,
  } = useQuery<CreditTransaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && isAuthenticated,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const successUrl = `${window.location.origin}/wallet?success=1`;
      const cancelUrl = `${window.location.origin}/wallet?cancelled=1`;
      return actor.createCreditPurchaseSession(
        BigInt(creditsToBuy),
        successUrl,
        cancelUrl,
      );
    },
    onSuccess: (checkoutUrl) => {
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to create checkout session. Please try again.");
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Purchase failed. Please try again.",
      );
    },
  });

  function withRunningBalances(
    txList: CreditTransaction[],
  ): { tx: CreditTransaction; runningBalance: number }[] {
    const sorted = [...txList].sort(
      (a, b) => Number(a.createdAt) - Number(b.createdAt),
    );
    let running = 0;
    const result = sorted.map((tx) => {
      const isCredit =
        tx.kind === CreditTxnKind.Purchase ||
        tx.kind === CreditTxnKind.AdminGrant;
      running += isCredit ? Number(tx.amount) : -Number(tx.amount);
      return { tx, runningBalance: running };
    });
    return result.reverse();
  }

  const purchaseTabTx = transactions.filter(
    (tx) =>
      tx.kind === CreditTxnKind.Purchase ||
      tx.kind === CreditTxnKind.AdminGrant,
  );
  const usageTabTx = transactions.filter(
    (tx) =>
      tx.kind === CreditTxnKind.SpentOnCase ||
      tx.kind === CreditTxnKind.SpentOnUnlock,
  );
  const refundTabTx: CreditTransaction[] = [];
  const allWithBalances = withRunningBalances(transactions);

  function getBalanceForTx(txId: bigint): number {
    return allWithBalances.find((e) => e.tx.id === txId)?.runningBalance ?? 0;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center p-6">
          <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">Sign in required</p>
          <p className="text-muted-foreground text-sm mb-4">
            Please sign in to access your wallet.
          </p>
          <Button
            onClick={() => navigate({ to: "/sign-in" })}
            data-ocid="wallet.sign_in_button"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const isLoading = balanceLoading || txLoading;

  return (
    <div className="min-h-screen bg-background pb-24" data-ocid="wallet.page">
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/profile/$id", params: { id: "me" } })
            }
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Back"
            data-ocid="wallet.back_button"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground text-lg flex-1">
            Wallet
          </h1>
          <button
            type="button"
            onClick={() => {
              refetchBalance();
              refetchTx();
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Refresh"
            data-ocid="wallet.refresh_button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Card
          className="border-0 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0166FF 0%, #0148B5 100%)",
          }}
          data-ocid="wallet.balance_card"
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Support Credits Balance
                </p>
                {isLoading ? (
                  <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-5xl font-bold tracking-tight">
                    {Number(balance).toLocaleString()}
                  </p>
                )}
                <p className="text-blue-200 text-sm mt-2">
                  approx. ${Number(balance).toFixed(2)} USD
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                1 Credit = $1 USD
              </Badge>
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                Platform Fees Only
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border border-border"
          data-ocid="wallet.purchase_section"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Purchase Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Credits are used to submit help requests (1 credit) and unlock
              case details (2 credits).
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCreditsToBuy((n) => Math.max(1, n - 1))}
                className="h-10 w-10 rounded-xl border border-border bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                aria-label="Decrease amount"
                data-ocid="wallet.credits_decrease_button"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-foreground">
                  {creditsToBuy}
                </p>
                <p className="text-xs text-muted-foreground">credits</p>
              </div>
              <button
                type="button"
                onClick={() => setCreditsToBuy((n) => Math.min(100, n + 1))}
                className="h-10 w-10 rounded-xl border border-border bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                aria-label="Increase amount"
                data-ocid="wallet.credits_increase_button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">
                ${creditsToBuy.toFixed(2)} USD
              </span>
            </div>
            <Button
              type="button"
              className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
              onClick={() => purchaseMutation.mutate()}
              disabled={purchaseMutation.isPending || !actor}
              data-ocid="wallet.purchase_button"
            >
              {purchaseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase {creditsToBuy} Credit{creditsToBuy !== 1 ? "s" : ""}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Secured by Stripe. Visa and Mastercard accepted.
            </p>
          </CardContent>
        </Card>

        <Card
          className="border border-border"
          data-ocid="wallet.transactions_section"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <LoadingSpinner size="md" label="Loading transactions..." />
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-6 pb-6">
                <EmptyTransactions label="transactions" />
              </div>
            ) : (
              <Tabs defaultValue="purchases" className="w-full">
                <div className="px-4 pt-1 pb-3">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger
                      value="purchases"
                      data-ocid="wallet.purchases_tab"
                    >
                      Purchases
                      {purchaseTabTx.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1.5 h-4 px-1.5 text-[10px]"
                        >
                          {purchaseTabTx.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="usage" data-ocid="wallet.usage_tab">
                      Usage
                      {usageTabTx.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1.5 h-4 px-1.5 text-[10px]"
                        >
                          {usageTabTx.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="refunds" data-ocid="wallet.refunds_tab">
                      Refunds
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="purchases" className="px-4 pb-4 mt-0">
                  {purchaseTabTx.length === 0 ? (
                    <EmptyTransactions label="purchases" />
                  ) : (
                    <div
                      className="divide-y divide-border"
                      data-ocid="wallet.purchases_list"
                    >
                      {purchaseTabTx.map((tx) => (
                        <TxRow
                          key={String(tx.id)}
                          tx={tx}
                          runningBalance={getBalanceForTx(tx.id)}
                          showReceipt={true}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="usage" className="px-4 pb-4 mt-0">
                  {usageTabTx.length === 0 ? (
                    <EmptyTransactions label="usage records" />
                  ) : (
                    <div
                      className="divide-y divide-border"
                      data-ocid="wallet.usage_list"
                    >
                      {usageTabTx.map((tx) => (
                        <TxRow
                          key={String(tx.id)}
                          tx={tx}
                          runningBalance={getBalanceForTx(tx.id)}
                          showReceipt={false}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="refunds" className="px-4 pb-4 mt-0">
                  {refundTabTx.length === 0 ? (
                    <EmptyTransactions label="refunds" />
                  ) : (
                    <div className="divide-y divide-border">
                      {refundTabTx.map((tx) => (
                        <TxRow
                          key={String(tx.id)}
                          tx={tx}
                          runningBalance={getBalanceForTx(tx.id)}
                          showReceipt={false}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 px-1">
          <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-bold text-primary">i</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Support Credits are for platform fees only. They cannot be
            transferred or withdrawn. 1 Credit = $1 USD.
          </p>
        </div>
      </main>
    </div>
  );
}
