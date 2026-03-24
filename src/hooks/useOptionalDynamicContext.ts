'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export interface OptionalDynamicContext {
  available: boolean;
  primaryWallet?: {
    address?: string;
    id?: string;
  };
  setShowAuthFlow: (show: boolean) => void;
}

const FALLBACK_DYNAMIC_CONTEXT: OptionalDynamicContext = {
  available: false,
  primaryWallet: undefined,
  setShowAuthFlow: () => {
    // No-op fallback when Dynamic provider is unavailable.
  },
};

const hasDynamicEnvironment =
  (process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? '').trim().length > 0;

export function useOptionalDynamicContext(): OptionalDynamicContext {
  if (!hasDynamicEnvironment) {
    return FALLBACK_DYNAMIC_CONTEXT;
  }

  try {
    const context = useDynamicContext() as unknown as Omit<OptionalDynamicContext, 'available'>;
    return {
      ...context,
      available: true,
    };
  } catch {
    // Dynamic provider is not mounted (e.g., missing env config).
    return FALLBACK_DYNAMIC_CONTEXT;
  }
}
