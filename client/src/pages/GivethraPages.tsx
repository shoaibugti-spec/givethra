import { GivethraShell } from "@/components/GivethraShell";
import { fileToUploadInput } from "@/lib/upload";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { AlertCircle, ArrowRight, Bell, CheckCircle2, ChevronLeft, FileText, HeartHandshake, Image as ImageIcon, Loader2, LockKeyhole, MessageCircle, Send, ShieldCheck, UploadCloud, UserRound, Video } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";

const categories = ["Medical", "Education", "Emergency", "Livelihood", "Housing", "Other"] as const;
type Category = (typeof categories)[number];
type Status = "pending" | "approved" | "rejected";

function StatusPill({ status }: { status: Status }) {
  const styles = { pending: "bg-amber-100 text-amber-800", approved: "bg-emerald-100 text-emerald-800", rejected: "bg-rose-100 text-rose-800" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>;
}

function PageIntro({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">{eyebrow}</p><h1 className="font-display text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{copy}</p></div>{action}</div>;
}

function AuthRequired({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f8f8f5] p-6"><div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-9 text-center shadow-xl shadow-stone-200/50"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-950 text-amber-100"><ShieldCheck className="h-6 w-6" /></div><h1 className="mt-5 font-display text-3xl font-semibold text-emerald-950">Checking your secure session</h1><p className="mt-3 text-sm leading-6 text-slate-600">Givethra is confirming access to your private workspace. Your identity records and case evidence remain protected while this completes.</p><Loader2 className="mx-auto mt-7 h-6 w-6 animate-spin text-emerald-800" /></div></div>;
  if (!isAuthenticated) return <div className="grid min-h-screen place-items-center bg-[#f8f8f5] p-6"><div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-9 text-center shadow-xl shadow-stone-200/50"><LockKeyhole className="mx-auto h-9 w-9 text-emerald-800" /><h1 className="mt-5 font-display text-3xl font-semibold text-emerald-950">Sign in to continue</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your profile, KYC information, cases and messages are private to your verified account.</p><div className="mt-7"><GoogleSignIn /></div><Link href="/" className="mt-6 inline-block text-sm font-semibold text-emerald-800 hover:underline">Back to Givethra</Link></div></div>;
  return <GivethraShell>{children}</GivethraShell>;
}

function FilePicker({ label, accept, file, onChange, helper }: { label: string; accept: string; file: File | null; onChange: (file: File | null) => void; helper: string }) {
  return <label className="block rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 transition hover:border-emerald-700 hover:bg-emerald-50/40"><span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><UploadCloud className="h-4 w-4 text-emerald-700" />{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{helper}</span><input className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" type="file" accept={accept} onChange={event => onChange(event.target.files?.[0] ?? null)} />{file ? <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />{file.name}</span> : null}</label>;
}

function WhatsOnYourMindBox() {
  const { user } = useAuth();
  const upload = trpc.givethra.publicPosts.uploadImage.useMutation();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(undefined);
      return;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const submitMutation = trpc.givethra.publicPosts.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setContent("");
      setImageFile(null);
      setNotice("Your feedback has been posted successfully!");
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: err => {
      setNotice(err.message);
    },
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setNotice("");
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const uploaded = await upload.mutateAsync(await fileToUploadInput(imageFile, "public"));
        imageUrl = uploaded.url;
      }
      await submitMutation.mutateAsync({
        authorName: user?.name || "Guest Visitor",
        authorEmail: user?.email || undefined,
        content: content.trim(),
        imageUrl,
      });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to post");
    }
  };

  const isSending = submitMutation.isPending || upload.isPending;

  return (
    <section className="container py-12" aria-labelledby="public-feedback-title">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-950/10 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-900 text-base font-bold text-amber-100" aria-hidden="true">
            {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Community feedback</p>
            <h2 id="public-feedback-title" className="mt-1 font-display text-2xl font-semibold text-emerald-950">What's on your mind?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Share a question, suggestion, or problem with the Givethra team. You can post as a guest.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-3 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
          <textarea
            rows={3}
            maxLength={2000}
            value={content}
            onChange={e => setContent(e.target.value)}
            onInput={e => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 176)}px`;
            }}
            placeholder="Write your message here…"
            aria-label="What's on your mind?"
            className="min-h-24 max-h-44 w-full resize-none overflow-y-auto bg-transparent px-2 py-1 text-base leading-7 text-slate-800 placeholder:text-slate-400 outline-none"
            required
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-600 hover:text-emerald-800" title="Attach an image">
                <ImageIcon className="h-4 w-4" />
                <span>Attach image</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
              </label>
              {imageFile ? <span className="max-w-40 truncate text-xs font-medium text-emerald-800" title={imageFile.name}>{imageFile.name}</span> : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{content.length}/2000</span>
              <button type="submit" disabled={isSending || !content.trim()} className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50" title="Send post">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>{isSending ? "Sending…" : "Send feedback"}</span>
              </button>
            </div>
          </div>
          {imagePreviewUrl ? <img src={imagePreviewUrl} alt="Selected attachment preview" className="mt-3 h-24 w-24 rounded-xl border border-emerald-100 object-cover" /> : null}
        </form>
        {notice ? <p role="status" className={`mt-3 text-center text-sm ${submitted ? "font-semibold text-emerald-700" : "text-rose-700"}`}>{notice}</p> : null}
      </div>
    </section>
  );
}

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const approved = trpc.givethra.public.approvedCases.useQuery();
  return <div className="min-h-screen overflow-hidden bg-[#f8f8f5] text-slate-900"><header className="container flex h-20 items-center justify-between"><Link href="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-emerald-950"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-900 text-sm font-bold text-amber-100">G</span>Givethra</Link><div className="flex items-center gap-4"><Link href="/cases" className="hidden text-sm font-medium text-slate-600 hover:text-emerald-900 sm:block">Browse approved cases</Link>{isAuthenticated ? <Link href="/dashboard" className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">Open workspace</Link> : <Link href="#sign-in" className="rounded-full border border-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-900 hover:text-white">Sign in</Link>}</div></header><main><section className="container grid items-center gap-12 pb-12 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:pb-16 lg:pt-20"><div><p className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-emerald-800"><ShieldCheck className="h-3.5 w-3.5" />Verified help. Real impact.</p><h1 className="max-w-3xl font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-emerald-950 sm:text-6xl">A more careful way to ask for — and offer — help.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Givethra combines private identity verification with a respectful, transparent case-review process. Each approved story is presented with clarity, not spectacle.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/cases" className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 active:scale-[.97]">Explore approved cases <ArrowRight className="h-4 w-4" /></Link><Link href="#how-it-works" className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-800 hover:text-emerald-900">How verification works</Link></div></div><div className="relative"><div className="absolute -inset-7 rounded-full bg-amber-100/80 blur-3xl" /><div className="relative rounded-[2.4rem] bg-emerald-950 p-7 text-white shadow-2xl shadow-emerald-950/20 sm:p-10"><p className="text-sm font-medium text-amber-100">The Givethra standard</p><div className="mt-9 grid gap-7"><div className="border-l border-emerald-700 pl-5"><p className="font-display text-2xl font-semibold">Private by design</p><p className="mt-2 text-sm leading-6 text-emerald-100/75">Sensitive identity files are visible only to the account holder and authorised owner review.</p></div><div className="border-l border-emerald-700 pl-5"><p className="font-display text-2xl font-semibold">Reviewed with care</p><p className="mt-2 text-sm leading-6 text-emerald-100/75">KYC and case review status remain clear: pending, approved or rejected.</p></div><div className="border-l border-emerald-700 pl-5"><p className="font-display text-2xl font-semibold">Support stays close</p><p className="mt-2 text-sm leading-6 text-emerald-100/75">Private in-app conversation creates a direct line to the support team.</p></div></div></div></div></section><section id="how-it-works" className="border-y border-stone-200 bg-white"><div className="container grid gap-8 py-16 md:grid-cols-3"><div><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-sm font-bold text-emerald-950">01</span><h2 className="mt-5 font-display text-2xl font-semibold text-emerald-950">Sign in securely</h2><p className="mt-3 text-sm leading-6 text-slate-600">Continue with your Google account to create your private Givethra workspace.</p></div><div><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-sm font-bold text-emerald-950">02</span><h2 className="mt-5 font-display text-2xl font-semibold text-emerald-950">Verify your identity</h2><p className="mt-3 text-sm leading-6 text-slate-600">Submit your identity evidence in a protected verification flow and follow the review outcome.</p></div><div><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-sm font-bold text-emerald-950">03</span><h2 className="mt-5 font-display text-2xl font-semibold text-emerald-950">Submit a meaningful case</h2><p className="mt-3 text-sm leading-6 text-slate-600">Share the context, supporting files and optional liveness media needed for a careful review.</p></div></div></section><section className="container py-20"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Stories with approval</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-emerald-950">Approved cases</h2></div><Link href="/cases" className="text-sm font-semibold text-emerald-800 hover:underline">View all cases</Link></div><div className="mt-9 grid gap-5 md:grid-cols-3">{approved.isLoading ? <p className="text-sm text-slate-500">Loading approved cases…</p> : approved.data?.slice(0, 3).map(item => <Link key={item.id} href={`/cases/${item.id}`} className="group rounded-3xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/5"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{item.category}</span><h3 className="mt-5 font-display text-2xl font-semibold text-emerald-950 group-hover:text-emerald-700">{item.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">Read case <ArrowRight className="h-4 w-4" /></span></Link>) ?? <p className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-sm text-slate-600 md:col-span-3">Approved cases will appear here once they complete the platform review.</p>}</div></section>

<WhatsOnYourMindBox />

<section id="sign-in" className="bg-emerald-950 py-20"><div className="container grid items-center gap-8 lg:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-100">A private workspace awaits</p><h2 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight text-white">Manage every part of your request with dignity and clarity.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-emerald-100/75">Google sign-in starts a secure, account-specific session. It does not make your KYC files or case evidence public.</p></div><div className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/20"><h3 className="font-display text-2xl font-semibold text-emerald-950">Continue to Givethra</h3><p className="mt-2 text-sm leading-6 text-slate-600">Use the Google account you want associated with your profile.</p><div className="mt-6"><GoogleSignIn /></div></div></div></section></main><footer className="container flex flex-col gap-3 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Givethra — Verified Help. Real Impact.</span><span>Identity data is handled in private account workflows.</span></footer></div>;
}

export function CasesPage() {
  const [category, setCategory] = useState<"All" | Category>("All");
  const input = useMemo(() => category === "All" ? undefined : { category }, [category]);
  const list = trpc.givethra.public.approvedCases.useQuery(input);
  return <div className="min-h-screen bg-[#f8f8f5]"><header className="container flex h-16 items-center justify-between"><Link href="/" className="font-display text-xl font-semibold text-emerald-950">Givethra</Link><Link href="/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline">My workspace</Link></header><main className="container pb-16 pt-8"><PageIntro eyebrow="Public case library" title="Approved cases, shared with care." copy="Browse cases that have completed Givethra’s review process. Private identity and verification evidence remain protected." /><div className="flex flex-wrap gap-2">{(["All", ...categories] as const).map(option => <button key={option} onClick={() => setCategory(option)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === option ? "bg-emerald-900 text-white" : "border border-stone-300 bg-white text-slate-600 hover:border-emerald-800"}`}>{option}</button>)}</div><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.isLoading ? <p className="text-sm text-slate-500">Loading approved cases…</p> : list.data?.map(item => <Link key={item.id} href={`/cases/${item.id}`} className="rounded-3xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><span className="text-xs font-bold uppercase tracking-[.15em] text-emerald-700">{item.category}</span><h2 className="mt-4 font-display text-2xl font-semibold text-emerald-950">{item.title}</h2><p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{item.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">View details <ArrowRight className="h-4 w-4" /></span></Link>)}</div>{list.data?.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-slate-600">No approved cases match this category yet.</div> : null}</main></div>;
}

export function CaseDetailPage() {
  const [, params] = useRoute("/cases/:id");
  const id = Number(params?.id ?? 0);
  const caseQuery = trpc.givethra.public.caseById.useQuery({ id });
  if (caseQuery.isLoading) return <div className="grid min-h-screen place-items-center bg-[#f8f8f5]"><Loader2 className="h-7 w-7 animate-spin text-emerald-800" /></div>;
  if (!caseQuery.data) return <div className="grid min-h-screen place-items-center bg-[#f8f8f5] p-6"><div className="rounded-3xl bg-white p-9 text-center shadow-lg"><AlertCircle className="mx-auto h-8 w-8 text-amber-600" /><h1 className="mt-4 font-display text-3xl font-semibold text-emerald-950">Case not found</h1><Link href="/cases" className="mt-5 inline-block text-sm font-semibold text-emerald-800 hover:underline">Return to cases</Link></div></div>;
  const item = caseQuery.data;
  return <div className="min-h-screen bg-[#f8f8f5]"><header className="container flex h-16 items-center"><Link href="/cases" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline"><ChevronLeft className="h-4 w-4" /> Approved cases</Link></header><main className="container max-w-4xl pb-16 pt-8"><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] text-emerald-800">{item.category}</span><h1 className="mt-7 font-display text-5xl font-semibold tracking-[-.04em] text-emerald-950">{item.title}</h1><p className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">{item.description}</p><div className="mt-10 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-sm leading-6 text-emerald-950"><HeartHandshake className="mb-3 h-6 w-6 text-emerald-800" />This case has completed Givethra’s review workflow. Personal identity records and private evidence are intentionally not shown here.</div></main></div>;
}

export function DashboardPage() {
  const cases = trpc.givethra.cases.mine.useQuery();
  const kyc = trpc.givethra.kyc.mine.useQuery();
  const notifications = trpc.givethra.notifications.mine.useQuery();
  return <AuthRequired><PageIntro eyebrow="Workspace" title="Your Givethra overview" copy="Keep your identity verification, case submissions and support conversations organised in one private place." action={<Link href="/submit-case" className="rounded-full bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">Submit a case</Link>} /><div className="grid gap-4 md:grid-cols-3"><div className="rounded-3xl bg-emerald-950 p-6 text-white"><ShieldCheck className="h-5 w-5 text-amber-100" /><p className="mt-8 text-sm text-emerald-100/75">Identity verification</p><div className="mt-2">{kyc.data ? <StatusPill status={kyc.data.status} /> : <span className="text-xl font-semibold">Not submitted</span>}</div><Link href="/kyc" className="mt-6 inline-block text-sm font-semibold text-amber-100 hover:underline">Open KYC workspace</Link></div><div className="rounded-3xl border border-stone-200 bg-white p-6"><FileText className="h-5 w-5 text-emerald-800" /><p className="mt-8 text-sm text-slate-500">Your submitted cases</p><p className="mt-1 font-display text-4xl font-semibold text-emerald-950">{cases.data?.length ?? "—"}</p><Link href="/submit-case" className="mt-6 inline-block text-sm font-semibold text-emerald-800 hover:underline">Review or submit cases</Link></div><div className="rounded-3xl border border-stone-200 bg-white p-6"><Bell className="h-5 w-5 text-emerald-800" /><p className="mt-8 text-sm text-slate-500">Unread notifications</p><p className="mt-1 font-display text-4xl font-semibold text-emerald-950">{notifications.data?.filter(item => !item.isRead).length ?? "—"}</p><Link href="/notifications" className="mt-6 inline-block text-sm font-semibold text-emerald-800 hover:underline">View updates</Link></div></div><section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-emerald-950">Recent case activity</h2><Link href="/submit-case" className="text-sm font-semibold text-emerald-800 hover:underline">Manage cases</Link></div><div className="mt-5 grid gap-3">{cases.data?.length ? cases.data.slice(0, 4).map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-stone-50 p-4"><div><p className="font-medium text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.category}</p></div><StatusPill status={item.status} /></div>) : <p className="rounded-2xl bg-stone-50 p-5 text-sm text-slate-600">You have not submitted a case yet. When you are ready, submit a clear description and supporting documents for review.</p>}</div></section></AuthRequired>;
}

export function ProfilePage() {
  const profile = trpc.givethra.profile.me.useQuery();
  const save = trpc.givethra.profile.save.useMutation({ onSuccess: () => void profile.refetch() });
  const upload = trpc.givethra.files.upload.useMutation();
  const [values, setValues] = useState({ displayName: "", phone: "", city: "", country: "", bio: "", avatarKey: "", avatarUrl: "", coverKey: "", coverUrl: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (profile.data) setValues({ displayName: profile.data.displayName ?? "", phone: profile.data.phone ?? "", city: profile.data.city ?? "", country: profile.data.country ?? "", bio: profile.data.bio ?? "", avatarKey: profile.data.avatarKey ?? "", avatarUrl: profile.data.avatarUrl ?? "", coverKey: profile.data.coverKey ?? "", coverUrl: profile.data.coverUrl ?? "" }); }, [profile.data]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setNotice(""); try { let next = { ...values }; if (avatar) { const item = await upload.mutateAsync(await fileToUploadInput(avatar, "avatar")); next = { ...next, avatarKey: item.key, avatarUrl: item.url }; } if (cover) { const item = await upload.mutateAsync(await fileToUploadInput(cover, "cover")); next = { ...next, coverKey: item.key, coverUrl: item.url }; } await save.mutateAsync(next); setAvatar(null); setCover(null); setNotice("Your profile has been saved."); } catch (error) { setNotice(error instanceof Error ? error.message : "Your profile could not be saved."); } };
  return <AuthRequired><PageIntro eyebrow="Personal profile" title="Make your space recognisable." copy="Your profile picture and cover image are the only visual profile elements that can be publicly displayed. Your contact details remain in your account workspace." /><form onSubmit={submit} className="overflow-hidden rounded-3xl border border-stone-200 bg-white"><div className="relative h-44 bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#1e4a41]">{values.coverUrl ? <img src={values.coverUrl} className="h-full w-full object-cover" alt="Profile cover" /> : null}<div className="absolute inset-x-6 -bottom-10 flex items-end justify-between"><div className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-amber-100 font-display text-3xl font-semibold text-emerald-950">{values.avatarUrl ? <img src={values.avatarUrl} className="h-full w-full object-cover" alt="Profile" /> : <UserRound className="h-9 w-9" />}</div></div></div><div className="p-6 pt-16 sm:p-8 sm:pt-16"><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-700">Display name<input value={values.displayName} onChange={e => setValues({ ...values, displayName: e.target.value })} className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" placeholder="Your name" /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Phone<input value={values.phone} onChange={e => setValues({ ...values, phone: e.target.value })} className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" placeholder="Optional" /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">City<input value={values.city} onChange={e => setValues({ ...values, city: e.target.value })} className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" placeholder="Your city" /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Country<input value={values.country} onChange={e => setValues({ ...values, country: e.target.value })} className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" placeholder="Your country" /></label></div><label className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">About you<textarea value={values.bio} onChange={e => setValues({ ...values, bio: e.target.value })} className="min-h-28 rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" placeholder="A short introduction, if you choose to add one." /></label><div className="mt-5 grid gap-4 md:grid-cols-2"><FilePicker label="Profile picture" helper="JPG, PNG or WebP, up to 30 MB." accept="image/*" file={avatar} onChange={setAvatar} /><FilePicker label="Cover picture" helper="A wide JPG, PNG or WebP image works best." accept="image/*" file={cover} onChange={setCover} /></div>{notice ? <p className={`mt-5 text-sm ${notice.includes("saved") ? "text-emerald-700" : "text-rose-700"}`}>{notice}</p> : null}<button disabled={save.isPending || upload.isPending} className="mt-6 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">{save.isPending || upload.isPending ? "Saving…" : "Save profile"}</button></div></form></AuthRequired>;
}

export function KycPage() {
  const statusQuery = trpc.givethra.kyc.mine.useQuery();
  const submit = trpc.givethra.kyc.submit.useMutation({ onSuccess: () => void statusQuery.refetch() });
  const [fullName, setFullName] = useState(""); const [nationalId, setNationalId] = useState(""); const [front, setFront] = useState<File | null>(null); const [back, setBack] = useState<File | null>(null); const [selfie, setSelfie] = useState<File | null>(null); const [video, setVideo] = useState<File | null>(null); const [notice, setNotice] = useState("");
  const onSubmit = async (event: FormEvent) => { event.preventDefault(); if (!front || !back || !selfie || !video) { setNotice("Please attach all four required verification files."); return; } setNotice(""); try { await submit.mutateAsync({ fullName, nationalId, front: await fileToUploadInput(front, "kyc"), back: await fileToUploadInput(back, "kyc"), selfie: await fileToUploadInput(selfie, "kyc"), video: await fileToUploadInput(video, "kyc") }); setNotice("Your KYC submission is now pending review."); } catch (error) { setNotice(error instanceof Error ? error.message : "KYC submission could not be sent."); } };
  const existing = statusQuery.data;
  return <AuthRequired><PageIntro eyebrow="Identity verification" title="A protected, clear verification process." copy="Your CNIC, selfie and video are stored as private evidence. Only you and the owner reviewing submissions can access them." />{existing ? <div className="mb-7 rounded-3xl border border-stone-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-display text-2xl font-semibold text-emerald-950">Latest verification</p><p className="mt-2 text-sm text-slate-600">Submitted {new Date(existing.submittedAt).toLocaleDateString()}</p></div><StatusPill status={existing.status} /></div>{existing.adminNote ? <p className="mt-5 rounded-2xl bg-stone-50 p-4 text-sm text-slate-700"><strong>Review note:</strong> {existing.adminNote}</p> : null}</div> : null}<form onSubmit={onSubmit} className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Before you upload:</strong> Remove face coverings and ensure your face is visible in good light. Use authentic documents only. KYC has exactly three review outcomes: pending, approved or rejected.</div><div className="mt-6 grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-700">Full legal name<input value={fullName} onChange={e => setFullName(e.target.value)} required className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">CNIC / national ID number<input value={nationalId} onChange={e => setNationalId(e.target.value)} required className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" /></label></div><div className="mt-6 grid gap-4 md:grid-cols-2"><FilePicker label="CNIC front" helper="A legible image of the front of your CNIC." accept="image/*" file={front} onChange={setFront} /><FilePicker label="CNIC back" helper="A legible image of the back of your CNIC." accept="image/*" file={back} onChange={setBack} /><FilePicker label="Selfie photo" helper="A clear, unobstructed photo of your face." accept="image/*" file={selfie} onChange={setSelfie} /><FilePicker label="Selfie video" helper="A short video for liveness verification, up to 30 MB." accept="video/*" file={video} onChange={setVideo} /></div>{notice ? <p className={`mt-5 text-sm ${notice.includes("pending") ? "text-emerald-700" : "text-rose-700"}`}>{notice}</p> : null}<button disabled={submit.isPending} className="mt-7 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">{submit.isPending ? "Securing files and submitting…" : "Submit KYC verification"}</button></form></AuthRequired>;
}

export function SubmitCasePage() {
  const mine = trpc.givethra.cases.mine.useQuery();
  const submit = trpc.givethra.cases.submit.useMutation({ onSuccess: () => void mine.refetch() });
  const [title, setTitle] = useState(""); const [category, setCategory] = useState<Category>("Medical"); const [description, setDescription] = useState(""); const [doc1, setDoc1] = useState<File | null>(null); const [doc2, setDoc2] = useState<File | null>(null); const [doc3, setDoc3] = useState<File | null>(null); const [selfie, setSelfie] = useState<File | null>(null); const [video, setVideo] = useState<File | null>(null); const [notice, setNotice] = useState("");
  const onSubmit = async (event: FormEvent) => { event.preventDefault(); const docs = [doc1, doc2, doc3].filter(Boolean) as File[]; if (!docs.length) { setNotice("Please attach at least one supporting document (e.g. bill or agreement)."); return; } setNotice(""); try { await submit.mutateAsync({ title, category, description, selfie: selfie ? await fileToUploadInput(selfie, "case") : undefined, video: video ? await fileToUploadInput(video, "case") : undefined, documents: await Promise.all(docs.map(file => fileToUploadInput(file, "case"))) }); setNotice("Your case is pending the owner’s review with all attached documents."); setTitle(""); setDescription(""); setDoc1(null); setDoc2(null); setDoc3(null); setSelfie(null); setVideo(null); } catch (error) { setNotice(error instanceof Error ? error.message : "Case submission could not be sent."); } };
  return <AuthRequired><PageIntro eyebrow="Case submission" title="Share the essential context with care." copy="A clear description and supporting documents help the owner review your case. Your private supporting files are never included in the public case library." /><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_330px]"><form onSubmit={onSubmit} className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8"><div className="grid gap-5 md:grid-cols-[1fr_190px]"><label className="grid gap-2 text-sm font-semibold text-slate-700">Case title<input value={title} onChange={e => setTitle(e.target.value)} required minLength={5} className="rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-700" placeholder="A concise, respectful title" /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Category<select value={category} onChange={e => setCategory(e.target.value as Category)} className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700">{categories.map(item => <option key={item}>{item}</option>)}</select></label></div><label className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">Case description<textarea value={description} onChange={e => setDescription(e.target.value)} required minLength={40} className="min-h-48 rounded-xl border border-stone-300 px-3 py-2.5 font-normal leading-6 outline-none focus:border-emerald-700" placeholder="Describe the situation, what support is needed and why. Avoid including sensitive credentials or private contact details." /></label><div className="mt-6 grid gap-4 md:grid-cols-3"><FilePicker label="Document 1 (Bill / Agreement)" helper="Primary bill, invoice or agreement." accept="image/*,.pdf,.doc,.docx" file={doc1} onChange={setDoc1} /><FilePicker label="Document 2 (ID / Proof)" helper="Landlord CNIC or secondary proof." accept="image/*,.pdf,.doc,.docx" file={doc2} onChange={setDoc2} /><FilePicker label="Document 3 (Additional)" helper="Any extra supporting document." accept="image/*,.pdf,.doc,.docx" file={doc3} onChange={setDoc3} /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><FilePicker label="Optional selfie" helper="A current selfie photo." accept="image/*" file={selfie} onChange={setSelfie} /><FilePicker label="Optional video" helper="Short liveness video (max 30MB)." accept="video/*" file={video} onChange={setVideo} /></div>{notice ? <p className={`mt-5 text-sm ${notice.includes("pending") ? "text-emerald-700" : "text-rose-700"}`}>{notice}</p> : null}<button disabled={submit.isPending} className="mt-7 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">{submit.isPending ? "Submitting securely…" : "Submit for review"}</button></form><aside className="rounded-3xl border border-stone-200 bg-white p-6"><h2 className="font-display text-2xl font-semibold text-emerald-950">My submissions</h2><div className="mt-5 grid gap-3">{mine.data?.length ? mine.data.map(item => <div key={item.id} className="rounded-2xl bg-stone-50 p-4"><div className="flex items-start justify-between gap-3"><p className="font-medium text-slate-800">{item.title}</p><StatusPill status={item.status} /></div><p className="mt-2 text-xs text-slate-500">{item.category}</p>{item.adminNote ? <p className="mt-3 text-xs leading-5 text-slate-600">{item.adminNote}</p> : null}</div>) : <p className="text-sm leading-6 text-slate-600">Your submissions will appear here with their review status.</p>}</div></aside></div></AuthRequired>;
}

export function NotificationsPage() {
  const list = trpc.givethra.notifications.mine.useQuery(); const mark = trpc.givethra.notifications.markRead.useMutation({ onSuccess: () => void list.refetch() });
  return <AuthRequired><PageIntro eyebrow="Notifications" title="Every important update, in one place." copy="You will receive updates when your KYC or case changes status and when support replies to you." /><div className="grid gap-3">{list.data?.length ? list.data.map(item => <button key={item.id} onClick={() => !item.isRead && void mark.mutateAsync({ id: item.id })} className={`rounded-2xl border p-5 text-left transition ${item.isRead ? "border-stone-200 bg-white" : "border-emerald-200 bg-emerald-50"}`}><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-emerald-950">{item.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.content}</p></div>{!item.isRead ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" /> : null}</div><p className="mt-3 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></button>) : <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-slate-600">There are no notifications yet.</div>}</div></AuthRequired>;
}

export function SupportPage() {
  const list = trpc.givethra.support.mine.useQuery(); const send = trpc.givethra.support.send.useMutation({ onSuccess: () => void list.refetch() }); const [body, setBody] = useState("");
  const onSend = async (event: FormEvent) => { event.preventDefault(); if (!body.trim()) return; await send.mutateAsync({ body }); setBody(""); };
  return <AuthRequired><PageIntro eyebrow="Private support" title="Talk to the Givethra team." copy="Use this private conversation for help with your profile, verification or case workflow." /><div className="grid gap-6"><div className="rounded-3xl border border-stone-200 bg-white p-6"><div className="grid gap-4 max-h-[500px] overflow-auto pr-2">{list.data?.length ? list.data.map(item => <div key={item.id} className={`flex flex-col rounded-2xl p-4 text-sm leading-6 ${item.senderRole === "user" ? "ml-auto max-w-xl bg-emerald-900 text-white" : "mr-auto max-w-xl bg-stone-100 text-slate-800"}`}><span>{item.body}</span><span className={`mt-2 text-[10px] ${item.senderRole === "user" ? "text-emerald-200" : "text-slate-400"}`}>{new Date(item.createdAt).toLocaleTimeString()}</span></div>) : <p className="text-sm text-slate-600">No support messages yet. Start a conversation below.</p>}</div><form onSubmit={onSend} className="mt-4 flex gap-3"><textarea value={body} onChange={e => setBody(e.target.value)} required rows={2} className="min-h-12 flex-1 rounded-2xl border border-stone-300 p-3 text-sm outline-none focus:border-emerald-700" placeholder="Type your message to support..." /><button type="submit" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-900 text-white transition hover:bg-emerald-800"><Send className="h-5 w-5" /></button></form></div></div></AuthRequired>;
}

export function AdminPage() {
  const { user } = useAuth();
  const ownerAccess = trpc.givethra.account.ownerAccess.useQuery(undefined, { enabled: Boolean(user) });
  const enabled = ownerAccess.data?.isOwner === true;
  const overview = trpc.givethra.admin.overview.useQuery(undefined, { enabled });
  const kyc = trpc.givethra.admin.kyc.useQuery(undefined, { enabled });
  const cases = trpc.givethra.admin.cases.useQuery(undefined, { enabled });
  const users = trpc.givethra.admin.users.useQuery(undefined, { enabled });
  const support = trpc.givethra.admin.support.useQuery(undefined, { enabled, refetchInterval: 5000 });
  const publicPosts = trpc.givethra.admin.publicPosts.useQuery(undefined, { enabled, refetchInterval: 5000 });

  const reviewKyc = trpc.givethra.admin.reviewKyc.useMutation({ onSuccess: () => void kyc.refetch() });
  const reviewCase = trpc.givethra.admin.reviewCase.useMutation({ onSuccess: () => void cases.refetch() });
  const reply = trpc.givethra.admin.replySupport.useMutation({ onSuccess: () => void support.refetch() });
  const updatePost = trpc.givethra.admin.updatePublicPost.useMutation({ onSuccess: () => void publicPosts.refetch() });

  const [replyBody, setReplyBody] = useState<Record<number, string>>({});
  const [postReplyBody, setPostReplyBody] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      void overview.refetch();
      void kyc.refetch();
      void cases.refetch();
      void support.refetch();
      void publicPosts.refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled)
    return (
      <AuthRequired>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
          <LockKeyhole className="h-8 w-8 text-rose-700" />
          <h1 className="mt-4 font-display text-3xl font-semibold text-rose-950">Owner access only</h1>
          <p className="mt-2 text-sm text-rose-800">
            This review workspace is restricted to the configured platform owner account. Your private account data remains unaffected.
          </p>
        </div>
      </AuthRequired>
    );

  const refresh = () => {
    void overview.refetch();
    void kyc.refetch();
    void cases.refetch();
    void support.refetch();
    void publicPosts.refetch();
  };

  const unreadSupportCount = support.data?.filter(item => item.senderRole === "user").length ?? 0;
  const unreadPostsCount = publicPosts.data?.filter(item => item.status === "pending").length ?? 0;
  const overviewData = overview.data as ({ users: number; pendingKyc: number; pendingCases: number; supportMessages: number; publicPosts: number } | undefined);
  const stats: Array<[string, string | number | undefined]> = [
    ["Users", overviewData?.users],
    ["Pending KYC", overviewData?.pendingKyc],
    ["Pending cases", overviewData?.pendingCases],
    ["Public posts", unreadPostsCount > 0 ? `${overviewData?.publicPosts ?? 0} (${unreadPostsCount} unread)` : overviewData?.publicPosts],
    ["Support msgs", unreadSupportCount > 0 ? `${overviewData?.supportMessages ?? 0} (${unreadSupportCount} unread)` : overviewData?.supportMessages],
  ];

  return (
    <AuthRequired>
      <PageIntro
        eyebrow="Owner review"
        title="Admin command centre"
        copy="Review identity submissions, case submissions, public feedback, accounts and support conversations from a single owner-only workspace."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="rounded-3xl bg-emerald-950 p-5 text-white">
            <p className="text-sm text-emerald-100/75">{label}</p>
            <p className="mt-5 font-display text-4xl font-semibold">{value ?? "—"}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6">
        <h2 className="font-display text-2xl font-semibold text-emerald-950">KYC review queue</h2>
        <div className="mt-5 grid gap-3">
          {kyc.data?.length ? (
            kyc.data.map((item: any) => (
              <div key={item.id} className="rounded-2xl bg-stone-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{item.fullName}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.nationalId} · {new Date(item.submittedAt).toLocaleString()}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-emerald-800">
                      <a href={item.frontUrl} target="_blank" rel="noreferrer" className="hover:underline">CNIC front</a>
                      <a href={item.backUrl} target="_blank" rel="noreferrer" className="hover:underline">CNIC back</a>
                      <a href={item.selfieUrl} target="_blank" rel="noreferrer" className="hover:underline">Selfie</a>
                      <a href={item.videoUrl} target="_blank" rel="noreferrer" className="hover:underline">Video</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={item.status} />
                    {item.status === "pending" ? (
                      <>
                        <button onClick={() => void reviewKyc.mutateAsync({ id: item.id, status: "approved" }).then(refresh)} className="rounded-full bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white">Approve</button>
                        <button onClick={() => void reviewKyc.mutateAsync({ id: item.id, status: "rejected" }).then(refresh)} className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700">Reject</button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No KYC submissions are available for review.</p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6">
        <h2 className="font-display text-2xl font-semibold text-emerald-950">Case review queue</h2>
        <div className="mt-5 grid gap-3">
          {cases.data?.length ? (
            cases.data.map((item: any) => (
              <div key={item.id} className="rounded-2xl bg-stone-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.category} · Submitted {new Date(item.submittedAt).toLocaleString()}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{item.description}</p>
                    {item.files?.length ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="text-xs font-semibold text-slate-700">Uploaded Supporting Documents ({item.files.length}):</div>
                        <div className="col-span-full flex flex-wrap gap-2">
                          {item.files.map((file: any) => (
                            <a key={file.id} href={file.storageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100">
                              <FileText className="h-3.5 w-3.5" />{file.fileName || "Document"}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {item.selfieUrl || item.videoUrl ? (
                      <div className="mt-3 flex gap-2 text-xs font-semibold text-emerald-800">
                        {item.selfieUrl ? <a href={item.selfieUrl} target="_blank" rel="noreferrer" className="hover:underline">Selfie</a> : null}
                        {item.videoUrl ? <a href={item.videoUrl} target="_blank" rel="noreferrer" className="hover:underline">Video</a> : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={item.status} />
                    {item.status === "pending" ? (
                      <>
                        <button onClick={() => void reviewCase.mutateAsync({ id: item.id, status: "approved" }).then(refresh)} className="rounded-full bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white">Approve</button>
                        <button onClick={() => void reviewCase.mutateAsync({ id: item.id, status: "rejected" }).then(refresh)} className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700">Reject</button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No case submissions are available for review.</p>
          )}
        </div>
      </section><section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-emerald-950">
            Public Posts & Visitor Feedback {unreadPostsCount > 0 ? <span className="ml-2 inline-flex items-center rounded-full bg-rose-500 px-2.5 py-0.5 text-xs text-white">{unreadPostsCount} unread</span> : null}
          </h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {publicPosts.data?.length ? (
            publicPosts.data.map((post: any) => (
              <div key={post.id} className={`rounded-2xl border p-5 ${post.status === "pending" ? "border-amber-300 bg-amber-50/40" : "border-stone-200 bg-stone-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{post.authorName} {post.authorEmail ? <span className="text-xs font-normal text-slate-500">({post.authorEmail})</span> : null}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${post.status === "pending" ? "bg-amber-100 text-amber-800" : post.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>
                    {post.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700 whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white max-w-xs">
                    <a href={post.imageUrl} target="_blank" rel="noreferrer">
                      <img src={post.imageUrl} alt="Post attachment" className="h-32 w-full object-cover transition hover:opacity-95" />
                    </a>
                  </div>
                ) : null}
                {post.adminReply ? (
                  <div className="mt-3 rounded-xl bg-emerald-950 p-3 text-xs leading-5 text-white">
                    <span className="font-bold text-amber-200">Admin reply:</span> {post.adminReply}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200">
                  <button
                    onClick={() => void updatePost.mutateAsync({ id: post.id, status: "read" }).then(refresh)}
                    className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-800 hover:bg-stone-300"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => void updatePost.mutateAsync({ id: post.id, status: "resolved" }).then(refresh)}
                    className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    Mark Resolved
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={postReplyBody[post.id] ?? ""}
                    onChange={e => setPostReplyBody({ ...postReplyBody, [post.id]: e.target.value })}
                    className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
                    placeholder="Add optional admin note..."
                  />
                  <button
                    onClick={() => {
                      const note = postReplyBody[post.id]?.trim();
                      if (note) {
                        void updatePost.mutateAsync({ id: post.id, status: "resolved", adminReply: note }).then(() => {
                          setPostReplyBody({ ...postReplyBody, [post.id]: "" });
                          refresh();
                        });
                      }
                    }}
                    className="rounded-full bg-emerald-900 px-3 text-xs font-semibold text-white"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 md:col-span-2">No public notes or feedback have been submitted yet.</p>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-2xl font-semibold text-emerald-950">Users</h2>
          <div className="mt-5 max-h-96 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.data?.map(u => (
                  <tr key={u.id}>
                    <td className="py-3 font-medium text-slate-800">{u.name || u.email || `User #${u.id}`}</td>
                    <td className="py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === "admin" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"}`}>{u.role}</span></td>
                    <td className="py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-2xl font-semibold text-emerald-950">Support Conversations ({support.data?.length ?? 0})</h2>
          <div className="mt-5 max-h-96 overflow-auto grid gap-3 pr-2">
            {support.data?.length ? (
              support.data.map(msg => (
                <div key={msg.id} className={`rounded-2xl p-4 text-sm ${msg.senderRole === "user" ? "bg-amber-50 border border-amber-200" : "bg-stone-50 border border-stone-200"}`}>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{msg.senderRole === "user" ? `User #${msg.userId}` : "Admin"} · {new Date(msg.createdAt).toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${msg.senderRole === "user" ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-900"}`}>{msg.senderRole}</span>
                  </div>
                  <p className="text-slate-800">{msg.body}</p>
                  {msg.senderRole === "user" ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyBody[msg.userId] ?? ""}
                        onChange={e => setReplyBody({ ...replyBody, [msg.userId]: e.target.value })}
                        className="flex-1 rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
                        placeholder="Reply to this user..."
                      />
                      <button
                        onClick={() => {
                          const text = replyBody[msg.userId]?.trim();
                          if (text) {
                            void reply.mutateAsync({ userId: msg.userId, body: text }).then(() => {
                              setReplyBody({ ...replyBody, [msg.userId]: "" });
                              support.refetch();
                            });
                          }
                        }}
                        className="rounded-full bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Reply
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No support messages.</p>
            )}
          </div>
        </div>
      </section>
    </AuthRequired>
  );
}
