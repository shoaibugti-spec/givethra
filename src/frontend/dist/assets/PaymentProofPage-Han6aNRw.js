import { c as createLucideIcon, u as useAuth, O as useLocation, f as useNavigate, r as reactExports, C as getCaseById, F as getCaseResolutions, Q as getCasesByIds, P as getCaseUnlocksByHero, o as ue, j as jsxRuntimeExports } from "./main-g9K_ERoM.js";
import { L as Layout } from "./Layout-C2xD75Ts.js";
import { B as Button } from "./button-B16x4Aev.js";
import { A as ArrowLeft } from "./arrow-left-DT46p4Ta.js";
import { L as LoaderCircle } from "./loader-circle-BACKBKXa.js";
import { D as Download } from "./download-CYQVgnCQ.js";
import { C as Check } from "./check-B6vJHeh3.js";
import { C as Copy } from "./copy-DnozwKm-.js";
import "./x-0HxdDPFz.js";
import "./heart-jbpX9LjB.js";
import "./lock-VvpKTfA-.js";
import "./message-circle-Ds5NPe60.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const FileCheck2 = createLucideIcon("FileCheck2", [
  ["path", { d: "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4", key: "1pf5j1" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m3 15 2 2 4-4", key: "1lhrkk" }]
]);
function PaymentProofPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [proofUrl, setProofUrl] = reactExports.useState("");
  const [transactionId, setTransactionId] = reactExports.useState("");
  const [copied, setCopied] = reactExports.useState(false);
  const [caseTitle, setCaseTitle] = reactExports.useState("Payment proof");
  const [loading, setLoading] = reactExports.useState(true);
  const [downloading, setDownloading] = reactExports.useState(false);
  const caseId = reactExports.useMemo(() => {
    const match = location.pathname.match(/^\/payment-proof\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [location.pathname]);
  const isPdf = /\.pdf(\?.*)?$/i.test(proofUrl);
  reactExports.useEffect(() => {
    let active = true;
    if (!(user == null ? void 0 : user.id) || !caseId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    Promise.allSettled([
      getCaseById(caseId),
      getCaseResolutions(caseId),
      getCasesByIds([caseId]),
      getCaseUnlocksByHero(user.id)
    ]).then((results) => {
      var _a;
      if (!active) return;
      const caseData = results[0].status === "fulfilled" ? results[0].value : null;
      const resolutions = results[1].status === "fulfilled" && Array.isArray(results[1].value) ? results[1].value : [];
      const casesByIds = results[2].status === "fulfilled" && Array.isArray(results[2].value) ? results[2].value : [];
      const unlocks = results[3].status === "fulfilled" && Array.isArray(results[3].value) ? results[3].value : [];
      let url = "";
      let txn = "";
      if (caseData) {
        url = caseData.paid_receipt_url || caseData.payment_receipt_url || caseData.payment_proof_url || caseData.receipt_url || "";
        txn = caseData.transaction_id || caseData.reference_number || caseData.consumer_no || caseData.payment_transaction_id || "";
      }
      if (!url && casesByIds.length > 0) {
        const c = casesByIds[0];
        url = c.payment_receipt_url || c.paid_receipt_url || c.payment_proof_url || c.receipt_url || "";
        if (!txn) txn = c.payment_transaction_id || c.transaction_id || c.reference_number || "";
      }
      if (!url && resolutions.length > 0) {
        const withReceipt = resolutions.find((r) => r.receipt_url || r.paid_receipt_url);
        if (withReceipt) {
          url = withReceipt.receipt_url || withReceipt.paid_receipt_url || "";
          if (!txn) txn = withReceipt.transaction_id || "";
        }
      }
      if (!url) {
        const userUnlock = unlocks.find((u) => String(u.case_id) === String(caseId));
        if (userUnlock) {
          url = userUnlock.receipt_url || userUnlock.paid_receipt_url || "";
          if (!txn) txn = userUnlock.transaction_id || "";
        }
      }
      setCaseTitle((caseData == null ? void 0 : caseData.title) || ((_a = casesByIds[0]) == null ? void 0 : _a.title) || "Payment proof");
      setProofUrl(url);
      setTransactionId(txn);
    }).catch(() => {
      if (active) ue.error("Unable to load payment proof.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [caseId, user == null ? void 0 : user.id]);
  const copyTxn = () => {
    if (!transactionId) return;
    navigator.clipboard.writeText(transactionId);
    setCopied(true);
    ue.success("Transaction ID copied!");
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleDownload = async () => {
    var _a;
    if (!proofUrl || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(proofUrl);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const rawName = ((_a = proofUrl.split("/").pop()) == null ? void 0 : _a.split("?")[0]) || "payment-proof";
      const fileName = rawName.includes(".") ? rawName : `${rawName}.jpg`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1e3);
      ue.success("Download started!");
    } catch (err) {
      console.error(err);
      ue.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl px-4 py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Sign in required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-5", onClick: () => navigate({ to: "/sign-in" }), children: "Sign in" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-4xl px-4 py-5 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => navigate({ to: "/my-help" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
        "Back to My Help"
      ] }),
      proofUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleDownload, disabled: downloading, children: [
        downloading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
        downloading ? "Downloading..." : "Download"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border bg-card p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3 border-b pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck2, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold", children: "Verified Payment Proof" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: caseTitle })
        ] })
      ] }),
      !loading && proofUrl && transactionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-primary", children: "Transaction ID / Reference Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-bold text-foreground break-all", children: transactionId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "shrink-0 ml-2", onClick: copyTxn, children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-20 text-center text-sm text-muted-foreground", children: "Loading payment proof..." }) : proofUrl ? (
        // 🔥 Show image inline (fits fully, no zoom) — PDF uses iframe
        isPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "iframe",
          {
            title: "Verified payment proof",
            src: proofUrl,
            className: "h-[75vh] w-full rounded-xl border bg-white"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full items-center justify-center rounded-xl border bg-white p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: proofUrl,
            alt: "Verified payment proof",
            className: "block max-h-[75vh] w-auto max-w-full rounded object-contain"
          }
        ) })
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-20 text-center text-sm text-muted-foreground", children: "No payment proof is available for this record." })
    ] })
  ] }) });
}
export {
  PaymentProofPage as default
};
