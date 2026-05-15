import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { baziCalculator } from '../../../src/utils/bazi/baziCalculator.js';
import type { Person } from '../../../src/utils/bazi/baziTypes.js';

const baziSchema = z.object({
  gender: z.enum(['male', 'female']).describe('性别：male 为男，female 为女'),
  year: z.number().int().min(1900).max(2100).describe('出生年'),
  month: z.number().int().min(1).max(12).describe('出生月'),
  day: z.number().int().min(1).max(31).describe('出生日'),
  timeIndex: z.number().int().min(0).max(12).describe('时辰索引：0=早子时,1=丑时,...,12=晚子时'),
  dateType: z.enum(['solar', 'lunar']).describe('日期类型：solar 为阳历，lunar 为农历'),
  isLeapMonth: z.boolean().optional().describe('是否为闰月（仅农历有效）'),
});

export function registerBaziTool(server: McpServer) {
  server.tool('bazi_calculate', '八字排盘：根据出生信息计算四柱八字、十神、藏干、大运、神煞等完整命盘数据', baziSchema.shape, async (args) => {
    const person: Person = {
      gender: args.gender,
      year: args.year,
      month: args.month,
      day: args.day,
      timeIndex: args.timeIndex,
      isLunar: args.dateType === 'lunar',
      isLeapMonth: args.isLeapMonth ?? false,
    };

    try {
      const result = baziCalculator.calculateBazi(person);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '排盘失败';
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  });
}
