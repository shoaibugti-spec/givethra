import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2, Clock, XCircle, Heart, IndianRupee, ArrowRight } from "lucide-react";
import { helpme, formatMoney } from "@/lib/helpme";
import { toast } from "sonner";

export function HelpMeHistorySheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"appeals" | "helps">("appeals");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    helpme.my()
      .then((res) => setData(res))
      .catch((err) => toast.error(err.message || "Could not load history"))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center">
      <div className="flex h-[85vh] w-full flex-col rounded-t-3xl bg-slate-900 text-white sm:h-[80vh] sm:max-w-md sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-lg font-extrabold">My History</h2>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2 active:scale-95">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("appeals")}
            className={`flex-1 py-3 text-sm font-bold ${activeTab === "appeals" ? "border-b-2 border-emerald-500 text-emerald-400" : "text-gray-400"}`}
          >
            My Appeals (Requests)
          </button>
          <button
            onClick={() => setActiveTab("helps")}
            className={`flex-1 py-3 text-sm font-bold ${activeTab === "helps" ? "border-b-2 border-emerald-500 text-emerald-400" : "text-gray-400"}`}
          >
            My Contributions (Help)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : !data ? (
            <p className="text-center text-gray-400">No data found.</p>
          ) : activeTab === "appeals" ? (
            <div className="space-y-4">
              {data.appeals?.length === 0 && <p className="text-center text-sm text-gray-400">You haven't posted any appeals yet.</p>}
              {data.appeals?.map((appeal: any) => (
                <div key={appeal.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
                        ${appeal.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' :
                          appeal.status === 'pending_review' ? 'bg-amber-500/20 text-amber-400' :
                          appeal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'}`}>
                        {appeal.status === 'published' ? <CheckCircle2 className="h-3 w-3" /> : 
                         appeal.status === 'pending_review' ? <Clock className="h-3 w-3" /> : 
                         <XCircle className="h-3 w-3" />}
                        {appeal.status.replace('_', ' ')}
                      </span>
                      <p className="mt-2 line-clamp-2 text-sm">{appeal.description}</p>
                    </div>
                  </div>
                  
                  {appeal.status === "rejected" && appeal.rejection_reason && (
                    <div className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-300">
                      <b>Reason:</b> {appeal.rejection_reason}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                    <div>
                      <span className="text-gray-400">Goal:</span> <span className="font-bold">{formatMoney(appeal.goal_local, appeal.currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Raised:</span> <span className="font-bold text-emerald-400">{formatMoney(appeal.raised_local, appeal.currency)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Helps Given (As a Hero) */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Help I Provided (Given)</h3>
              {data.helps_given?.length === 0 && <p className="text-xs text-gray-400">You haven't helped anyone yet.</p>}
              {data.helps_given?.map((help: any) => (
                <div key={help.id} className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{formatMoney(help.amount_approved || help.amount_claimed, help.currency)}</span>
                    <span className={`text-xs font-bold ${help.status === 'approved' ? 'text-emerald-400' : help.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                      {help.status.toUpperCase()}
                    </span>
                  </div>
                  {help.rejection_reason && <p className="mt-1 text-xs text-red-300">Reason: {help.rejection_reason}</p>}
                  <p className="mt-1 text-[10px] text-gray-500">TX ID: {help.trx_id || "N/A"}</p>
                </div>
              ))}

              {/* Helps Received (As a Requester) */}
              <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-emerald-500">Help I Received (Received)</h3>
              {data.helps_received?.length === 0 && <p className="text-xs text-gray-400">You haven't received any help yet.</p>}
              {data.helps_received?.map((rec: any) => (
                <div key={rec.id} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{formatMoney(rec.amount_approved, rec.currency)}</span>
                    <span className="text-xs text-gray-400">From: {rec.hero_name}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">Approved on: {new Date(rec.reviewed_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
