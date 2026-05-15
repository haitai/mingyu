import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  buildZiweiChartInput,
  calculateFullZiweiChart,
} from '../../../src/lib/full-chart-engine/ziwei.js';

const ziweiSchema = z.object({
  name: z.string().optional().describe('姓名（可选）'),
  gender: z.enum(['male', 'female']).describe('性别：male 为男，female 为女'),
  dateType: z.enum(['solar', 'lunar']).describe('日期类型：solar 为阳历，lunar 为农历'),
  year: z.string().describe('出生年，如 1990'),
  month: z.string().describe('出生月，如 5'),
  day: z.string().describe('出生日，如 15'),
  timeIndex: z.number().int().min(0).max(12).describe('时辰索引：0=早子时,1=丑时,...,12=晚子时'),
  isLeapMonth: z.boolean().optional().describe('是否为闰月（仅农历有效）'),
});

export function registerZiweiTool(server: McpServer) {
  server.tool(
    'ziwei_calculate',
    '紫微斗数排盘：根据出生信息计算完整紫微命盘，包含星曜、宫位、大限、流年等数据',
    ziweiSchema.shape,
    async (args) => {
      try {
        const input = buildZiweiChartInput({
          name: args.name || '',
          gender: args.gender,
          dateType: args.dateType,
          year: args.year,
          month: args.month,
          day: args.day,
          timeIndex: args.timeIndex,
          isLeapMonth: args.isLeapMonth ?? false,
          useTrueSolarTime: false,
        });

        const result = await calculateFullZiweiChart(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  astrolabe: result.astrolabe,
                  horoscope: result.horoscope,
                  payloadByScope: result.payloadByScope,
                },
                null,
                2,
              ),
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
    },
  );
}
