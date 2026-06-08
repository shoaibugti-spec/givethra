import { c as createLucideIcon, a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, R as RefreshCw, b as LoadingSpinner, f as ue } from "./index-BoYH-a4m.js";
import { u as useActor, a as useQuery, b as CreditTxnKind, c as createActor } from "./backend-B2Q1poOu.js";
import { B as Badge } from "./badge-BcZEG4YE.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-BFaW8de3.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BgUMnp3z.js";
import { u as useMutation } from "./useMutation-Caci9WDk.js";
import { W as Wallet } from "./wallet-CyTt3v14.js";
import { A as ArrowLeft } from "./arrow-left-B4uH5VB3.js";
import { C as CreditCard } from "./credit-card-Qm0roWIo.js";
import { P as Plus } from "./plus-DtereOLo.js";
import { L as LoaderCircle } from "./loader-circle-CeGdzNNF.js";
import "./index-BjTlUSa6.js";
import "./index-NruUtonI.js";
import "./index-sQmzYE_i.js";
import "./index-D2a02oHk.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    { d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z", key: "q3az6g" }
  ],
  ["path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", key: "1h4pet" }],
  ["path", { d: "M12 17.5v-11", key: "1jc1ny" }]
];
const Receipt = createLucideIcon("receipt", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M16 17h6v-6", key: "t6n2it" }],
  ["path", { d: "m22 17-8.5-8.5-5 5L2 7", key: "x473p" }]
];
const TrendingDown = createLucideIcon("trending-down", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
function formatDate(ts) {
  const ms = Number(ts) < 1e15 ? Number(ts) * 1e3 : Number(ts) / 1e6;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatTime(ts) {
  const ms = Number(ts) < 1e15 ? Number(ts) * 1e3 : Number(ts) / 1e6;
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function txKindLabel(kind) {
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
function TxRow({ tx, runningBalance, showReceipt }) {
  const isCredit = tx.kind === CreditTxnKind.Purchase || tx.kind === CreditTxnKind.AdminGrant;
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
      `Balance After: ${runningBalance} Credits`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `givethra-receipt-${tx.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    ue.success("Receipt downloaded!");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-3 py-3",
      "data-ocid": `wallet.tx_item.${tx.id}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCredit ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400"}`,
            children: isCredit ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground leading-tight", children: tx.note ?? txKindLabel(tx.kind) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            formatDate(tx.createdAt),
            " at ",
            formatTime(tx.createdAt)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: `text-sm font-semibold ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`,
              children: [
                isCredit ? "+" : "-",
                Math.abs(amount)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            runningBalance,
            " bal"
          ] })
        ] }),
        showReceipt && isCredit && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleDownloadReceipt,
            className: "shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
            "aria-label": "Download receipt",
            "data-ocid": `wallet.receipt_button.${tx.id}`,
            title: "Download receipt",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" })
          }
        )
      ]
    }
  );
}
function EmptyTransactions({ label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col items-center justify-center py-12 text-center",
      "data-ocid": "wallet.empty_state",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-10 w-10 text-muted-foreground/40 mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-muted-foreground", children: [
          "No ",
          label,
          " yet"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/70 mt-1", children: [
          "Your ",
          label.toLowerCase(),
          " will appear here."
        ] })
      ]
    }
  );
}
function WalletPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useActor(createActor);
  const [creditsToBuy, setCreditsToBuy] = reactExports.useState(5);
  const {
    data: balance = BigInt(0),
    isLoading: balanceLoading,
    refetch: refetchBalance
  } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getWallet();
    },
    enabled: !!actor && !isFetching && isAuthenticated
  });
  const {
    data: transactions = [],
    isLoading: txLoading,
    refetch: refetchTx
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !isFetching && isAuthenticated
  });
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const successUrl = `${window.location.origin}/wallet?success=1`;
      const cancelUrl = `${window.location.origin}/wallet?cancelled=1`;
      return actor.createCreditPurchaseSession(
        BigInt(creditsToBuy),
        successUrl,
        cancelUrl
      );
    },
    onSuccess: (checkoutUrl) => {
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        ue.error("Failed to create checkout session. Please try again.");
      }
    },
    onError: (err) => {
      ue.error(
        err instanceof Error ? err.message : "Purchase failed. Please try again."
      );
    }
  });
  function withRunningBalances(txList) {
    const sorted = [...txList].sort(
      (a, b) => Number(a.createdAt) - Number(b.createdAt)
    );
    let running = 0;
    const result = sorted.map((tx) => {
      const isCredit = tx.kind === CreditTxnKind.Purchase || tx.kind === CreditTxnKind.AdminGrant;
      running += isCredit ? Number(tx.amount) : -Number(tx.amount);
      return { tx, runningBalance: running };
    });
    return result.reverse();
  }
  const purchaseTabTx = transactions.filter(
    (tx) => tx.kind === CreditTxnKind.Purchase || tx.kind === CreditTxnKind.AdminGrant
  );
  const usageTabTx = transactions.filter(
    (tx) => tx.kind === CreditTxnKind.SpentOnCase || tx.kind === CreditTxnKind.SpentOnUnlock
  );
  const refundTabTx = [];
  const allWithBalances = withRunningBalances(transactions);
  function getBalanceForTx(txId) {
    var _a;
    return ((_a = allWithBalances.find((e) => e.tx.id === txId)) == null ? void 0 : _a.runningBalance) ?? 0;
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-sm text-center p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground font-medium mb-2", children: "Sign in required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mb-4", children: "Please sign in to access your wallet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => navigate({ to: "/sign-in" }),
          "data-ocid": "wallet.sign_in_button",
          children: "Sign In"
        }
      )
    ] }) });
  }
  const isLoading = balanceLoading || txLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24", "data-ocid": "wallet.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 bg-card border-b border-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 h-14 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate({ to: "/profile/$id", params: { id: "me" } }),
          className: "p-2 rounded-lg hover:bg-muted transition-colors",
          "aria-label": "Back",
          "data-ocid": "wallet.back_button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-foreground" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-foreground text-lg flex-1", children: "Wallet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            refetchBalance();
            refetchTx();
          },
          className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
          "aria-label": "Refresh",
          "data-ocid": "wallet.refresh_button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-2xl mx-auto px-4 py-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "border-0 text-white relative overflow-hidden",
          style: {
            background: "linear-gradient(135deg, #0166FF 0%, #0148B5 100%)"
          },
          "data-ocid": "wallet.balance_card",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6 pb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-100 text-sm font-medium mb-1", children: "Support Credits Balance" }),
                isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-32 bg-white/20 rounded-lg animate-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-5xl font-bold tracking-tight", children: Number(balance).toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-200 text-sm mt-2", children: [
                  "approx. $",
                  Number(balance).toFixed(2),
                  " USD"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-7 w-7 text-white" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-white/20 text-white border-0 hover:bg-white/30", children: "1 Credit = $1 USD" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-white/20 text-white border-0 hover:bg-white/30", children: "Platform Fees Only" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "border border-border",
          "data-ocid": "wallet.purchase_section",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-primary" }),
              "Purchase Credits"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Credits are used to submit help requests (1 credit) and unlock case details (2 credits)." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setCreditsToBuy((n) => Math.max(1, n - 1)),
                    className: "h-10 w-10 rounded-xl border border-border bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors",
                    "aria-label": "Decrease amount",
                    "data-ocid": "wallet.credits_decrease_button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-foreground", children: creditsToBuy }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "credits" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setCreditsToBuy((n) => Math.min(100, n + 1)),
                    className: "h-10 w-10 rounded-xl border border-border bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors",
                    "aria-label": "Increase amount",
                    "data-ocid": "wallet.credits_increase_button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-muted/50 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
                  "$",
                  creditsToBuy.toFixed(2),
                  " USD"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  className: "w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold",
                  onClick: () => purchaseMutation.mutate(),
                  disabled: purchaseMutation.isPending || !actor,
                  "data-ocid": "wallet.purchase_button",
                  children: purchaseMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
                    "Redirecting to checkout..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 mr-2" }),
                    "Purchase ",
                    creditsToBuy,
                    " Credit",
                    creditsToBuy !== 1 ? "s" : ""
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Secured by Stripe. Visa and Mastercard accepted." })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "border border-border",
          "data-ocid": "wallet.transactions_section",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-primary" }),
              "Transaction History"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "md", label: "Loading transactions..." }) }) : transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyTransactions, { label: "transactions" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "purchases", className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-1 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  TabsTrigger,
                  {
                    value: "purchases",
                    "data-ocid": "wallet.purchases_tab",
                    children: [
                      "Purchases",
                      purchaseTabTx.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: "secondary",
                          className: "ml-1.5 h-4 px-1.5 text-[10px]",
                          children: purchaseTabTx.length
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "usage", "data-ocid": "wallet.usage_tab", children: [
                  "Usage",
                  usageTabTx.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      variant: "secondary",
                      className: "ml-1.5 h-4 px-1.5 text-[10px]",
                      children: usageTabTx.length
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "refunds", "data-ocid": "wallet.refunds_tab", children: "Refunds" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "purchases", className: "px-4 pb-4 mt-0", children: purchaseTabTx.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyTransactions, { label: "purchases" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "divide-y divide-border",
                  "data-ocid": "wallet.purchases_list",
                  children: purchaseTabTx.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TxRow,
                    {
                      tx,
                      runningBalance: getBalanceForTx(tx.id),
                      showReceipt: true
                    },
                    String(tx.id)
                  ))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "usage", className: "px-4 pb-4 mt-0", children: usageTabTx.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyTransactions, { label: "usage records" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "divide-y divide-border",
                  "data-ocid": "wallet.usage_list",
                  children: usageTabTx.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TxRow,
                    {
                      tx,
                      runningBalance: getBalanceForTx(tx.id),
                      showReceipt: false
                    },
                    String(tx.id)
                  ))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "refunds", className: "px-4 pb-4 mt-0", children: refundTabTx.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyTransactions, { label: "refunds" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: refundTabTx.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                TxRow,
                {
                  tx,
                  runningBalance: getBalanceForTx(tx.id),
                  showReceipt: false
                },
                String(tx.id)
              )) }) })
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-primary", children: "i" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Support Credits are for platform fees only. They cannot be transferred or withdrawn. 1 Credit = $1 USD." })
      ] })
    ] })
  ] });
}
export {
  WalletPage as default
};
