'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Wallet } from 'lucide-react';
import clsx from 'clsx';

export function WalletButton() {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();

  const address = primaryWallet?.address
    ? `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`
    : null;
  const isAuthenticated = Boolean(primaryWallet?.address);

  if (!isAuthenticated || !address) {
    return (
      <button
        onClick={() => setShowAuthFlow(true)}
        className="px-4 py-2 rounded border border-[--primary] text-[--primary] text-sm font-medium hover:bg-[--primary] hover:text-[--primary-foreground] transition-colors flex items-center gap-2"
      >
        <Wallet size={16} />
        Connect
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowAuthFlow(true)}
      className={clsx(
        'px-4 py-2 rounded border text-sm font-medium flex items-center gap-2',
        'border-[--primary] text-[--primary-foreground] bg-[--primary] hover:opacity-90 transition-opacity'
      )}
    >
      <Wallet size={16} />
      {address}
    </button>
  );
}
