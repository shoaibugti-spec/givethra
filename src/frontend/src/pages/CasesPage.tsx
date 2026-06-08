import type { CaseSummary, VerificationStatus } from "@/backend";
import { CaseCard, type CaseCardData } from "@/components/CaseCard";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { useBackendActor } from "@/hooks/useBackend";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const CATEGORIES = [
  "All",
  "Education",
  "Medical",
  "Food",
  "Housing",
  "Disability Support",
  "Orphans",
  "Widows",
  "Emergency Cases",
  "Other Needs",
];

const VERIF_OPTIONS = [
  "All",
  "Unverified",
  "DocumentsSubmitted",
  "InstitutionVerified",
];

function toCardData(c: CaseSummary): CaseCardData {
  const vMap: Record<VerificationStatus, CaseCardData["verificationLevel"]> = {
    DocumentsSubmitted: "documents_submitted",
    InstitutionVerified: "institution_verified",
    Unverified: "unverified",
  };
  return {
    id: String(c.id),
    title: c.title,
    category: c.category,
    country: c.country,
    city: c.city,
    amountNeeded: Number(c.amountNeeded) / 100,
    amountRaised: 0,
    verificationLevel: vMap[c.verificationStatus] ?? "unverified",
    description: "",
  };
}

export default function CasesPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVerif, setActiveVerif] = useState("All");

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor
      .listCases(null, { offset: BigInt(0), limit: BigInt(50) })
      .then(setCases)
      .finally(() => setLoading(false));
  }, [actor, isFetching]);

  const filtered = cases.filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchVerif =
      activeVerif === "All" || c.verificationStatus === activeVerif;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchVerif && matchSearch;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Verified Cases
          </h1>
          <p className="text-muted-foreground">
            Browse real people who need your support. Unlock a case to see full
            details and pay directly.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="cases.search_input"
            placeholder="Search by title, country, city..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div data-ocid="cases.category_filter" className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid={`cases.filter.${cat.toLowerCase().replace(/ /g, "_")}_tab`}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Verification filter */}
        <div data-ocid="cases.verif_filter" className="flex flex-wrap gap-2">
          {VERIF_OPTIONS.map((v) => (
            <button
              key={v}
              type="button"
              data-ocid={`cases.verif.${v.toLowerCase()}_tab`}
              onClick={() => setActiveVerif(v)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                activeVerif === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {v === "All"
                ? "All Status"
                : v === "DocumentsSubmitted"
                  ? "Docs Submitted"
                  : v === "InstitutionVerified"
                    ? "Verified"
                    : v}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div
            className="flex justify-center py-20"
            data-ocid="cases.loading_state"
          >
            <LoadingSpinner label="Loading cases..." />
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="cases.empty_state"
            className="text-center py-20 space-y-3"
          >
            <p className="text-muted-foreground">
              No cases found. Try a different search or filter.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <div key={String(c.id)} data-ocid={`cases.item.${i + 1}`}>
                <CaseCard
                  data={toCardData(c)}
                  onClick={() =>
                    navigate({ to: "/cases/$id", params: { id: String(c.id) } })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
