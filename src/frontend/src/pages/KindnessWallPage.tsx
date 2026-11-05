// src/pages/KindnessWallPage.tsx
import KindnessWall from "@/components/KindnessWall";
import Layout from "@/components/Layout";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function KindnessWallPage() {
  return (
    <Layout>
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:py-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900 via-pink-900 to-slate-900 p-6 text-white shadow-2xl md:p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-rose-400/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <Link
              to="/walls"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                <Heart className="h-3 w-3 text-pink-300" fill="currentColor" /> Wall of Kindness
              </div>
              <h1 className="mt-2 font-display text-2xl font-black tracking-tight md:text-3xl">
                Stories of Hope & Kindness
              </h1>
              <p className="mt-1 max-w-lg text-sm font-medium text-pink-100">
                Real requests, real support. Read heartwarming stories from verified cases.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-50/40 to-transparent pointer-events-none" />
          <div className="relative">
            <KindnessWall />
          </div>
        </div>
      </main>
    </Layout>
  );
}
