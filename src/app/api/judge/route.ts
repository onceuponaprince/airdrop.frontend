import { NextRequest, NextResponse } from "next/server"

interface BackendJudgeResult {
  teaching_value: number
  originality: number
  community_impact: number
  composite_score: number
  farming_flag: "genuine" | "farming" | "ambiguous"
  farming_explanation: string
  dimension_explanations: {
    teaching_value: string
    originality: string
    community_impact: string
  }
}

interface FrontendJudgeResult {
  teachingValue: number
  originality: number
  communityImpact: number
  compositeScore: number
  farmingFlag: "genuine" | "farming" | "ambiguous"
  farmingExplanation: string
  dimensionExplanations: {
    teachingValue: string
    originality: string
    communityImpact: string
  }
  scoredAt: string
}

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

const rateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= 10) return false

  entry.count++
  return true
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function streamPayload(chunk: unknown): string {
  return `${JSON.stringify(chunk)}\n`
}

function mapBackendResult(result: BackendJudgeResult): FrontendJudgeResult {
  return {
    teachingValue: result.teaching_value,
    originality: result.originality,
    communityImpact: result.community_impact,
    compositeScore: result.composite_score,
    farmingFlag: result.farming_flag,
    farmingExplanation: result.farming_explanation,
    dimensionExplanations: {
      teachingValue: result.dimension_explanations.teaching_value,
      originality: result.dimension_explanations.originality,
      communityImpact: result.dimension_explanations.community_impact,
    },
    scoredAt: new Date().toISOString(),
  }
}

function createScoreStream(result: FrontendJudgeResult) {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(streamPayload({ type: "status", phase: "reading" })))
      await sleep(250)

      controller.enqueue(
        encoder.encode(
          streamPayload({
            type: "partial",
            partial: {
              teachingValue: Math.max(0, Math.round(result.teachingValue * 0.45)),
              originality: Math.max(0, Math.round(result.originality * 0.45)),
              communityImpact: Math.max(0, Math.round(result.communityImpact * 0.45)),
            },
          })
        )
      )
      await sleep(300)

      controller.enqueue(
        encoder.encode(
          streamPayload({
            type: "partial",
            partial: {
              teachingValue: Math.max(0, Math.round(result.teachingValue * 0.75)),
              originality: Math.max(0, Math.round(result.originality * 0.75)),
              communityImpact: Math.max(0, Math.round(result.communityImpact * 0.75)),
            },
          })
        )
      )
      await sleep(300)

      controller.enqueue(
        encoder.encode(
          streamPayload({
            type: "partial",
            partial: {
              teachingValue: result.teachingValue,
              originality: result.originality,
              communityImpact: result.communityImpact,
            },
          })
        )
      )

      controller.enqueue(encoder.encode(streamPayload({ type: "final", result })))
      controller.close()
    },
  })
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    )
  }

  let text: string
  try {
    const body = await req.json()
    text = body.text?.trim()
    if (!text) throw new Error("No text provided")
    if (text.length > 5000) throw new Error("Text too long (max 5000 chars)")
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`${BASE_API_URL}/judge/demo/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null
      const message = errorPayload?.detail || "Scoring temporarily unavailable. Please try again."
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const backendResult = (await response.json()) as BackendJudgeResult
    const result = mapBackendResult(backendResult)

    return new NextResponse(createScoreStream(result), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (err) {
    console.error("[AI Judge] Backend proxy error:", err)
    return NextResponse.json(
      { error: "Scoring temporarily unavailable. Please try again." },
      { status: 503 }
    )
  }
}
