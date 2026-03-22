"use client"

import { useEffect, useState } from "react"

/**
 * Reads the ?ref=<code> query param from the URL on mount.
 * Returns the referral code if present, or null.
 *
 * The code is also persisted to sessionStorage so it survives
 * soft navigations within the same tab.
 */
export function useReferral(): string | null {
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check URL first
    const params = new URLSearchParams(window.location.search)
    const refFromUrl = params.get("ref")

    if (refFromUrl) {
      sessionStorage.setItem("airdrop_ref", refFromUrl)
      setReferralCode(refFromUrl)
      return
    }

    // Fall back to sessionStorage
    const stored = sessionStorage.getItem("airdrop_ref")
    if (stored) setReferralCode(stored)
  }, [])

  return referralCode
}
