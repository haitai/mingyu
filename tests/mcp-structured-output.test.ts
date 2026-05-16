import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const toolCalls: Array<[string, Record<string, unknown>]> = [
  ['divine_liuyao', {}],
  ['divine_meihua', { method: 'number', number: 42 }],
  ['divine_qimen', {}],
  ['divine_liuren', {}],
  ['divine_tarot', { spreadType: 'single' }],
  ['divine_ssgw', {}],
  [
    'bazi_calculate',
    { gender: 'male', year: 1990, month: 5, day: 15, timeIndex: 1, dateType: 'solar' },
  ],
  [
    'ziwei_calculate',
    { gender: 'male', dateType: 'solar', year: '1990', month: '5', day: '15', timeIndex: 1 },
  ],
];

async function withMcpClient<T>(callback: (client: Client) => Promise<T>) {
  const client = new Client({ name: 'mcp-structured-output-test', version: '0.0.1' });
  const transport = new StdioClientTransport({
    command: 'npm',
    args: ['run', 'mcp'],
    cwd: process.cwd(),
    stderr: 'pipe',
  });

  await client.connect(transport);

  try {
    return await callback(client);
  } finally {
    await client.close();
  }
}

test('MCP 工具列表应声明输出结构', async () => {
  await withMcpClient(async (client) => {
    const { tools } = await client.listTools();

    assert.equal(tools.length, 9);
    tools.forEach((tool) => {
      assert.equal(tool.outputSchema?.type, 'object', `${tool.name} 缺少 outputSchema`);
    });

    const promptTool = tools.find((tool) => tool.name === 'build_divination_prompt');
    assert.ok(promptTool?.outputSchema?.properties?.prompt);

    const ziweiTool = tools.find((tool) => tool.name === 'ziwei_calculate');
    assert.ok(ziweiTool?.outputSchema?.properties?.payloadByScope);
  });
});

test('MCP 工具调用应同时返回 structuredContent 和文本 JSON', async () => {
  await withMcpClient(async (client) => {
    for (const [name, args] of toolCalls) {
      const result = await client.callTool({ name, arguments: args });
      assert.equal(result.isError, undefined, `${name} 不应返回错误`);
      assert.ok(result.structuredContent, `${name} 缺少 structuredContent`);
      assert.equal(result.content[0]?.type, 'text', `${name} 缺少文本兼容输出`);

      const text = result.content[0]?.type === 'text' ? result.content[0].text : '';
      assert.deepEqual(JSON.parse(text), result.structuredContent);
    }
  });
});
