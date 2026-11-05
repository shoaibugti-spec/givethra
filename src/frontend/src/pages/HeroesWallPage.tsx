// src/pages/HeroesWallPage.tsx
import HeroesWall from "@/components/HeroesWall";
import Layout from "@/components/Layout";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Medal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroesWallPage() {
  return (
    <Layout>
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:py-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 p-6 text-white shadow-2xl md:p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <Link
              to="/walls"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                <Medal className="h-3 w-3 text-teal-300" /> Wall of Heroes
              </div>
              <h1 className="mt-2 font-display text-2xl font-black tracking-tight md:text-3xl">
                Celebrating Real Heroes
              </h1>
              <p className="mt-1 max-w-lg text-sm font-medium text-teal-100">
                Meet verified heroes who paid institutions directly and changed lives.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/40 to-transparent pointer-events-none" />
          <div className="relative">
            <HeroesWall />
          </div>
        </div>
      </main>
    </Layout>
  );
}
