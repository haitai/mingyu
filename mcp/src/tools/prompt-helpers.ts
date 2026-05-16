import { buildDivinationPrompt } from '../../../src/lib/divination/engine/index.js';
import type { DivinationMethodId } from '../../../src/lib/divination/config.js';
import type {
  DivinationData,
  LiurenTemplateType,
  SupplementaryInfo,
} from '../../../src/types/divination.js';

export function buildDivinationPromptText(params: {
  method: Exclude<DivinationMethodId, 'random'>;
  question: string;
  data: unknown;
  supplementaryInfo?: SupplementaryInfo;
  template?: LiurenTemplateType;
}) {
  return buildDivinationPrompt(
    params.method,
    params.question,
    params.data as DivinationData,
    params.supplementaryInfo,
    params.template ?? 'general',
  );
}
