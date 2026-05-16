import type { ScopeType } from '../../types/analysis';
import type { BaziChartResult } from '../../utils/bazi/baziTypes';
import {
  BAZI_AI_PROMPTS,
  buildPromptFromConfig,
  type AIPromptOption,
} from '../../utils/ai/aiPrompts';
import { buildCombinedZiweiPrompt, type ZiweiRuntime } from '../full-chart-engine/ziwei';

export const BAZI_PROMPT_TOPICS = [
  'general',
  'career',
  'wealth',
  'marriage',
  'children',
  'health',
] as const;

export const ZIWEI_PROMPT_TOPICS = [
  'destiny',
  'relationship',
  'career-wealth',
  'life',
  'chat',
] as const;

export const ZIWEI_PROMPT_SCOPES = [
  'origin',
  'decadal',
  'yearly',
  'monthly',
  'daily',
  'hourly',
  'age',
] as const;

export type BaziPromptTopic = (typeof BAZI_PROMPT_TOPICS)[number];
export type ZiweiPromptTopic = (typeof ZIWEI_PROMPT_TOPICS)[number];
export type ZiweiPromptScope = (typeof ZIWEI_PROMPT_SCOPES)[number];

const BAZI_TOPIC_TO_PROMPT_ID: Record<BaziPromptTopic, string> = {
  general: 'ai-mingge-zonglun',
  career: 'ai-career',
  wealth: 'ai-wealth-timing',
  marriage: 'ai-marriage',
  children: 'ai-children-fate',
  health: 'ai-health',
};

export function buildCombinedPromptText(system: string, user: string) {
  return [system, user].filter(Boolean).join('\n\n');
}

function resolveBaziPromptOption(topic: BaziPromptTopic): AIPromptOption {
  const promptId = BAZI_TOPIC_TO_PROMPT_ID[topic] ?? BAZI_TOPIC_TO_PROMPT_ID.general;
  return BAZI_AI_PROMPTS.single.find((item) => item.id === promptId) ?? BAZI_AI_PROMPTS.single[0];
}

export function buildBaziPromptForResult(params: {
  result: BaziChartResult;
  question?: string;
  topic?: BaziPromptTopic;
}) {
  const option = resolveBaziPromptOption(params.topic ?? 'general');
  const prompt = buildPromptFromConfig(
    params.question?.trim() || option.prompt || '请先做整体解读。',
    option,
    params.result,
  );

  return buildCombinedPromptText(prompt.system, prompt.user);
}

export function buildSerializableZiweiResult(result: ZiweiRuntime) {
  return {
    basicInfo: result.payloadByScope.origin.basic_info,
    scopeNames: Object.keys(result.payloadByScope),
    payloadByScope: result.payloadByScope,
  };
}

export function buildZiweiPromptForRuntime(params: {
  result: ZiweiRuntime;
  question?: string;
  topic?: ZiweiPromptTopic;
  scope?: ZiweiPromptScope;
}) {
  const scope = params.scope ?? 'origin';
  const payload =
    params.result.payloadByScope[scope as ScopeType] ?? params.result.payloadByScope.origin;
  return buildCombinedZiweiPrompt(
    payload,
    params.topic ?? 'chat',
    params.question?.trim() || '请先做整体解读。',
  );
}
