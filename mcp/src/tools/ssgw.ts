import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { drawRandomSign } from '../../../src/lib/divination/algorithms/ssgw.js';
import { resultOutputSchema } from '../schemas.js';
import { createErrorToolResult, createResultToolResult, getErrorMessage } from '../tool-results.js';

export function registerSsgwTool(server: McpServer) {
  server.registerTool(
    'divine_ssgw',
    {
      description: '三山国王灵签求签：模拟真实求签过程，从 100 签中随机抽取，含签题、签诗、典故故事及详细解签',
      inputSchema: {},
      outputSchema: resultOutputSchema,
    },
    async () => {
      try {
        const result = drawRandomSign();
        return createResultToolResult(result);
      } catch (error) {
        return createErrorToolResult(getErrorMessage(error, '求签失败'));
      }
    },
  );
}
