import { baziCalculator } from '../../utils/bazi/baziCalculator';
import type { Person } from '../../utils/bazi/baziTypes';
import {
  buildZiweiChartInput,
  calculateFullZiweiChart,
} from '../full-chart-engine/ziwei';
import { generateLiuyao } from '../divination/algorithms/liuyao';
import { generateMeihua } from '../divination/algorithms/meihua';
import { generateQimen } from '../divination/algorithms/qimen';
import { generateLiuren } from '../divination/algorithms/liuren';
import { drawRandomSign } from '../divination/algorithms/ssgw';
import { buildDivinationPrompt } from '../divination/engine';
import type {
  DivinationData,
  LiurenTemplateType,
  MeihuaSettings,
  SupplementaryInfo,
} from '../../types/divination';
import { drawSingleCard, drawSpreadCards, getCardKeywords } from '../../utils/tarot';

const API_VERSION = 'v1';
const SERVICE_NAME = 'aov.cc';
const BASE_URL = 'https://aov.cc';

type ApiMeta = {
  service: typeof SERVICE_NAME;
  version: typeof API_VERSION;
};

type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta: ApiMeta;
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  meta: ApiMeta;
};

type JsonRecord = Record<string, unknown>;

type RouteContext = {
  request: Request;
  segments: string[];
};

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json; charset=utf-8',
};

const ENDPOINTS = [
  'GET /api/v1/health',
  'GET /api/v1/manifest',
  'GET /api/v1/openapi.json',
  'POST /api/v1/bazi/calculate',
  'POST /api/v1/ziwei/calculate',
  'POST /api/v1/divination/liuyao',
  'POST /api/v1/divination/meihua',
  'POST /api/v1/divination/qimen',
  'POST /api/v1/divination/liuren',
  'POST /api/v1/divination/tarot',
  'POST /api/v1/divination/ssgw',
  'POST /api/v1/divination/prompt',
] as const;

export function getPublicApiManifest() {
  return {
    name: 'AOV 命理与占卜公开 API',
    service: SERVICE_NAME,
    version: API_VERSION,
    baseUrl: `${BASE_URL}/api/${API_VERSION}`,
    openapiUrl: `${BASE_URL}/api/${API_VERSION}/openapi.json`,
    skillUrl: `${BASE_URL}/skills/aov-mingyu-api/SKILL.md`,
    endpoints: [...ENDPOINTS],
  };
}

export function getPublicApiOpenApiDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'AOV 命理与占卜公开 API',
      version: API_VERSION,
      description: '提供八字、紫微斗数、六爻、梅花易数、奇门遁甲、大六壬、塔罗、三山国王灵签和提示词生成能力。',
    },
    servers: [{ url: `${BASE_URL}/api/${API_VERSION}` }],
    paths: {
      '/health': {
        get: {
          summary: '健康检查',
          responses: { '200': { description: '服务可用' } },
        },
      },
      '/manifest': {
        get: {
          summary: '获取 API 元数据',
          responses: { '200': { description: 'API 元数据' } },
        },
      },
      '/openapi.json': {
        get: {
          summary: '获取 OpenAPI 文档',
          responses: { '200': { description: 'OpenAPI JSON' } },
        },
      },
      '/bazi/calculate': {
        post: {
          summary: '八字排盘',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BaziRequest' } } } },
          responses: { '200': { description: '八字命盘数据' } },
        },
      },
      '/ziwei/calculate': {
        post: {
          summary: '紫微斗数排盘',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ZiweiRequest' } } } },
          responses: { '200': { description: '紫微命盘数据' } },
        },
      },
      '/divination/liuyao': { post: { summary: '六爻起卦', responses: { '200': { description: '六爻卦盘' } } } },
      '/divination/meihua': { post: { summary: '梅花易数起卦', responses: { '200': { description: '梅花易数卦盘' } } } },
      '/divination/qimen': { post: { summary: '奇门遁甲排盘', responses: { '200': { description: '奇门盘' } } } },
      '/divination/liuren': { post: { summary: '大六壬排盘', responses: { '200': { description: '大六壬课盘' } } } },
      '/divination/tarot': { post: { summary: '塔罗抽牌', responses: { '200': { description: '塔罗牌阵' } } } },
      '/divination/ssgw': { post: { summary: '三山国王灵签求签', responses: { '200': { description: '灵签结果' } } } },
      '/divination/prompt': {
        post: {
          summary: '基于排盘结果生成 AI 解读提示词',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PromptRequest' } } } },
          responses: { '200': { description: '结构化提示词' } },
        },
      },
    },
    components: {
      schemas: {
        BaziRequest: {
          type: 'object',
          required: ['gender', 'year', 'month', 'day', 'timeIndex', 'dateType'],
          properties: {
            gender: { enum: ['male', 'female'] },
            year: { type: 'integer', minimum: 1900, maximum: 2100 },
            month: { type: 'integer', minimum: 1, maximum: 12 },
            day: { type: 'integer', minimum: 1, maximum: 31 },
            timeIndex: { type: 'integer', minimum: 0, maximum: 12 },
            dateType: { enum: ['solar', 'lunar'] },
            isLeapMonth: { type: 'boolean' },
          },
        },
        ZiweiRequest: {
          type: 'object',
          required: ['gender', 'dateType', 'year', 'month', 'day', 'timeIndex'],
          properties: {
            name: { type: 'string' },
            gender: { enum: ['male', 'female'] },
            dateType: { enum: ['solar', 'lunar'] },
            year: { type: 'string' },
            month: { type: 'string' },
            day: { type: 'string' },
            timeIndex: { type: 'integer', minimum: 0, maximum: 12 },
            isLeapMonth: { type: 'boolean' },
          },
        },
        PromptRequest: {
          type: 'object',
          required: ['method', 'question', 'data'],
          properties: {
            method: { enum: ['liuyao', 'meihua', 'qimen', 'liuren', 'tarot', 'ssgw'] },
            question: { type: 'string' },
            data: { type: 'object' },
            supplementaryInfo: { type: 'object' },
            liurenTemplate: { enum: ['general', 'ganqing', 'shiye', 'caifu'] },
          },
        },
      },
    },
  };
}

export function normalizeApiPath(pathname: string) {
  return pathname
    .replace(/^\/api\/v1\/?/, '')
    .split('/')
    .filter(Boolean);
}

export async function handlePublicApiRequest(request: Request, segments?: string[]) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const routeSegments = segments ?? normalizeApiPath(new URL(request.url).pathname);

  try {
    const data = await route({ request, segments: routeSegments });
    return json(success(data));
  } catch (error) {
    return handleError(error);
  }
}

async function route(context: RouteContext) {
  const path = context.segments.join('/');

  if (context.request.method === 'GET') {
    if (path === 'health' || path === '') {
      return {
        status: 'ok',
        service: SERVICE_NAME,
        version: API_VERSION,
        timestamp: new Date().toISOString(),
      };
    }
    if (path === 'manifest') {
      return getPublicApiManifest();
    }
    if (path === 'openapi.json') {
      return getPublicApiOpenApiDocument();
    }
  }

  if (context.request.method !== 'POST') {
    throw new ApiError(405, 'METHOD_NOT_ALLOWED', '当前接口只支持 GET、POST 或 OPTIONS。');
  }

  switch (path) {
    case 'bazi/calculate':
      return calculateBazi(await readJson(context.request));
    case 'ziwei/calculate':
      return calculateZiwei(await readJson(context.request));
    case 'divination/liuyao':
      return generateLiuyao(readCustomDate(await readJson(context.request, true)));
    case 'divination/meihua':
      return calculateMeihua(await readJson(context.request, true));
    case 'divination/qimen':
      return generateQimen(readCustomDate(await readJson(context.request, true)));
    case 'divination/liuren':
      return calculateLiuren(await readJson(context.request, true));
    case 'divination/tarot':
      return calculateTarot(await readJson(context.request, true));
    case 'divination/ssgw':
      return drawRandomSign();
    case 'divination/prompt':
      return buildPrompt(await readJson(context.request));
    default:
      throw new ApiError(404, 'NOT_FOUND', '没有找到对应的 API 路径。');
  }
}

function calculateBazi(input: JsonRecord) {
  const gender = readEnum(input, 'gender', ['male', 'female']);
  const person: Person = {
    gender,
    year: readInteger(input, 'year', 1900, 2100),
    month: readInteger(input, 'month', 1, 12),
    day: readInteger(input, 'day', 1, 31),
    timeIndex: readInteger(input, 'timeIndex', 0, 12),
    isLunar: readEnum(input, 'dateType', ['solar', 'lunar']) === 'lunar',
    isLeapMonth: readBoolean(input, 'isLeapMonth', false),
  };

  return baziCalculator.calculateBazi(person);
}

async function calculateZiwei(input: JsonRecord) {
  const result = await calculateFullZiweiChart(
    buildZiweiChartInput({
      name: readString(input, 'name', ''),
      gender: readEnum(input, 'gender', ['male', 'female']),
      dateType: readEnum(input, 'dateType', ['solar', 'lunar']),
      year: readRequiredString(input, 'year'),
      month: readRequiredString(input, 'month'),
      day: readRequiredString(input, 'day'),
      timeIndex: readInteger(input, 'timeIndex', 0, 12),
      isLeapMonth: readBoolean(input, 'isLeapMonth', false),
      useTrueSolarTime: false,
    }),
  );

  return {
    basicInfo: result.payloadByScope.origin.basic_info,
    scopeNames: Object.keys(result.payloadByScope),
    payloadByScope: result.payloadByScope,
  };
}

function calculateMeihua(input: JsonRecord) {
  const method = readEnum(input, 'method', ['time', 'number', 'random', 'external'], 'time');
  const settings: MeihuaSettings = {
    method,
    ...(method === 'number' ? { number: readInteger(input, 'number', 1) } : {}),
    ...(method === 'external' && isRecord(input.externalOmens)
      ? { externalOmens: input.externalOmens as MeihuaSettings['externalOmens'] }
      : {}),
  };

  return generateMeihua(readCustomDate(input), settings);
}

function calculateLiuren(input: JsonRecord) {
  const template = readEnum(input, 'template', ['general', 'ganqing', 'shiye', 'caifu'], 'general');
  return {
    ...generateLiuren(readCustomDate(input)),
    template,
  };
}

function calculateTarot(input: JsonRecord) {
  const spreadType = readEnum(input, 'spreadType', ['single', 'three', 'love', 'career', 'decision'], 'single');
  if (spreadType === 'single') {
    const result = drawSingleCard();
    return {
      spreadType: 'single',
      spreadName: '单牌指引',
      cards: [
        {
          id: result.card.number,
          name: result.card.name,
          position: result.position,
          reversed: result.isReversed,
          keywords: getCardKeywords(result.card.name).split(','),
        },
      ],
      timestamp: result.timestamp,
    };
  }

  const result = drawSpreadCards(spreadType);
  return {
    spreadType: result.spreadType,
    spreadName: result.spreadName,
    cards: result.cards.map((item) => ({
      id: item.card.number,
      name: item.card.name,
      position: item.position,
      reversed: item.isReversed,
      keywords: getCardKeywords(item.card.name).split(','),
    })),
    timestamp: result.timestamp,
  };
}

function buildPrompt(input: JsonRecord) {
  const method = readEnum(input, 'method', ['liuyao', 'meihua', 'qimen', 'liuren', 'tarot', 'ssgw']);
  const data = readRecord(input, 'data') as unknown as DivinationData;
  const supplementaryInfo = isRecord(input.supplementaryInfo)
    ? (input.supplementaryInfo as SupplementaryInfo)
    : undefined;
  const liurenTemplate = readEnum(
    input,
    'liurenTemplate',
    ['general', 'ganqing', 'shiye', 'caifu'],
    'general',
  ) as LiurenTemplateType;

  return {
    prompt: buildDivinationPrompt(
      method,
      readRequiredString(input, 'question'),
      data,
      supplementaryInfo,
      liurenTemplate,
    ),
  };
}

async function readJson(request: Request, optional = false): Promise<JsonRecord> {
  if (optional && !request.headers.get('content-type') && request.body === null) {
    return {};
  }

  try {
    const value = await request.json();
    if (!isRecord(value)) {
      throw new ApiError(400, 'BAD_REQUEST', '请求体必须是 JSON 对象。');
    }
    return value;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (optional) {
      return {};
    }
    throw new ApiError(400, 'BAD_REQUEST', '请求体必须是合法 JSON。');
  }
}

function readCustomDate(input: JsonRecord) {
  const value = input.customDate;
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'BAD_REQUEST', 'customDate 必须是 ISO 8601 时间字符串。');
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, 'BAD_REQUEST', 'customDate 不是有效时间。');
  }
  return date;
}

function readInteger(input: JsonRecord, key: string, min?: number, max?: number): number {
  const value = input[key];
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ApiError(400, 'BAD_REQUEST', `${key} 必须是整数。`);
  }
  if (min !== undefined && value < min) {
    throw new ApiError(400, 'BAD_REQUEST', `${key} 不能小于 ${min}。`);
  }
  if (max !== undefined && value > max) {
    throw new ApiError(400, 'BAD_REQUEST', `${key} 不能大于 ${max}。`);
  }
  return value;
}

function readBoolean(input: JsonRecord, key: string, fallback: boolean) {
  const value = input[key];
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== 'boolean') {
    throw new ApiError(400, 'BAD_REQUEST', `${key} 必须是布尔值。`);
  }
  return value;
}

function readString(input: JsonRecord, key: string, fallback: string) {
  const value = input[key];
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'BAD_REQUEST', `${key} 必须是字符串。`);
  }
  return value;
}

function readRequiredString(input: JsonRecord, key: string) {
  const value = readString(input, key, '');
  if (!value.trim()) {
    throw new ApiError(400, 'BAD_REQUEST', `${key} 不能为空。`);
  }
  return value;
}

function readRecord(input: JsonRecord, key: string) {
  const value = input[key];
  if (!isRecord(value)) {
    throw new ApiError(400, 'BAD_REQUEST', `${key} 必须是对象。`);
  }
  return value;
}

function readEnum<const T extends readonly string[]>(
  input: JsonRecord,
  key: string,
  values: T,
  fallback?: T[number],
): T[number] {
  const value = input[key];
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }
  if (typeof value === 'string' && values.includes(value)) {
    return value;
  }
  throw new ApiError(400, 'BAD_REQUEST', `${key} 必须是以下值之一：${values.join('、')}。`);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function success<T>(data: T): ApiSuccess<T> {
  return {
    ok: true,
    data,
    meta: {
      service: SERVICE_NAME,
      version: API_VERSION,
    },
  };
}

function failure(code: string, message: string): ApiFailure {
  return {
    ok: false,
    error: { code, message },
    meta: {
      service: SERVICE_NAME,
      version: API_VERSION,
    },
  };
}

function json(body: ApiSuccess<unknown> | ApiFailure, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return json(failure(error.code, error.message), error.status);
  }

  const message = error instanceof Error ? error.message : '服务内部错误。';
  return json(failure('INTERNAL_ERROR', message), 500);
}
