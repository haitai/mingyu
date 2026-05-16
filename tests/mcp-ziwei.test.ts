import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildZiweiChartInput,
  calculateFullZiweiChart,
} from '../src/lib/full-chart-engine/ziwei';
import { buildSerializableZiweiResult } from '../mcp/src/tools/ziwei';

test('紫微 MCP 返回结果应为可 JSON 序列化的纯数据', async () => {
  const input = buildZiweiChartInput({
    name: '',
    gender: 'male',
    dateType: 'solar',
    year: '1990',
    month: '5',
    day: '15',
    timeIndex: 1,
    isLeapMonth: false,
    useTrueSolarTime: false,
  });

  const runtime = await calculateFullZiweiChart(input);
  const result = buildSerializableZiweiResult(runtime);
  const parsed = JSON.parse(JSON.stringify(result));

  assert.equal(parsed.basicInfo.gender, '男');
  assert.deepEqual(parsed.scopeNames, [
    'origin',
    'decadal',
    'yearly',
    'monthly',
    'daily',
    'hourly',
    'age',
  ]);
  assert.equal(parsed.payloadByScope.origin.payload_version, 'analysis_payload_v1');
  assert.equal(parsed.payloadByScope.origin.language, 'zh-CN');
  assert.equal(parsed.astrolabe, undefined);
  assert.equal(parsed.horoscope, undefined);
});
