'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function SettingsPage() {
  return (
    <motion.main
      className="flex-1 space-y-8 overflow-y-auto p-6 max-w-2xl"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="font-display text-2xl sm:text-3xl text-[--primary]">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[--muted-foreground]">
          Manage your account and preferences
        </p>
      </motion.div>

      {/* Account Section */}
      <motion.section className="space-y-4" variants={staggerItem}>
        <h2 className="text-lg font-bold font-heading">Account</h2>
        <div className="rounded-lg border border-[--border] bg-[--card] p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Wallet Address</label>
            <p className="text-[--muted-foreground] text-sm mt-1 break-all font-mono">
              0x...
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-[--muted-foreground] text-sm mt-1">
              user@example.com
            </p>
          </div>
        </div>
      </motion.section>

      {/* Preferences Section */}
      <motion.section className="space-y-4" variants={staggerItem}>
        <h2 className="text-lg font-bold font-heading">Preferences</h2>
        <div className="rounded-lg border border-[--border] bg-[--card] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Email Notifications</label>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Marketing Emails</label>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section className="space-y-4" variants={staggerItem}>
        <h2 className="text-lg font-bold font-heading text-[--destructive]">
          Danger Zone
        </h2>
        <div className="rounded-lg border border-[--destructive] bg-[--card] p-6 space-y-4">
          <button className="w-full px-4 py-2 rounded border border-[--destructive] text-[--destructive] hover:bg-[--destructive] hover:text-[--destructive-foreground] transition-colors">
            Disconnect Wallet
          </button>
          <button className="w-full px-4 py-2 rounded border border-[--destructive] text-[--destructive] hover:bg-[--destructive] hover:text-[--destructive-foreground] transition-colors">
            Delete Account
          </button>
        </div>
      </motion.section>
    </motion.main>
  );
}
