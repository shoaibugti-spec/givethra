// src/frontend/src/pages/CasesPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, CheckCircle2, SlidersHorizontal, X, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getApprovedCases } from "@/lib/api";
import { shareCase } from "@/lib/caseSharing";
import { toast } from "sonner";

const CATEGORIES = [
  "Education",
  "School Fees",
  "University Fees",
  "Books",
  "Uniform",
  "Medical",
  "Surgery",
  "Medicines",
  "Utilities",
  "Housing",
  "Food",
  "Employment",
  "Transportation",
  "Disability Support",
  "Orphans",
  "Widows",
  "Debt Relief",
  "Emergency Needs",
  "Other",
];

const URGENCIES = ["Low", "Medium", "High", "Emergency"];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  TRY: "₺",
  BDT: "৳",
  EGP: "E£",
  NGN: "₦",
  KES: "KSh",
  ZAR: "R",
  BRL: "R$",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  IDR: "Rp",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
  SGD: "S$",
  AFN: "؋",
  NPR: "Rs",
  LKR: "Rs",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
  JOD: "JOD",
  MAD: "MAD",
};

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
            );
            const data = await res.json();
            if (data?.countryName) setDetectedCountry(data.countryName);
          } catch {}
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  async function loadCases() {
    setLoading(true);
    try {
      const data = await getApprovedCases();
      setCases(data ?? []);
    } catch (err) {
      console.error("Failed to load cases:", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }

  const countries = Array.from(new Set(cases.map((c) => c.country).filter(Boolean))).sort();
  const cities = Array.from(
    new Set(
      cases
        .filter((c) => filterCountry === "all" || c.country === filterCountry)
        .map((c) => c.city)
        .filter(Boolean)
    )
  ).sort();

  let filtered = cases.filter((c) => {
    if (filterCountry !== "all" && c.country !== filterCountry) return false;
    if (filterCity !== "all" && c.city !== filterCity) return false;
    if (filterCat !== "all" && c.category !== filterCat) return false;
    if (filterUrgency !== "all" && c.urgency !== filterUrgency) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !c.title?.toLowerCase().includes(q) &&
        !c.short_description?.toLowerCase().includes(q) &&
        !c.description?.toLowerCase().includes(q) &&
        !c.institute_name?.toLowerCase().includes(q) &&
        !c.city?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "newest")
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    if (sortBy === "oldest")
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    if (sortBy === "amount_low") return (a.amount_needed ?? 0) - (b.amount_needed ?? 0);
    if (sortBy === "amount_high") return (b.amount_needed ?? 0) - (a.amount_needed ?? 0);
    if (sortBy === "urgent") {
      const order: any = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
      return (order[b.urgency] ?? 0) - (order[a.urgency] ?? 0);
    }
    return 0;
  });

  const activeFilterCount = [filterCountry, filterCity, filterCat, filterUrgency].filter(
    (f) => f !== "all"
  ).length;

  function resetFilters() {
    setFilterCountry("all");
    setFilterCity("all");
    setFilterCat("all");
    setFilterUrgency("all");
    setSortBy("newest");
    setSearch("");
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Browse Cases</h1>
          {detectedCountry && (
            <button
              onClick={() => setFilterCountry(detectedCountry)}
              className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium"
            >
              📍 Near me: {detectedCountry}
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hospital, school, title, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 flex-1"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{" "}
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-[10px] rounded-full px-1.5">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount_low">Amount: Low to High</SelectItem>
              <SelectItem value="amount_high">Amount: High to Low</SelectItem>
              <SelectItem value="urgent">Most Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFilters && (
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-600 flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Country</Label>
              <Select
                value={filterCountry}
                onValueChange={(v) => {
                  setFilterCountry(v);
                  setFilterCity("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">City</Label>
              <Select
                value={filterCity}
                onValueChange={setFilterCity}
                disabled={filterCountry === "all"}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      filterCountry === "all" ? "Select country first" : "All cities"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Category</Label>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Urgency</Label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterUrgency("all")}
                  className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                    filterUrgency === "all"
                      ? "bg-primary text-white border-primary"
                      : "border-border"
                  }`}
                >
                  All
                </button>
                {URGENCIES.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setFilterUrgency(u)}
                    className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                      filterUrgency === u
                        ? "bg-primary text-white border-primary"
                        : "border-border"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">{filtered.length} case(s) found</p>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed bg-muted/20">
            <p className="font-semibold">No cases found.</p>
            <p className="text-muted-foreground text-sm mt-1">Try changing your filters.</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const cur = c.currency || "USD";
              const s = sym(cur);
              const needed = Number(c.amount_needed ?? 0);
              const collected = Number(c.amount_collected ?? 0);
              const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
              return (
                <div
                  key={c.id}
                  className="rounded-xl border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    navigate({
                      to: "/cases/$id",
                      params: { id: c.id },
                    })
                  }
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {c.category}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          c.urgency === "Emergency"
                            ? "bg-red-100 text-red-700"
                            : c.urgency === "High"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.urgency}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {c.short_description}
                    </p>

                    {needed > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-medium">
                          <span className="text-teal-600">
                            {s} {collected} raised
                          </span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {c.deadline &&
                      (() => {
                        const daysLeft = Math.ceil(
                          (new Date(c.deadline).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        );
                        if (daysLeft < 0) return null;
                        return (
                          <div
                            className={`text-xs font-bold px-2 py-1 rounded-lg text-center ${
                              daysLeft <= 3
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            ⏳{" "}
                            {daysLeft === 0
                              ? "Expires TODAY!"
                              : daysLeft === 1
                              ? "1 day left!"
                              : `${daysLeft} days left to help!`}
                          </div>
                        );
                      })()}
                    <div className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t">
                      <span className="flex items-center gap-1 min-w-0 truncate">
                        <MapPin className="h-3 w-3 shrink-0" /> {c.city}, {c.country}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {needed > 0 && <span className="font-bold text-primary">{s} {needed} {cur}</span>}
                        <button
                          type="button"
                          aria-label={`Share ${c.title}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors hover:bg-primary/10"
                          onClick={async (event) => {
                            event.stopPropagation();
                            const result = await shareCase(c);
                            if (result === "shared") toast.success("Case shared!");
                            else if (result === "copied") toast.success("Case message and link copied!");
                          }}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
