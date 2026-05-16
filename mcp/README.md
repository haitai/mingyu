# 命语 MCP Server

让 AI 直接调用命语的排盘引擎，无需手动复制粘贴提示词。

## 支持的 Tool

| Tool 名称 | 功能 | 说明 |
|-----------|------|------|
| `bazi_calculate` | 八字排盘 | 输入出生信息，返回四柱、十神、藏干、大运、神煞、旺衰分析 |
| `ziwei_calculate` | 紫微斗数排盘 | 输入出生信息，返回星盘、宫位、大限、流年数据 |
| `divine_liuyao` | 六爻起卦 | 基于当前时间生成完整六爻卦象 |
| `divine_meihua` | 梅花易数起卦 | 支持时间/数字/随机/外应四种起卦方式 |
| `divine_qimen` | 奇门遁甲排盘 | 时家奇门转盘法，含天地人神四盘与格局 |
| `divine_liuren` | 大六壬排盘 | 天盘、四课、三传、月将、贵人、旬空 |
| `divine_tarot` | 塔罗抽牌 | 78 张塔罗，支持单牌/时间流/爱情/事业/选择牌阵 |
| `divine_ssgw` | 灵签求签 | 三山国王 100 签，含签诗与解签 |
| `build_divination_prompt` | 生成提示词 | 基于排盘结果生成结构化 AI 提示词 |

## 快速开始

### 1. 安装项目

```bash
git clone https://github.com/Brhiza/mingyu.git
cd mingyu
npm install
```

### 2. 本地启动测试

```bash
npm run mcp
```

### 3. 在 Claude Desktop 中配置

打开 Claude Desktop 设置 -> Developer -> Edit Config，编辑 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "mingyu": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "C:\\Users\\Administrator\\Documents\\GitHub\\mingyu"
    }
  }
}
```

> 请将 `cwd` 替换为你本地项目的实际路径。

### 4. 重启 Claude Desktop

配置完成后重启 Claude Desktop，在对话中即可看到命语的工具图标。你可以直接让 Claude 调用排盘工具。

## 使用示例

在 Claude Desktop 中直接说：

- "帮我排一下 1990 年 5 月 15 日丑时出生的八字"
- "用六爻起一卦，问今年事业运势如何"
- "抽一张塔罗牌，看看我近期的感情走向"
- "用奇门遁甲排个盘，问这次投资能不能成"

Claude 会自动调用对应的 tool 获取排盘数据，然后基于数据进行解读。

## 在其他 MCP 客户端中使用

任何支持 MCP 协议的客户端都可以使用，如 Cursor、Cline、Windsurf 等。

配置方式类似：指定启动命令为 `npm run mcp`，工作目录为项目根目录即可。

## 工作原理

MCP Server 通过 stdio transport 与 AI 客户端通信：

1. AI 客户端启动 `npm run mcp`
2. MCP Server 注册所有排盘 tool
3. AI 根据对话内容决定调用哪个 tool
4. MCP Server 执行排盘引擎，返回结构化 JSON 数据
5. AI 基于排盘数据直接进行解读

无需网络端口、无需额外配置，开箱即用。
