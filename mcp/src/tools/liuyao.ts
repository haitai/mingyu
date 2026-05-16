import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateLiuyao } from '../../../src/lib/divination/algorithms/liuyao.js';
import { resultOutputSchema } from '../schemas.js';
import { createErrorToolResult, createResultToolResult, getErrorMessage } from '../tool-results.js';

const liuyaoSchema = z.object({
  customDate: z.string().optional().describe('自定义起卦时间（ISO 8601 格式），不提供则使用当前时间'),
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
        return createResultToolResult(result);
      } catch (error) {
        return createErrorToolResult(getErrorMessage(error, '起卦失败'));
      }
    },
  );
}
