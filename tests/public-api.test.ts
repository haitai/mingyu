import test from 'node:test';
import assert from 'node:assert/strict';
import { handlePublicApiRequest } from '../src/lib/public-api/handler';

async function callApi(path: string, init?: RequestInit) {
  const request = new Request(`https://aov.cc/api/v1/${path}`, init);
  const response = await handlePublicApiRequest(request);
  const text = await response.text();
  return {
    response,
    body: text ? JSON.parse(text) : null,
  };
}

const divinationPromptCases: Array<[string, Record<string, unknown>]> = [
  ['liuyao', { customDate: '2025-01-01T08:00:00+08:00' }],
  ['meihua', { method: 'number', number: 42 }],
  ['qimen', { customDate: '2025-01-01T08:00:00+08:00' }],
  ['liuren', { customDate: '2025-01-01T08:00:00+08:00', template: 'shiye' }],
  ['tarot', { spreadType: 'single' }],
  ['ssgw', {}],
];

test('公开 API 健康检查应返回统一成功结构', async () => {
  const { response, body } = await callApi('health');

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal(body.ok, true);
  assert.equal(body.data.status, 'ok');
  assert.equal(body.meta.service, 'aov.cc');
});

test('公开 API OPTIONS 应返回 CORS 预检响应', async () => {
  const { response, body } = await callApi('bazi/calculate', { method: 'OPTIONS' });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'GET,POST,OPTIONS');
  assert.equal(body, null);
});

test('公开 API manifest 应暴露 OpenAPI 和 skill 地址', async () => {
  const { body } = await callApi('manifest');

  assert.equal(body.ok, true);
  assert.equal(body.data.openapiUrl, 'https://aov.cc/api/v1/openapi.json');
  assert.equal(body.data.skillUrl, 'https://aov.cc/skills/aov-mingyu-api/SKILL.md');
  assert.ok(body.data.endpoints.includes('POST /api/v1/bazi/calculate'));
});

test('公开 API 应支持八字排盘', async () => {
  const { response, body } = await callApi('bazi/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gender: 'male',
      year: 1990,
      month: 5,
      day: 15,
      timeIndex: 1,
      dateType: 'solar',
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.pillars.day.ganZhi.length, 2);
  assert.equal(body.data.gender, 'male');
});

test('公开 API 八字排盘接口只返回排盘结果', async () => {
  const { response, body } = await callApi('bazi/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gender: 'female',
      year: 1987,
      month: 7,
      day: 5,
      timeIndex: 6,
      dateType: 'solar',
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.gender, 'female');
  assert.equal('prompt' in body.data, false);
  assert.equal('result' in body.data, false);
});

test('公开 API 八字提示词接口应一次返回排盘和提示词', async () => {
  const { response, body } = await callApi('bazi/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gender: 'male',
      year: 1990,
      month: 5,
      day: 15,
      timeIndex: 1,
      dateType: 'solar',
      question: '我适合创业还是上班？',
      promptTopic: 'career',
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.result.gender, 'male');
  assert.match(body.data.prompt, /【排盘信息】/);
  assert.match(body.data.prompt, /我适合创业还是上班/);
});

test('公开 API 紫微提示词接口应一次返回排盘和提示词', async () => {
  const { response, body } = await callApi('ziwei/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '测试',
      gender: 'female',
      dateType: 'solar',
      year: '1992',
      month: '8',
      day: '21',
      timeIndex: 4,
      question: '我的感情关系要注意什么？',
      promptTopic: 'relationship',
      promptScope: 'origin',
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.result.scopeNames.includes('origin'), true);
  assert.match(body.data.prompt, /【问题】/);
  assert.match(body.data.prompt, /我的感情关系要注意什么/);
});

test('公开 API 不再保留旧的占卜提示词接口', async () => {
  const { response, body } = await callApi('divination/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'tarot', question: '我近期事业应该注意什么？', data: {} }),
  });

  assert.equal(response.status, 404);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'NOT_FOUND');
});

test('公开 API 单牌塔罗接口应返回结构化牌面', async () => {
  const { response, body } = await callApi('divination/tarot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spreadType: 'single' }),
  });

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.spreadType, 'single');
  assert.equal(body.data.cards.length, 1);
  assert.equal(typeof body.data.cards[0].name, 'string');
});

test('公开 API 各占卜提示词接口应一次返回占卜结果和提示词', async () => {
  for (const [method, payload] of divinationPromptCases) {
    const { response, body } = await callApi(`divination/${method}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        question: '我近期事业应该注意什么？',
      }),
    });

    assert.equal(response.status, 200, `${method} prompt 接口应返回 200`);
    assert.equal(body.ok, true, `${method} prompt 接口应成功`);
    assert.ok(body.data.result, `${method} prompt 接口应返回 result`);
    assert.match(body.data.prompt, /【占卜信息】/, `${method} prompt 应包含占卜信息`);
    assert.match(body.data.prompt, /我近期事业应该注意什么/, `${method} prompt 应包含问题`);
  }
});

test('公开 API 参数错误应返回统一错误结构', async () => {
  const { response, body } = await callApi('bazi/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gender: 'male' }),
  });

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'BAD_REQUEST');
  assert.match(body.error.message, /year/);
});
