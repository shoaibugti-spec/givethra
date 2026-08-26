import KindnessWall from "@/components/KindnessWall";
import Layout from "@/components/Layout";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export default function KindnessWallPage() {
  return (
    <Layout>
      <main className="mx-auto max-w-5xl px-4 py-8 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <KindnessWall />
        </div>
      </main>
    </Layout>
  );
}
