import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateLiuren } from '../../../src/lib/divination/algorithms/liuren/index.js';
import type { LiurenTemplateType } from '../../../src/types/divination.js';
import { resultOutputSchema } from '../schemas.js';
import { createErrorToolResult, createResultToolResult, getErrorMessage } from '../tool-results.js';

const liurenSchema = z.object({
  customDate: z.string().optional().describe('自定义排盘时间（ISO 8601 格式），不提供则使用当前时间'),
  template: z
    .enum(['general', 'ganqing', 'shiye', 'caifu'])
    .optional()
    .describe('断课模板：general=通用, ganqing=感情, shiye=事业, caifu=财富'),
});

export function registerLiurenTool(server: McpServer) {
  server.registerTool(
    'divine_liuren',
    {
      description: '大六壬排盘：生成完整的天盘、四课、三传、月将、贵人、旬空等信息，含格局标签与断课模板',
      inputSchema: liurenSchema.shape,
      outputSchema: resultOutputSchema,
    },
    async (args) => {
      try {
        const customDate = args.customDate ? new Date(args.customDate) : undefined;
        const result = generateLiuren(customDate);
        const template: LiurenTemplateType = args.template || 'general';
        return createResultToolResult({ ...result, template });
      } catch (error) {
        return createErrorToolResult(getErrorMessage(error, '排盘失败'));
      }
    },
  );
}
