// src/frontend/src/pages/WallsPage.tsx
// One place for the three community boards: Leaderboard, Kindness Wall, Heroes Wall.

import HeroLeaderboard from "@/components/HeroLeaderboard";
import HeroesWall from "@/components/HeroesWall";
import KindnessWall from "@/components/KindnessWall";
import Layout from "@/components/Layout";
import { Heart, Medal, Trophy } from "lucide-react";
import { useState } from "react";

type WallTab = "leaderboard" | "kindness" | "heroes";

const TABS: { id: WallTab; label: string; icon: typeof Trophy }[] = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "kindness", label: "Kindness", icon: Heart },
  { id: "heroes", label: "Heroes", icon: Medal },
];

function readInitialTab(): WallTab {
  try {
    const hash = window.location.hash.replace("#", "");
    if (hash === "kindness" || hash === "heroes" || hash === "leaderboard") return hash;
  } catch {}
  return "leaderboard";
}

export default function WallsPage() {
  const [tab, setTab] = useState<WallTab>(readInitialTab);

  function selectTab(next: WallTab) {
    setTab(next);
    try {
      window.history.replaceState(null, "", `#${next}`);
    } catch {}
  }

  return (
    <Layout>
      <main className="mx-auto max-w-5xl px-3 pb-24 pt-3">
        <div role="tablist" aria-label="Walls" className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={`flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition ${
                  active ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          {tab === "leaderboard" && <HeroLeaderboard />}
          {tab === "kindness" && <KindnessWall />}
          {tab === "heroes" && <HeroesWall />}
        </div>
      </main>
    </Layout>
  );
}
