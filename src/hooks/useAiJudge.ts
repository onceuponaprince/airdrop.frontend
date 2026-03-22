"use client"

import { useState } from "react"
import type { JudgeResult } from "@/types/api"
import { events } from "@/lib/analytics"

interface AiJudgeState {
  status: "idle" | "scoring" | "complete" | "error"
  result: JudgeResult | null
  error: string | null
}

export function useAiJudge() {
  const [state, setState] = useState<AiJudgeState>({
    status: "idle",
    result: null,
    error: null,
  })

  const score = async (text: string) => {
    setState({ status: "scoring", result: null, error: null })
    events.aiJudgeDemo("custom")

    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Scoring failed (${res.status})`)
      }

      const result: JudgeResult = await res.json()

      setState({ status: "complete", result, error: null })
      events.aiJudgeResult(result.farmingFlag, result.compositeScore)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Scoring failed. Please try again."
      setState({ status: "error", result: null, error: message })
    }
  }

  const reset = () =>
    setState({ status: "idle", result: null, error: null })

  return { ...state, score, reset }
}
