import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function anthropicErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("[AI Judge] Anthropic auth failure — check ANTHROPIC_API_KEY:", err.message)
    return NextResponse.json({ error: "AI Judge configuration error." }, { status: 500 })
  }
  if (err instanceof Anthropic.RateLimitError) {
    return NextResponse.json({ error: "Rate limit reached. Please try again shortly." }, { status: 429 })
  }
  if (err instanceof Anthropic.BadRequestError || err instanceof Anthropic.PermissionDeniedError) {
    const msg = err.message ?? ""
    if (msg.toLowerCase().includes("credit balance")) {
      console.error("[AI Judge] Anthropic credit balance too low — top up at console.anthropic.com/settings/plans")
      return NextResponse.json(
        { error: "Scoring temporarily unavailable — service credit exhausted." },
        { status: 503 }
      )
    }
    console.error("[AI Judge] Anthropic API error:", msg)
    return NextResponse.json({ error: "Scoring temporarily unavailable. Please try again." }, { status: 503 })
  }
  if (err instanceof Anthropic.APIError) {
    console.error("[AI Judge] Anthropic API error:", err.status, err.message)
    return NextResponse.json({ error: "Scoring temporarily unavailable. Please try again." }, { status: 503 })
  }
  return null
}

// Rate limit: 10 requests per IP per minute for the demo endpoint
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

const SCORING_PROMPT = `You are the AI Judge for AI(r)Drop, a Web3 contribution scoring platform.

Your task is to evaluate a piece of Web3-related content and score it across three dimensions.

Score each dimension from 0 to 100:
- Teaching Value (0-100): Does this help someone understand something? Does it explain, clarify, or onboard? High scores for content that teaches a concept, explains a mechanism, or helps someone learn something they didn't know. Low scores for content that assumes knowledge without explaining it.
- Originality (0-100): Is this a novel insight or regurgitated common knowledge? Does it add to the discourse? High scores for fresh analysis, unique observations, or non-obvious connections. Low scores for rephrased press releases, repeated common wisdom, or generic statements.
- Community Impact (0-100): Does this serve the community? Bug reports, tool creation, translations, and community moderation score highly. Content that helps onboard new users, resolves misunderstandings, or builds bridges between communities scores highly.

Also determine a farming flag:
- "genuine": This appears to be authentic content created to provide value
- "farming": This shows patterns consistent with engagement farming — templated posts, excessive hashtags, low-effort hype, mass reposting patterns, bot-like structure
- "ambiguous": This could go either way — it has some value but also some farming signals

Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "teachingValue": <0-100>,
  "originality": <0-100>,
  "communityImpact": <0-100>,
  "compositeScore": <average of the three, rounded>,
  "farmingFlag": "genuine" | "farming" | "ambiguous",
  "farmingExplanation": "<1-2 sentences explaining the farming assessment>",
  "dimensionExplanations": {
    "teachingValue": "<1 sentence explaining this score>",
    "originality": "<1 sentence explaining this score>",
    "communityImpact": "<1 sentence explaining this score>"
  }
}`

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function streamPayload(chunk: unknown): string {
  return `${JSON.stringify(chunk)}\n`
}

function createScoreStream(result: {
  teachingValue: number
  originality: number
  communityImpact: number
  compositeScore: number
  farmingFlag: string
  farmingExplanation: string
  dimensionExplanations: {
    teachingValue: string
    originality: string
    communityImpact: string
  }
  scoredAt: string
}) {
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
  // Rate limit check
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

  if (!process.env.ANTHROPIC_API_KEY) {
    // Dev fallback: return mock scores when no API key configured
    const mockResult = {
      teachingValue: 72,
      originality: 58,
      communityImpact: 65,
      compositeScore: 65,
      farmingFlag: "genuine",
      farmingExplanation:
        "Mock response — configure ANTHROPIC_API_KEY to enable real scoring.",
      dimensionExplanations: {
        teachingValue: "Mock score — real scoring requires API key.",
        originality: "Mock score — real scoring requires API key.",
        communityImpact: "Mock score — real scoring requires API key.",
      },
      scoredAt: new Date().toISOString(),
    }

    return new NextResponse(createScoreStream(mockResult), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `${SCORING_PROMPT}\n\nContent to evaluate:\n\n${text}`,
        },
      ],
    })

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : ""

    // Parse JSON response
    const result = JSON.parse(responseText)

    const response = {
      ...result,
      scoredAt: new Date().toISOString(),
    }

    return new NextResponse(createScoreStream(response), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (err) {
    const anthropicResponse = anthropicErrorResponse(err)
    if (anthropicResponse) return anthropicResponse

    if (err instanceof SyntaxError) {
      console.error("[AI Judge] Failed to parse Anthropic response:", err)
      return NextResponse.json(
        { error: "Failed to parse judge response. Please try again." },
        { status: 500 }
      )
    }

    console.error("[AI Judge] Unexpected scoring error:", err)
    return NextResponse.json(
      { error: "Scoring temporarily unavailable. Please try again." },
      { status: 500 }
    )
  }
}
