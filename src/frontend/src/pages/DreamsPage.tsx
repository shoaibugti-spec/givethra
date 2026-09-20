import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles, Users, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDreams } from "@/lib/api";

export type Dream = {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url?: string | null;
  icon?: string;
  dream_price: number;
  funded_amount: number;
  participant_capacity: number;
  approved_participants: number;
  status: string;
  announcement_at?: string | null;
};

const FALLBACK_DREAMS: Dream[] = [
  { id: "dream-family-car", name: "A Family Car", category: "Cars", description: "A dependable car can make work, school and everyday life more accessible.", icon: "🚙", dream_price: 200000, funded_amount: 128000, participant_capacity: 1000, approved_participants: 640, status: "Open" },
  { id: "dream-washing-machine", name: "A Washing Machine", category: "Home Appliances", description: "A practical home dream that gives a family more time and dignity.", icon: "🧺", dream_price: 85000, funded_amount: 39100, participant_capacity: 500, approved_participants: 230, status: "Open" },
  { id: "dream-air-conditioner", name: "An Air Conditioner", category: "Home Appliances", description: "Comfort at home can be meaningful, especially for children and elders.", icon: "❄️", dream_price: 125000, funded_amount: 71250, participant_capacity: 750, approved_participants: 428, status: "Open" },
  { id: "dream-television", name: "A Family Television", category: "Home & Lifestyle", description: "A shared screen for learning, connection and family moments.", icon: "📺", dream_price: 65000, funded_amount: 24700, participant_capacity: 400, approved_participants: 152, status: "Open" },
  { id: "dream-motorcycle", name: "A Motorcycle", category: "Mobility", description: "A step toward easier commuting, earning and independence.", icon: "🏍️", dream_price: 160000, funded_amount: 102400, participant_capacity: 800, approved_participants: 512, status: "Open" },
  { id: "dream-refrigerator", name: "A Refrigerator", category: "Home Appliances", description: "A lasting home essential that supports a healthier daily life.", icon: "🧊", dream_price: 110000, funded_amount: 46200, participant_capacity: 600, approved_participants: 252, status: "Open" },
];

const money = (value: number) => `PKR ${Math.round(value).toLocaleString()}`;

function DreamArtwork({ dream }: { dream: Dream }) {
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
      <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-teal-200/30 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-amber-200/35 blur-2xl" />
      {dream.image_url ? <img src={dream.image_url} alt={dream.name} className="relative h-full w-full object-cover" /> : <span className="relative text-7xl drop-shadow-sm" aria-hidden>{dream.icon || "✨"}</span>}
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 shadow-sm">{dream.category}</span>
    </div>
  );
}

export default function DreamsPage() {
  const [dreams, setDreams] = useState<Dream[]>(FALLBACK_DREAMS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => { getDreams().then((rows) => { if (rows.length) setDreams(rows); }).catch(() => {}); }, []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(dreams.map((d) => d.category)))], [dreams]);
  const visible = useMemo(() => dreams.filter((dream) => {
    const matchesQuery = `${dream.name} ${dream.category} ${dream.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "All" || dream.category === category);
  }), [dreams, query, category]);

  return <Layout>
    <main className="min-h-screen bg-gradient-to-b from-teal-50/70 via-background to-background pb-24 md:pb-10">
      <section className="relative overflow-hidden border-b border-teal-100 bg-gradient-to-br from-[#075e69] via-[#0b8795] to-[#32b6a6] text-white">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"><Sparkles className="h-3.5 w-3.5" /> Givethra Dreams</div>
            <h1 className="font-display text-4xl font-black tracking-tight md:text-6xl">A meaningful step toward something you dream of.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 md:text-lg">Explore community-funded Dreams for products that matter. Choose a Dream, become part of its journey, and keep every step clear and verified.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-white/90"><span className="rounded-full bg-white/10 px-4 py-2"><WalletCards className="mr-2 inline h-4 w-4" />Separate from Help cases</span><span className="rounded-full bg-white/10 px-4 py-2"><Users className="mr-2 inline h-4 w-4" />Community participation</span></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Choose your Dream</p><h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">Dreams worth taking a step toward</h2></div><div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Dreams" className="h-11 rounded-full bg-white pl-9" /></div></div>
        <div className="mb-7 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${item === category ? "border-teal-600 bg-teal-600 text-white" : "border-border bg-card text-muted-foreground hover:border-teal-300 hover:text-teal-700"}`}>{item}</button>)}</div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((dream) => { const percent = Math.min(100, Math.round((dream.funded_amount / Math.max(1, dream.dream_price)) * 100)); return <article key={dream.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><DreamArtwork dream={dream} /><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-display text-xl font-bold leading-tight">{dream.name}</h3><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">{dream.status}</span></div><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{dream.description}</p><div className="mt-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dream Price</p><p className="text-lg font-black text-teal-700">{money(dream.dream_price)}</p></div><p className="text-xs font-bold text-muted-foreground">{percent}% funded</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-teal-100"><div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400" style={{ width: `${percent}%` }} /></div><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{money(dream.funded_amount)} funded</span><span>{money(Math.max(0, dream.dream_price - dream.funded_amount))} remaining</span></div><Link to="/dreams/$id" params={{ id: dream.id }} className="mt-5 block"><Button className="h-11 w-full rounded-xl bg-teal-700 font-bold hover:bg-teal-800">Make This My Dream <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div></article>; })}</div>
        {!visible.length && <div className="rounded-3xl border border-dashed p-12 text-center text-muted-foreground">No Dreams match your search yet.</div>}
      </section>
    </main>
  </Layout>;
}

export { FALLBACK_DREAMS, money };
