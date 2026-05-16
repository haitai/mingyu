import { z } from 'zod';

export const resultOutputSchema = {
  result: z.unknown().describe('工具返回的结构化结果'),
};

export const promptOutputSchema = {
  result: z.unknown().describe('工具返回的结构化结果'),
  prompt: z.string().describe('可直接用于 AI 解读的结构化提示词'),
};

export const ziweiOutputSchema = {
  basicInfo: z.record(z.string(), z.unknown()).describe('紫微命盘基础信息'),
  scopeNames: z.array(z.string()).describe('本次返回包含的运限范围'),
  payloadByScope: z.record(z.string(), z.unknown()).describe('按运限范围组织的紫微分析载荷'),
};
