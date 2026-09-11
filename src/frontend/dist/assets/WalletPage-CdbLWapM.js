import { e as useAuth, r as reactExports, b as getWallet, N as getUserSuspension, aI as getTransactions, m as getUserSupports, l as jsxRuntimeExports, W as Wallet, R as RefreshCw, p as ue, J as uploadFileToStorage, aJ as insertDeposit, V as upsertUserSuspension } from "./main-CYM9BeWF.js";
import { L as Layout } from "./Layout-PIwTKxdu.js";
import { B as Button } from "./button-BoXCjEAF.js";
import { I as Input } from "./input-Bb6IchX3.js";
import { L as Label } from "./label-CT-R-jpA.js";
import { C as Coins } from "./coins-CT2vww1C.js";
import { C as Copy } from "./copy-uttETGYp.js";
import { C as CircleCheck } from "./circle-check-DzEnRCnr.js";
import { C as Clock } from "./clock-jnNgLhvf.js";
import { C as ChevronDown } from "./chevron-down-DbuGCb17.js";
import "./users-DQ_fG41C.js";
import "./x-z1TbCY5C.js";
import "./heart-BeKUzFrD.js";
import "./message-circle-CsflEQIJ.js";
import "./index-CeDhMLko.js";
const PAYMENT_METHODS = {
  nayapay: {
    name: "NayaPay",
    icon: "💸",
    fields: [
      { label: "Account Title", value: "Shoaib Ahmed" },
      { label: "Account No / IBAN", value: "PK93NAYA1234503331641604" }
    ]
  },
  binance: {
    name: "Crypto Currency (USDT)",
    icon: "₿",
    fields: [
      { label: "USDT Address (TRC20)", value: "TNjaCQjQ5Yzm5tiVF8s121rUv5BH7y6hAC" },
      { label: "Network", value: "TRC20 (Tron)" }
    ]
  }
};
const QUICK_AMOUNTS = [1, 2, 3, 5, 10, 20];
const SUSPENSION_UNLOCK_CREDITS = 5;
function WalletPage() {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = reactExports.useState(0);
  const [isSuspended, setIsSuspended] = reactExports.useState(false);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [supportsData, setSupportsData] = reactExports.useState({ supports: 0, creditsFromSupports: 0 });
  const [loading, setLoading] = reactExports.useState(true);
  const [method, setMethod] = reactExports.useState("nayapay");
  const [amount, setAmount] = reactExports.useState("");
  const [txId, setTxId] = reactExports.useState("");
  const [proofFile, setProofFile] = reactExports.useState(null);
  const [proofName, setProofName] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState(null);
  const [unlocking, setUnlocking] = reactExports.useState(false);
  const [pkrRate, setPkrRate] = reactExports.useState(null);
  const [rateLoading, setRateLoading] = reactExports.useState(true);
  const [rateUpdated, setRateUpdated] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (user) loadWallet();
    else setLoading(false);
    loadRate();
  }, [user]);
  async function loadRate() {
    var _a;
    setRateLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      const rate = (_a = data == null ? void 0 : data.rates) == null ? void 0 : _a.PKR;
      if (rate) {
        setPkrRate(rate);
        setRateUpdated((/* @__PURE__ */ new Date()).toLocaleString());
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
      const wallet = await getWallet(user.id);
      setBalance((wallet == null ? void 0 : wallet.balance) ?? 0);
      const suspension = await getUserSuspension(user.id);
      setIsSuspended(Boolean(suspension == null ? void 0 : suspension.is_active));
      const [txs, supportMetrics] = await Promise.all([
        getTransactions(user.id),
        getUserSupports(user.id)
      ]);
      setTransactions(txs ?? []);
      setSupportsData({ supports: Number((supportMetrics == null ? void 0 : supportMetrics.supports) || 0), creditsFromSupports: Number((supportMetrics == null ? void 0 : supportMetrics.creditsFromSupports) || 0) });
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setLoading(false);
    }
  }
  function copyText(text) {
    navigator.clipboard.writeText(text);
    ue.success("Copied!");
  }
  async function handleSubmit() {
    if (!amount || parseFloat(amount) < 1) {
      ue.error("Enter a valid amount (min $1)");
      return;
    }
    if (!txId) {
      ue.error("Enter transaction ID / reference");
      return;
    }
    if (!proofFile) {
      ue.error("Upload payment proof");
      return;
    }
    setSubmitting(true);
    try {
      const safeProofName = proofFile.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `deposits/${user.id}/${Date.now()}-${safeProofName}`;
      const proofUrl = await uploadFileToStorage(proofFile, path);
      const depositData = {
        user_id: user.id,
        method: PAYMENT_METHODS[method].name,
        amount: parseFloat(amount),
        currency: method === "binance" ? "USDT" : "USD",
        transaction_id: txId,
        proof_url: proofUrl,
        credits: parseFloat(amount),
        status: "pending",
        submitted_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      await insertDeposit(depositData);
      ue.success("Deposit submitted! Credits will be added after Givethra reviews it.");
      setAmount("");
      setTxId("");
      setProofFile(null);
      setProofName("");
      loadWallet();
    } catch (err) {
      ue.error(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setSubmitting(false);
    }
  }
  async function handleUnlockAccount() {
    if (!(user == null ? void 0 : user.id)) return;
    setUnlocking(true);
    try {
      await upsertUserSuspension({
        user_id: user.id,
        is_active: false
      });
      ue.success(`✅ Account unlocked! ${SUSPENSION_UNLOCK_CREDITS} credits deducted.`);
      setIsSuspended(false);
      await loadWallet();
    } catch (err) {
      ue.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUnlocking(false);
    }
  }
  if (!isAuthenticated)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground", children: "Please sign in." }) });
  const amountNum = parseFloat(amount) || 0;
  const pkrAmount = pkrRate ? Math.round(amountNum * pkrRate) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5 opacity-80" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm opacity-90", children: "Credits Balance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold", children: balance.toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm opacity-80 mt-1", children: [
        "≈ $",
        balance.toLocaleString(),
        " USD · 1 Credit = $1"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Supports Received" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-foreground", children: supportsData.supports.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Credits Earned from Supports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-primary", children: supportsData.creditsFromSupports.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground", children: "100 Supports = 1 Credit. Credits earned from Supports are non-withdrawable and can only be used for case submission, contribution unlocks, and suspension unlock." })
    ] }),
    isSuspended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Account suspended" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
        "You can still view your wallet and add credits, but submitting a case or helping a case is disabled. Add at least ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          SUSPENSION_UNLOCK_CREDITS,
          " credits"
        ] }),
        ", then click the button below to unlock."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "mt-3",
          variant: "outline",
          onClick: handleUnlockAccount,
          disabled: balance < SUSPENSION_UNLOCK_CREDITS || unlocking,
          children: unlocking ? "Unlocking..." : `Unlock Account (${SUSPENSION_UNLOCK_CREDITS} Credits)`
        }
      ),
      balance < SUSPENSION_UNLOCK_CREDITS && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
        "You need ",
        SUSPENSION_UNLOCK_CREDITS - balance,
        " more credits."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/40 border p-4 text-xs text-muted-foreground space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "• Submitting a help request costs ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1 Credit" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "• Unlocking a verified case as a Hero costs ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1 Credit" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Credits are for platform fees only — not transferable or withdrawable" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-5 w-5 text-primary" }),
        " Deposit Credits"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Step 1 — Choose Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.keys(PAYMENT_METHODS).map(
          (m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setMethod(m),
              className: `px-3 py-3 rounded-lg border text-sm font-medium ${method === m ? "bg-primary text-white border-primary" : "border-border"}`,
              children: [
                PAYMENT_METHODS[m].icon,
                " ",
                PAYMENT_METHODS[m].name
              ]
            },
            m
          )
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Step 2 — Choose Amount (Credits)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: QUICK_AMOUNTS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setAmount(String(a)),
            className: `px-3 py-2.5 rounded-lg border text-sm font-medium ${amount === String(a) ? "bg-primary text-white border-primary" : "border-border"}`,
            children: [
              a,
              " Credit",
              a > 1 ? "s" : ""
            ]
          },
          a
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: "1",
            value: amount,
            onChange: (e) => setAmount(e.target.value),
            placeholder: "Or enter custom amount (USD)",
            className: "mt-2"
          }
        ),
        amountNum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/5 border border-primary/20 p-4 mt-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "You are buying" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-foreground", children: [
              amountNum,
              " Credit",
              amountNum > 1 ? "s" : "",
              " = $",
              amountNum,
              " USD"
            ] })
          ] }),
          method === "nayapay" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-1 border-t border-primary/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Pay in PKR (NayaPay)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-primary", children: rateLoading ? "Loading..." : pkrAmount ? `₨ ${pkrAmount.toLocaleString()}` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: loadRate,
                  className: "inline-flex items-center gap-1 hover:text-primary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3" }),
                    " Refresh rate"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pkrRate ? `1 USD = ₨${pkrRate.toFixed(2)}` : "" })
            ] }),
            rateUpdated && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground text-right", children: [
              "Rate updated: ",
              rateUpdated
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-1 border-t border-primary/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Send in USDT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold text-primary", children: [
              amountNum,
              " USDT"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Step 3 — Send Payment To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-muted/50 p-4 space-y-3", children: PAYMENT_METHODS[method].fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase text-muted-foreground", children: f.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono font-semibold break-all", children: f.value })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "shrink-0",
                  onClick: () => copyText(f.value),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" })
                }
              )
            ]
          },
          f.label
        )) }),
        method === "nayapay" && pkrAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "💡 Send ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "₨ ",
            pkrAmount.toLocaleString()
          ] }),
          " to the NayaPay account/IBAN above for ",
          amountNum,
          " credit",
          amountNum > 1 ? "s" : "",
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Step 4 — Submit Payment Proof" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Transaction ID / Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: txId,
              onChange: (e) => setTxId(e.target.value),
              placeholder: "TXN123456789"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Upload Receipt Screenshot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "file",
              accept: "image/*",
              onChange: (e) => {
                var _a;
                const f = ((_a = e.target.files) == null ? void 0 : _a[0]) ?? null;
                setProofFile(f);
                setProofName((f == null ? void 0 : f.name) ?? "");
              }
            }
          ),
          proofName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
            " ",
            proofName,
            " (will upload when you submit)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "w-full",
            onClick: handleSubmit,
            disabled: submitting,
            children: submitting ? "Submitting..." : "Submit Deposit Request"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
        " Transaction History"
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "Loading..." }) : transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No transactions yet." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: transactions.map((tx) => {
        const isDeposit = tx.amount > 0;
        const isOpen = expanded === tx.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-xl border border-border overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setExpanded(isOpen ? null : tx.id),
                  className: "w-full flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors text-left",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
                        isDeposit ? "💰 Deposit" : "💸 Spend",
                        tx.reference_id && ` · #${tx.reference_id.slice(0, 8)}`
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground truncate", children: tx.description || tx.type || "Transaction" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${isDeposit ? "text-green-600" : "text-red-600"}`, children: [
                        isDeposit ? "+" : "",
                        tx.amount
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ChevronDown,
                        {
                          className: `h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`
                        }
                      )
                    ] })
                  ]
                }
              ),
              isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-3 pt-1 space-y-2 text-sm border-t border-border bg-muted/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Type" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: isDeposit ? "Deposit" : tx.type || "Spend" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Description" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: tx.description || tx.type || "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${isDeposit ? "text-green-600" : "text-red-600"}`, children: [
                    isDeposit ? "+" : "",
                    tx.amount,
                    " credits"
                  ] })
                ] }),
                tx.reference_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Reference" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: tx.reference_id })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: tx.created_at ? new Date(tx.created_at).toLocaleString() : "—" })
                ] })
              ] })
            ]
          },
          tx.id
        );
      }) })
    ] })
  ] }) });
}
export {
  WalletPage as default
};
