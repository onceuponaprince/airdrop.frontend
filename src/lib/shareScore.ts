import type { JudgeResult } from '@/types/api';
import { FARMING_FLAGS } from '@/lib/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://airdrop.works';

export function buildScoreShareUrl(result: JudgeResult): string {
  const params = new URLSearchParams({
    composite: String(result.compositeScore),
    teaching: String(result.teachingValue),
    originality: String(result.originality),
    impact: String(result.communityImpact),
    flag: result.farmingFlag,
  });
  return `${SITE_URL}/score?${params.toString()}`;
}

export function buildTwitterShareUrl(result: JudgeResult): string {
  const scoreUrl = buildScoreShareUrl(result);
  const flagLabel = FARMING_FLAGS[result.farmingFlag].label;

  const text = `My AI Judge score: ${result.compositeScore}/100 — ${flagLabel} contributor. Can you beat it?`;

  const twitterParams = new URLSearchParams({ text, url: scoreUrl });
  return `https://twitter.com/intent/tweet?${twitterParams.toString()}`;
}
