import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { drawRandomSign } from '../../../src/lib/divination/algorithms/ssgw.js';

export function registerSsgwTool(server: McpServer) {
  server.tool(
    'divine_ssgw',
    '三山国王灵签求签：模拟真实求签过程，从 100 签中随机抽取，含签题、签诗、典故故事及详细解签',
    {},
    async () => {
      try {
        const result = drawRandomSign();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : '求签失败';
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
