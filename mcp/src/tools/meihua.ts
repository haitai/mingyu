import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { generateMeihua } from '../../../src/lib/divination/algorithms/meihua/index.js';
import type { MeihuaSettings } from '../../../src/types/divination.js';

const meihuaSchema = z.object({
  method: z
    .enum(['time', 'number', 'random', 'external'])
    .optional()
    .describe('起卦方式：time=时间起卦, number=数字起卦, random=随机起卦, external=外应起卦'),
  number: z.number().int().positive().optional().describe('数字起卦时使用的正整数'),
  customDate: z.string().optional().describe('自定义起卦时间（ISO 8601 格式），不提供则使用当前时间'),
});

export function registerMeihuaTool(server: McpServer) {
  server.tool(
    'divine_meihua',
    '梅花易数起卦：支持时间起卦、数字起卦、随机起卦，生成主卦、互卦、变卦及体用生克分析',
    meihuaSchema.shape,
    async (args) => {
      try {
        const customDate = args.customDate ? new Date(args.customDate) : undefined;
        const settings: MeihuaSettings = {
          method: args.method || 'time',
          ...(args.number ? { number: args.number } : {}),
        };
        const result = generateMeihua(customDate, settings);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : '起卦失败';
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
