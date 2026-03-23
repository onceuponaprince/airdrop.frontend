'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function DashboardPage() {
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
          Character Sheet
        </h1>
        <p className="mt-2 text-sm text-[--muted-foreground]">
          Your profile, skills, and progress
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" variants={staggerItem}>
        {[
          { label: 'Total XP', value: '0', unit: 'XP' },
          { label: 'Current Rank', value: '—', unit: '' },
          { label: 'Contributions', value: '0', unit: '' },
          { label: 'Badges', value: '0', unit: '' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[--border] bg-[--card] p-4"
          >
            <p className="text-[--muted-foreground] text-xs font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-[--primary] mt-2">
              {stat.value} {stat.unit}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Branch Progress */}
      <motion.section className="space-y-4" variants={staggerItem}>
        <h2 className="text-lg font-bold font-heading">Branch Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {['educator', 'builder', 'creator', 'scout', 'diplomat'].map((branch) => (
            <div
              key={branch}
              className="rounded-lg border border-[--border] bg-[--card] p-4 text-center"
            >
              <p className="capitalize font-medium text-sm">{branch}</p>
              <p className="text-2xl font-bold text-[--primary] mt-2">0 XP</p>
              <div className="mt-3 h-2 bg-[--secondary] rounded">
                <div
                  className="h-full bg-[--primary] rounded"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Recent Contributions */}
      <motion.section className="space-y-4" variants={staggerItem}>
        <h2 className="text-lg font-bold font-heading">Recent Contributions</h2>
        <div className="rounded-lg border border-[--border] bg-[--card] p-6 text-center">
          <p className="text-[--muted-foreground] text-sm">
            No contributions yet. Submit your first score to get started!
          </p>
        </div>
      </motion.section>
    </motion.main>
  );
}
