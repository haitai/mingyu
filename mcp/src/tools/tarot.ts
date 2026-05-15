import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { drawSingleCard, drawSpreadCards, getCardKeywords } from '../../../src/utils/tarot.js';

const tarotSchema = z.object({
  spreadType: z
    .enum(['single', 'three', 'love', 'career', 'decision'])
    .optional()
    .describe('牌阵类型：single=单牌指引, three=时间流, love=爱情, career=事业, decision=选择'),
});

export function registerTarotTool(server: McpServer) {
  server.tool(
    'divine_tarot',
    '塔罗牌抽牌：从 78 张塔罗牌中洗牌抽牌，支持单牌指引和多种牌阵，含正逆位与关键词',
    tarotSchema.shape,
    async (args) => {
      try {
        const spreadType = args.spreadType || 'single';
        let result;
        if (spreadType === 'single') {
          const draw = drawSingleCard();
          result = {
            spreadType: 'single',
            spreadName: '单牌指引',
            cards: [
              {
                id: draw.card.number,
                name: draw.card.name,
                position: draw.position,
                reversed: draw.isReversed,
                keywords: getCardKeywords(draw.card.name).split(','),
              },
            ],
            timestamp: draw.timestamp,
          };
        } else {
          const draw = drawSpreadCards(spreadType);
          result = {
            spreadType: draw.spreadType,
            spreadName: draw.spreadName,
            cards: draw.cards.map((item) => ({
              id: item.card.number,
              name: item.card.name,
              position: item.position,
              reversed: item.isReversed,
              keywords: getCardKeywords(item.card.name).split(','),
            })),
            timestamp: draw.timestamp,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : '抽牌失败';
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}
