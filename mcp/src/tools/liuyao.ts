import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateLiuyao } from '../../../src/lib/divination/algorithms/liuyao.js';
import { promptOutputSchema, resultOutputSchema } from '../schemas.js';
import { createErrorToolResult, createStructuredToolResult, getErrorMessage } from '../tool-results.js';
import { buildDivinationPromptText } from './prompt-helpers.js';

const liuyaoSchema = z.object({
  customDate: z.string().optional().describe('自定义起卦时间（ISO 8601 格式），不提供则使用当前时间'),
});

const liuyaoPromptSchema = liuyaoSchema.extend({
  question: z.string().describe('用户希望围绕卦盘解读的问题'),
});

export function registerLiuyaoTool(server: McpServer) {
  server.registerTool(
    'divine_liuyao',
    {
      description: '六爻起卦：基于当前时间生成六爻卦象，包含纳甲、六亲、六神、世应、动变、空亡等完整信息',
      inputSchema: liuyaoSchema.shape,
      outputSchema: resultOutputSchema,
    },
    async (args) => {
      try {
        const customDate = args.customDate ? new Date(args.customDate) : undefined;
        const result = generateLiuyao(customDate);
        return createStructuredToolResult({ result });
      } catch (error) {
        return createErrorToolResult(getErrorMessage(error, '起卦失败'));
      }
    },
  );

  server.registerTool(
    'liuyao_prompt',
    {
      description: '六爻起卦并生成结构化 AI 解读提示词：一次调用返回卦盘数据和可直接复制给 AI 的提示词',
      inputSchema: liuyaoPromptSchema.shape,
      outputSchema: promptOutputSchema,
    },
    async (args) => {
      try {
        const customDate = args.customDate ? new Date(args.customDate) : undefined;
        const result = generateLiuyao(customDate);
        return createStructuredToolResult({
          result,
          prompt: buildDivinationPromptText({ method: 'liuyao', question: args.question, data: result }),
        });
      } catch (error) {
        return createErrorToolResult(getErrorMessage(error, '生成六爻提示词失败'));
      }
    },
  );
}
