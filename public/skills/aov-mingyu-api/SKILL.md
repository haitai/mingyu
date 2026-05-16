---
name: aov-mingyu-api
description: 通过 aov.cc 公开 API 调用命理、占卜和一站式提示词能力。用于需要八字排盘、紫微斗数排盘、六爻、梅花易数、奇门遁甲、大六壬、塔罗、三山国王灵签，或直接返回可交给 AI 解读的完整提示词的任务。
---

# AOV 命理与占卜 API

使用 `https://aov.cc/api/v1` 作为基础地址。所有接口返回统一 JSON：

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "service": "aov.cc",
    "version": "v1"
  }
}
```

错误响应：

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "错误说明"
  },
  "meta": {
    "service": "aov.cc",
    "version": "v1"
  }
}
```

## 工作流

1. 先读取 `GET /manifest` 或 `GET /openapi.json` 确认接口能力。
2. 只需要结构化数据时，调用 `/calculate` 或 `/divination/{method}` 排盘接口。
3. 需要 AI 解读提示词时，优先调用对应 `/prompt` 一站式接口，直接读取 `data.result` 和 `data.prompt`。
4. 向用户展示结果时，说明这是排盘和提示词数据，不替代医疗、法律、投资等专业建议。

## 常用接口

- `GET /health`：健康检查。
- `GET /manifest`：API 元数据、OpenAPI 地址和 skill 地址。
- `GET /openapi.json`：完整 OpenAPI JSON。
- `POST /bazi/calculate`：八字排盘。
- `POST /bazi/prompt`：八字排盘并生成结构化 AI 解读提示词。
- `POST /ziwei/calculate`：紫微斗数排盘。
- `POST /ziwei/prompt`：紫微斗数排盘并生成结构化 AI 解读提示词。
- `POST /divination/liuyao`：六爻起卦。
- `POST /divination/liuyao/prompt`：六爻起卦并生成结构化 AI 解读提示词。
- `POST /divination/meihua`：梅花易数起卦。
- `POST /divination/meihua/prompt`：梅花易数起卦并生成结构化 AI 解读提示词。
- `POST /divination/qimen`：奇门遁甲排盘。
- `POST /divination/qimen/prompt`：奇门遁甲排盘并生成结构化 AI 解读提示词。
- `POST /divination/liuren`：大六壬排盘。
- `POST /divination/liuren/prompt`：大六壬排盘并生成结构化 AI 解读提示词。
- `POST /divination/tarot`：塔罗抽牌。
- `POST /divination/tarot/prompt`：塔罗抽牌并生成结构化 AI 解读提示词。
- `POST /divination/ssgw`：三山国王灵签求签。
- `POST /divination/ssgw/prompt`：三山国王灵签求签并生成结构化 AI 解读提示词。

## 请求示例

八字排盘：

```bash
curl -X POST https://aov.cc/api/v1/bazi/calculate \
  -H "Content-Type: application/json" \
  -d '{"gender":"male","year":1990,"month":5,"day":15,"timeIndex":1,"dateType":"solar"}'
```

紫微斗数排盘：

```bash
curl -X POST https://aov.cc/api/v1/ziwei/calculate \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","gender":"female","dateType":"solar","year":"1992","month":"8","day":"21","timeIndex":4}'
```

八字排盘并生成提示词：

```bash
curl -X POST https://aov.cc/api/v1/bazi/prompt \
  -H "Content-Type: application/json" \
  -d '{"gender":"male","year":1990,"month":5,"day":15,"timeIndex":1,"dateType":"solar","question":"我适合创业还是上班？","promptTopic":"career"}'
```

紫微斗数排盘并生成提示词：

```bash
curl -X POST https://aov.cc/api/v1/ziwei/prompt \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","gender":"female","dateType":"solar","year":"1992","month":"8","day":"21","timeIndex":4,"question":"我的感情关系要注意什么？","promptTopic":"relationship","promptScope":"origin"}'
```

塔罗抽牌：

```bash
curl -X POST https://aov.cc/api/v1/divination/tarot \
  -H "Content-Type: application/json" \
  -d '{"spreadType":"single"}'
```

塔罗抽牌并生成提示词：

```bash
curl -X POST https://aov.cc/api/v1/divination/tarot/prompt \
  -H "Content-Type: application/json" \
  -d '{"spreadType":"single","question":"我近期事业应该注意什么？"}'
```

## 参数约定

- `gender` 使用 `male` 或 `female`。
- `dateType` 使用 `solar` 或 `lunar`。
- `timeIndex` 范围为 `0` 到 `12`，其中 `0` 为早子时，`12` 为晚子时。
- `question` 是所有 `/prompt` 接口的必填字段。
- 八字 `promptTopic` 支持 `general`、`career`、`wealth`、`marriage`、`children`、`health`。
- 紫微 `promptTopic` 支持 `destiny`、`relationship`、`career-wealth`、`life`、`chat`。
- 紫微 `promptScope` 支持 `origin`、`decadal`、`yearly`、`monthly`、`daily`、`hourly`、`age`。
- `customDate` 使用 ISO 8601 时间字符串。
- 梅花易数 `method` 支持 `time`、`number`、`random`、`external`。
- 塔罗 `spreadType` 支持 `single`、`three`、`love`、`career`、`decision`。
- 大六壬 `template` 支持 `general`、`ganqing`、`shiye`、`caifu`。
