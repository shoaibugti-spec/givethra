// src/frontend/src/components/HelpMeSheets.tsx
// Bottom sheets used on the Help Me reel: payment/proof sheet, comments sheet, report sheet.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, Copy, ImagePlus, Loader2, Send, Trash2, X, Flag, ClipboardPaste, ShieldCheck } from "lucide-react";
import { uploadFileToStorage } from "@/lib/api";
import { compressImage, displayHelpMePaymentMethod, formatMoney, helpme, type Appeal, type HelpComment, type PaymentInfo } from "@/lib/helpme";

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div
        className="relative flex max-h-[88dvh] w-full max-w-[520px] flex-col rounded-t-[28px] border-t border-emerald-500/40 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div className="mx-auto absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40" />
          <h2 className="text-sm font-extrabold tracking-wide text-emerald-400">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 active:scale-95">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand("copy");
    } catch {
      /* ignore */
    }
    document.body.removeChild(el);
  }
  toast.success(`${label} copied`);
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/90 p-2.5">
      <div className="min-w-0 pr-2">
        <p className="text-[9px] font-semibold uppercase text-gray-400">{label}</p>
        <p className="break-all font-mono text-xs font-bold tracking-wider text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => copyText(value, label)}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600/30 px-3 py-1.5 text-xs font-bold text-emerald-300 active:scale-95"
      >
        <Copy className="h-3.5 w-3.5" /> Copy
      </button>
    </div>
  );
}

// ───────────── Help Me: payment details + proof form ─────────────
export function HelpSheet({ appeal, onClose, onDone }: { appeal: Appeal | null; onClose: () => void; onDone: () => void }) {
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [trx, setTrx] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInfo(null);
    setError("");
    setTrx("");
    setFile(null);
    setPreview("");
    if (!appeal) return;
    let live = true;
    setLoading(true);
    helpme
      .payment(appeal.id)
      .then((p) => {
        if (!live) return;
        setInfo(p);
        setAmount(String(p.remaining_local));
      })
      .catch((e) => live && setError(e.message || "Could not load payment details"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [appeal]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function pickFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please choose a screenshot image (JPG or PNG).");
    try {
      const small = await compressImage(f);
      if (preview) URL.revokeObjectURL(preview);
      setFile(small);
      setPreview(URL.createObjectURL(small));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not use this image");
    }
  }

  async function submit() {
    if (!appeal || !info) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return toast.error("Enter the amount you sent.");
    if (value > info.remaining_local + 0.005) return toast.error(`Only ${formatMoney(info.remaining_local, info.currency)} is still needed.`);
    if (trx.trim().length < 6) return toast.error("Enter the transaction ID from your payment receipt.");
    if (!file) return toast.error("Attach a screenshot of your payment.");
    setBusy(true);
    try {
      const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}${Math.random().toString(36).slice(2)}`;
      const proofUrl = await uploadFileToStorage(file, `helpme-proofs/${rand}.jpg`);
      await helpme.submitHelp(appeal.id, { amount: value, trx_id: trx.trim(), proof_url: proofUrl });
      toast.success("Thank you! An admin will verify your payment.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!appeal} onClose={busy ? () => undefined : onClose} title="HELP ME · ACCOUNT DETAILS">
      {loading && (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-emerald-400" /></div>
      )}
      {!loading && error && <p className="rounded-xl bg-red-500/15 p-4 text-sm text-red-200">{error}</p>}
      {!loading && info && (
        <div className="space-y-3">
          <p className="text-xs text-gray-300">
            Send the money directly to this person with the method below, then attach your screenshot and transaction ID. Givethra never holds the money.
          </p>
          <div className="space-y-2">
            <CopyRow label="Transfer type" value={displayHelpMePaymentMethod(info.pay_method)} />
            <CopyRow label="Account title" value={info.account_title} />
            <CopyRow label="Account number" value={info.account_number} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-lime-500 px-3 py-2 text-xs font-extrabold text-black">
            <span>Still needed</span>
            <span>{formatMoney(info.remaining_local, info.currency)}</span>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-3">
            <label className="block text-[11px] font-bold uppercase text-emerald-400">Amount you sent ({info.currency})</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-emerald-400"
            />
            <label className="block text-[11px] font-bold uppercase text-emerald-400">Transaction ID (TRX)</label>
            <div className="flex gap-2">
              <input
                value={trx}
                onChange={(e) => setTrx(e.target.value)}
                maxLength={40}
                placeholder="e.g. 12345678901"
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                aria-label="Paste"
                onClick={async () => { try { setTrx((await navigator.clipboard.readText()).trim().slice(0, 40)); } catch { toast.error("Paste is blocked by your browser. Type the ID instead."); } }}
                className="flex w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 active:scale-95"
              >
                <ClipboardPaste className="h-4 w-4" />
              </button>
            </div>
            <label className="block text-[11px] font-bold uppercase text-emerald-400">Payment screenshot</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void pickFile(e.target.files?.[0]); e.target.value = ""; }} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/10 py-3 text-sm font-bold text-emerald-300 active:scale-[0.99]"
            >
              <ImagePlus className="h-4 w-4" /> {file ? "Change screenshot" : "Attach screenshot"}
            </button>
            {preview && <img src={preview} alt="Payment screenshot preview" className="max-h-44 w-full rounded-xl border border-white/10 object-contain" />}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-extrabold text-white shadow-lg active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {busy ? "Submitting…" : "Submit for verification"}
          </button>
          <p className="flex items-center justify-center gap-1 text-center text-[10px] text-gray-400"><ShieldCheck className="h-3 w-3" /> Each transaction ID can be used only once.</p>
        </div>
      )}
    </Sheet>
  );
}

// ───────────── Comments ─────────────
export function CommentsSheet({
  appeal, signedIn, onClose, onNeedSignIn, onCountChange,
}: { appeal: Appeal | null; signedIn: boolean; onClose: () => void; onNeedSignIn: () => void; onCountChange: (id: string, delta: number) => void }) {
  const [items, setItems] = useState<HelpComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setItems([]);
    setText("");
    if (!appeal) return;
    let live = true;
    setLoading(true);
    helpme.comments(appeal.id).then((r) => live && setItems(r)).catch(() => live && toast.error("Could not load comments")).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [appeal]);

  async function send() {
    if (!appeal) return;
    if (!signedIn) return onNeedSignIn();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      await helpme.addComment(appeal.id, body);
      setText("");
      onCountChange(appeal.id, 1);
      setItems(await helpme.comments(appeal.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not post comment");
    } finally {
      setSending(false);
    }
  }

  async function remove(c: HelpComment) {
    if (!appeal) return;
    try {
      await helpme.deleteComment(c.id);
      setItems((x) => x.filter((i) => i.id !== c.id));
      onCountChange(appeal.id, -1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  }

  async function report(c: HelpComment) {
    if (!signedIn) return onNeedSignIn();
    try {
      await helpme.report("comment", c.id, "Inappropriate comment");
      toast.success("Reported. Thank you.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not report");
    }
  }

  return (
    <Sheet open={!!appeal} onClose={onClose} title="COMMENTS">
      <div className="min-h-[160px] space-y-3">
        {loading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-emerald-400" /></div>}
        {!loading && items.length === 0 && <p className="py-8 text-center text-xs text-gray-400">No comments yet. Say a kind word 🙏</p>}
        {items.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            {c.avatar_url ? <img src={c.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" /> : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold">{c.name.slice(0, 1).toUpperCase()}</div>}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-emerald-300">{c.name}</p>
              <p className="break-words text-sm text-white/90">{c.body}</p>
            </div>
            {c.mine ? (
              <button type="button" aria-label="Delete comment" onClick={() => remove(c)} className="self-start p-1 text-gray-400 active:scale-90"><Trash2 className="h-4 w-4" /></button>
            ) : (
              <button type="button" aria-label="Report comment" onClick={() => report(c)} className="self-start p-1 text-gray-500 active:scale-90"><Flag className="h-3.5 w-3.5" /></button>
            )}
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 -mx-5 mt-3 flex gap-2 border-t border-white/10 bg-slate-950 px-5 pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void send()}
          maxLength={300}
          placeholder={signedIn ? "Write a kind comment…" : "Sign in to comment"}
          onFocus={() => { if (!signedIn) onNeedSignIn(); }}
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
        />
        <button type="button" onClick={send} disabled={sending || !text.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white active:scale-95 disabled:opacity-50">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </Sheet>
  );
}

// ───────────── Report an appeal ─────────────
const REASONS = ["Looks fake or misleading", "Scam / asking for money unfairly", "Inappropriate video", "Other"];
export function ReportSheet({ appeal, onClose }: { appeal: Appeal | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  async function send(reason: string) {
    if (!appeal) return;
    setBusy(true);
    try {
      await helpme.report("appeal", appeal.id, reason);
      toast.success("Reported. Our team will review it.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not report");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet open={!!appeal} onClose={onClose} title="REPORT THIS APPEAL">
      <div className="space-y-2">
        {REASONS.map((r) => (
          <button key={r} type="button" disabled={busy} onClick={() => send(r)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white active:scale-[0.99] disabled:opacity-60">
            {r}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
