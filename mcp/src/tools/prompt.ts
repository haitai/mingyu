import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { buildDivinationPrompt } from '../../../src/lib/divination/engine/index.js';
import type {
  DivinationData,
  LiurenTemplateType,
  SupplementaryInfo,
} from '../../../src/types/divination.js';
import type { DivinationMethodId } from '../../../src/lib/divination/config.js';
import { promptOutputSchema } from '../schemas.js';
import { createErrorToolResult, createStructuredToolResult, getErrorMessage } from '../tool-results.js';

const promptSchema = z.object({
  method: z
    .enum(['liuyao', 'meihua', 'qimen', 'liuren', 'tarot', 'ssgw'])
    .describe('占卜方式'),
  question: z.string().describe('占卜问题'),
  data: z.string().describe('排盘结果的 JSON 字符串'),
  supplementaryInfo: z.string().optional().describe('补充信息的 JSON 字符串（可选）'),
  liurenTemplate: z
    .enum(['general', 'ganqing', 'shiye', 'caifu'])
    .optional()
    .describe('大六壬断课模板（仅大六壬时需要）'),
});

export function registerPromptTool(server: McpServer) {
  server.registerTool(
    'build_divination_prompt',
    {
      description: '基于排盘结果生成结构化 AI 提示词，可直接用于请求 AI 解读',
      inputSchema: promptSchema.shape,
      outputSchema: promptOutputSchema,
    },
    async (args) => {
      try {
        const data = JSON.parse(args.data) as DivinationData;
        const supplementaryInfo = args.supplementaryInfo
          ? (JSON.parse(args.supplementaryInfo) as SupplementaryInfo)
          : undefined;
        const template: LiurenTemplateType = args.liurenTemplate || 'general';

        const prompt = buildDivinationPrompt(
          args.method as Exclude<DivinationMethodId, 'random'>,
          args.question,
          data,
          supplementaryInfo,
          template,
        );

        return createStructuredToolResult({ prompt });
      } catch (error) {
        return createErrorToolResult(getErrorMessage(error, '生成提示词失败'));
      }
    },
  );
}
