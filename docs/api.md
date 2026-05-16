# 命语公开 API

命语公开 API 运行在 `https://aov.cc/api/v1`，适合开发者、AI 代理、自动化工作流直接调用排盘、占卜和提示词生成能力。

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
| `POST /ziwei/calculate` | 紫微斗数排盘 |
| `POST /divination/liuyao` | 六爻起卦 |
| `POST /divination/meihua` | 梅花易数起卦 |
| `POST /divination/qimen` | 奇门遁甲排盘 |
| `POST /divination/liuren` | 大六壬排盘 |
| `POST /divination/tarot` | 塔罗抽牌 |
| `POST /divination/ssgw` | 三山国王灵签求签 |
| `POST /divination/prompt` | 基于排盘结果生成 AI 解读提示词 |

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

塔罗抽牌：

```bash
curl -X POST https://aov.cc/api/v1/divination/tarot \
  -H "Content-Type: application/json" \
  -d '{"spreadType":"single"}'
```

基于排盘结果生成提示词：

```bash
curl -X POST https://aov.cc/api/v1/divination/prompt \
  -H "Content-Type: application/json" \
  -d '{"method":"tarot","question":"我近期事业应该注意什么？","data":{}}'
```

## 参数约定

- `gender` 使用 `male` 或 `female`。
- `dateType` 使用 `solar` 或 `lunar`。
- `timeIndex` 范围为 `0` 到 `12`，其中 `0` 为早子时，`12` 为晚子时。
- `customDate` 使用 ISO 8601 时间字符串。
- 梅花易数 `method` 支持 `time`、`number`、`random`、`external`。
- 塔罗 `spreadType` 支持 `single`、`three`、`love`、`career`、`decision`。
- 大六壬 `template` 和提示词 `liurenTemplate` 支持 `general`、`ganqing`、`shiye`、`caifu`。

更完整的字段结构以 [OpenAPI](https://aov.cc/api/v1/openapi.json) 为准。
