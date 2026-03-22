import type { Branch, RarityTier, DifficultyRating, FarmingFlag, Platform, Chain } from "@/lib/constants"

// ── AI Judge ─────────────────────────────────────────────────────────────────

export interface ScoreDimensions {
  teachingValue: number   // 0–100
  originality: number     // 0–100
  communityImpact: number // 0–100
}

export interface JudgeResult extends ScoreDimensions {
  compositeScore: number
  farmingFlag: FarmingFlag
  farmingExplanation: string
  dimensionExplanations: {
    teachingValue: string
    originality: string
    communityImpact: string
  }
  scoredAt: string
}

export interface DemoScoreRequest {
  text: string
}

export interface ScoreRequest {
  contributionId: string
}

export interface ScoreTaskResponse {
  taskId: string
  status: "pending" | "scoring" | "complete" | "failed"
  result?: JudgeResult
}

// ── User / Auth ───────────────────────────────────────────────────────────────

export interface User {
  id: string
  walletAddress: string
  email?: string
  dynamicUserId?: string
  createdAt: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface WalletVerifyRequest {
  walletAddress: string
  message: string
  signature: string
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  user: User
  totalXp: number
  educatorXp: number
  builderXp: number
  creatorXp: number
  scoutXp: number
  diplomatXp: number
  skillTreeState: Record<string, string> // { nodeId: unlockedAt }
  rank: number | null
  badges: Badge[]
  createdAt: string
  updatedAt: string
}

export interface SkillNode {
  id: string
  branch: Branch
  tier: number
  name: string
  description: string
  xpCost: number
  bonusMultiplier: number
  prerequisiteNodeIds: string[]
  position: { x: number; y: number }
}

// ── Contributions ─────────────────────────────────────────────────────────────

export interface Contribution {
  id: string
  user: string
  platform: Platform
  contentText: string
  contentUrl?: string
  teachingValue?: number
  originality?: number
  communityImpact?: number
  totalScore?: number
  farmingFlag?: FarmingFlag
  xpAwarded: number
  scoredAt?: string
  discoveredAt: string
}

// ── Quests ────────────────────────────────────────────────────────────────────

export interface Quest {
  id: string
  title: string
  description: string
  difficulty: DifficultyRating
  rewardPool: string
  rewardToken: string
  chain: Chain
  scoringRubric: Record<string, number>
  startDate: string
  endDate: string
  maxParticipants?: number
  partySize?: number
  participantCount: number
  status: "upcoming" | "active" | "completed"
  projectName: string
  projectLogoUrl?: string
}

export interface QuestAcceptance {
  questId: string
  userId: string
  acceptedAt: string
  status: "active" | "completed" | "expired"
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    walletAddress: string
    displayName?: string
    avatarUrl?: string
  }
  totalXp: number
  primaryBranch: Branch
  weeklyXp: number
  contributionCount: number
}

// ── Loot & Rewards ────────────────────────────────────────────────────────────

export interface LootItem {
  id: string
  rarity: RarityTier
  type: "badge" | "innovator_token" | "multiplier"
  name: string
  description: string
  amount?: number
  imageUrl?: string
  opened: boolean
  receivedAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  imageUrl: string
  rarity: RarityTier
  earnedAt: string
  nftTokenId?: string
  chain?: Chain
}

export interface LootChestOpenResult {
  item: LootItem
  animationData: {
    rarity: RarityTier
    delay: number
  }
}

// ── Waitlist ──────────────────────────────────────────────────────────────────

export interface WaitlistEntry {
  email: string
  walletAddress?: string
  primaryBranch?: Branch
  referralCode?: string
  source?: string
}

export interface WaitlistResponse {
  rank: number
  referralLink: string
  alreadyRegistered: boolean
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
