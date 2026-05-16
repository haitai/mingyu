# 命语公开 API

命语公开 API 运行在 `https://aov.cc/api/v1`，适合开发者、AI 代理、自动化工作流直接调用排盘、占卜和一站式提示词生成能力。

## 快速入口

- API 元数据：[https://aov.cc/api/v1/manifest](https://aov.cc/api/v1/manifest)
- OpenAPI：[https://aov.cc/api/v1/openapi.json](https://aov.cc/api/v1/openapi.json)
- Skill 文档：[https://aov.cc/skills/aov-mingyu-api/SKILL.md](https://aov.cc/skills/aov-mingyu-api/SKILL.md)

## 返回格式

成功响应：

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

## 接口列表

| 接口 | 说明 |
| --- | --- |
| `GET /health` | 健康检查 |
| `GET /manifest` | 获取 API 元数据 |
| `GET /openapi.json` | 获取 OpenAPI 文档 |
| `POST /bazi/calculate` | 八字排盘 |
| `POST /bazi/prompt` | 八字排盘并生成 AI 解读提示词 |
| `POST /ziwei/calculate` | 紫微斗数排盘 |
| `POST /ziwei/prompt` | 紫微斗数排盘并生成 AI 解读提示词 |
| `POST /divination/liuyao` | 六爻起卦 |
| `POST /divination/liuyao/prompt` | 六爻起卦并生成 AI 解读提示词 |
| `POST /divination/meihua` | 梅花易数起卦 |
| `POST /divination/meihua/prompt` | 梅花易数起卦并生成 AI 解读提示词 |
| `POST /divination/qimen` | 奇门遁甲排盘 |
| `POST /divination/qimen/prompt` | 奇门遁甲排盘并生成 AI 解读提示词 |
| `POST /divination/liuren` | 大六壬排盘 |
| `POST /divination/liuren/prompt` | 大六壬排盘并生成 AI 解读提示词 |
| `POST /divination/tarot` | 塔罗抽牌 |
| `POST /divination/tarot/prompt` | 塔罗抽牌并生成 AI 解读提示词 |
| `POST /divination/ssgw` | 三山国王灵签求签 |
| `POST /divination/ssgw/prompt` | 三山国王灵签求签并生成 AI 解读提示词 |

## 请求示例

`/calculate` 和 `/divination/{method}` 接口只返回排盘、卦盘、牌阵或灵签数据。需要可直接发送给 AI 的完整提示词时，使用对应的 `/prompt` 一站式接口，返回结构为 `data.result` 和 `data.prompt`。

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

更完整的字段结构以 [OpenAPI](https://aov.cc/api/v1/openapi.json) 为准。
