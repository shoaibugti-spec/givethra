// src/frontend/src/components/KycGateSheet.tsx
// Bottom sheet shown before a user can submit a case: it asks for KYC, shows
// "under review", or shows the rejection reason and asks to redo the KYC.
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export type KycGateStatus = "none" | "pending" | "rejected";

interface KycGateSheetProps {
  open: boolean;
  status: KycGateStatus;
  rejectionReason?: string | null;
  onClose: () => void;
  onStart: () => void;
}

export default function KycGateSheet({ open, status, rejectionReason, onClose, onStart }: KycGateSheetProps) {
  const rejected = status === "rejected";
  const pending = status === "pending";
  const Icon = rejected ? AlertTriangle : pending ? Clock : ShieldCheck;
  const tone = rejected
    ? "bg-red-100 text-red-600"
    : pending
      ? "bg-amber-100 text-amber-600"
      : "bg-primary/10 text-primary";

  const title = rejected
    ? "Your KYC was rejected"
    : pending
      ? "Your KYC is under review"
      : "Complete your KYC first";
  const body = rejected
    ? "Your KYC could not be approved, so you cannot submit a case yet. Please verify again."
    : pending
      ? "Our team is reviewing your documents. You can submit a case as soon as it is approved."
      : "Verify your identity once with your CNIC, a selfie and a short video. After approval you can submit your case.";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="kyc-gate-title"
            className="relative w-full max-w-md rounded-t-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h2 id="kyc-gate-title" className="mt-4 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            {rejected && rejectionReason && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Reason</p>
                <p className="mt-1 leading-relaxed">{rejectionReason}</p>
              </div>
            )}
            <div className="mt-5 grid gap-2">
              {pending ? (
                <Button onClick={onClose} className="h-12 w-full rounded-xl font-bold">OK</Button>
              ) : (
                <>
                  <Button onClick={onStart} className="h-12 w-full rounded-xl font-bold">
                    {rejected ? "Verify again" : "Start KYC"}
                  </Button>
                  <button type="button" onClick={onClose} className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">
                    Maybe later
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
