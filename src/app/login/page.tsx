'use client';

import Link from 'next/link';
import { WalletButton } from '@/components/shared/WalletButton';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[--background] text-[--foreground] px-4 py-24">
      <div className="max-w-md mx-auto rounded-lg border border-[--border] bg-[--card] p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-2xl text-[--primary]">Login</h1>
          <p className="text-sm text-[--muted-foreground]">
            Connect your wallet to authenticate and access the app dashboard.
          </p>
        </div>

        <div className="flex justify-start">
          <WalletButton />
        </div>

        <div className="text-xs text-[--muted-foreground] border-t border-[--border] pt-4">
          Admin users can access the admin dashboard after login.
        </div>

        <div>
          <Link href="/dashboard" className="text-sm text-[--primary] hover:underline">
            Continue to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
