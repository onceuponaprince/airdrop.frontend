'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="h-12 rounded border border-[--border] bg-[--card] animate-pulse"
        />
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  // HANDOVER: UI shell is complete, data integration is pending.
  // TODO: Wire branch tabs to API queries (/api/v1/leaderboard/global|branch/{branch}).
  // TODO: Render each response row with <LeaderboardRow /> and rank delta animation.
  return (
    <motion.main
      className="flex-1 space-y-8 overflow-y-auto p-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="font-display text-2xl sm:text-3xl text-[--primary]">
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-[--muted-foreground]">
          Top contributors by XP and branch
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex gap-2" variants={staggerItem}>
        <button className="px-4 py-2 text-sm rounded border border-[--primary] bg-[--primary] text-[--primary-foreground]">
          Global
        </button>
        <button className="px-4 py-2 text-sm rounded border border-[--border] hover:bg-[--secondary]">
          Educator
        </button>
        <button className="px-4 py-2 text-sm rounded border border-[--border] hover:bg-[--secondary]">
          Builder
        </button>
        <button className="px-4 py-2 text-sm rounded border border-[--border] hover:bg-[--secondary]">
          Creator
        </button>
      </motion.div>

      {/* Leaderboard */}
      <motion.div variants={staggerItem}>
        <Suspense fallback={<LeaderboardSkeleton />}>
          <div className="space-y-2">
            {/* HANDOVER: Replace with mapped <LeaderboardRow /> items from query state. */}
            <p className="text-[--muted-foreground] text-sm">
              Loading leaderboard...
            </p>
          </div>
        </Suspense>
      </motion.div>
    </motion.main>
  );
}
