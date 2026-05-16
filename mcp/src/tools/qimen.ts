import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateQimen } from '../../../src/lib/divination/algorithms/qimen/index.js';
import { resultOutputSchema } from '../schemas.js';
import { createErrorToolResult, createResultToolResult, getErrorMessage } from '../tool-results.js';

const qimenSchema = z.object({
  customDate: z.string().optional().describe('自定义排盘时间（ISO 8601 格式），不提供则使用当前时间'),
});

export function registerQimenTool(server: McpServer) {
  server.registerTool(
    'divine_qimen',
    {
      description:
        '奇门遁甲排盘：基于转盘奇门法生成时家奇门盘，包含天地人神四盘、九宫格、值符值使、格局标签与宫位洞察',
      inputSchema: qimenSchema.shape,
      outputSchema: resultOutputSchema,
    },
    async (args) => {
      try {
        const customDate = args.customDate ? new Date(args.customDate) : undefined;
        const result = generateQimen(customDate);
        return createResultToolResult(result);
      } catch (error) {
        return createErrorToolResult(getErrorMessage(error, '排盘失败'));
      }
    },
  );
}
