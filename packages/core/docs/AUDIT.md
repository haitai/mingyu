# 算法审查记录

本文档记录 `mingyu-core` 发布前的算法审查过程，包含发现的问题与修正说明。

## 审查范围

发布前对所有算法模块进行逐文件地毯式审查，对照传统古籍核对算法正确性：

- 八字（约 192 个文件）
- 六爻、梅花易数、小六壬、奇门遁甲、大六壬
- 紫微斗数、西洋占星
- 择日、雷诺曼、灵签
- 共享五行数据层、历法工具

## 已修正的问题

### 1. 天干相冲缺戊己（数据 Bug）

**文件**：`baziMappingsData.ts`

**问题**：`TIAN_GAN_CHONG` 只列了甲庚/乙辛/丙壬/丁癸四对，缺少戊己相冲。

**修正**：补全为 10 条，含 `戊: '己', 己: '戊'`。注：戊己冲部分流派不列入天干冲，本库纳入以便齐全。

### 2. 金匮归类错误

**文件**：`baziShenShaData.ts`

**问题**：金匮归为凶神，但传统择日体系中金匮为吉星（与天德同列）。

**修正**：改为中性。

### 3. 命卦公式错误（严重）

**文件**：`bazi/mingGua.ts`（从 vibebazi 整合）

**问题**：初版用自造的 `(year-2000)*5 % 8` 公式，与传统命卦完全无关，结果错误。

**修正**：重写为正确传统公式：
- 以立春换年
- 男命：`(11 - 年%9)` 归一到 1-9
- 女命：`(4 + 年%9)` 归一到 1-9
- 逢五黄入中：男寄坤二，女寄艮八
- 完整九星表（1坎/2坤/3震/4巽/6乾/7兑/8艮/9离）
- 东四命：坎离震巽；西四命：乾坤艮兑

**依据**：《八宅明镜》

### 4. 小运算法错误（严重）

**文件**：`bazi/luckDetails.ts`（从 vibebazi 整合）

**问题**：初版用自造的手动干支推算公式，非传统童限机制。

**修正**：忠实移植 vibebazi 的 tyme4ts 实现：
- 使用 `ChildLimit.fromSolarTime()` 获取童限
- `getStartFortune()` 获取起运前 Fortune
- 逐年 `fortune.next(age - startAge)` 推算
- 起运年龄取 `getStartDecadeFortune().getStartAge()`

**依据**：《渊海子平》"论行运"、《子平真诠》"论行运岁运"

### 5. 十神评分口径错误

**文件**：`bazi/tenGodAnalysis.ts`

**问题**：初版用透干 +2、藏干 +1，状态阈值 visible≥2→偏重，与 vibebazi 不一致。

**修正**：对齐 vibebazi 口径：
- 透干每见 +1
- 藏干本气 +0.8、中气 +0.5、余气 +0.3
- 状态：score≥2 或 totalCount≥3 → 偏重；visibleCount>0 或 score≥1 → 有力；否则潜藏
- 家族状态：score≥3 或 totalCount≥5 → 偏重；score≥1.6 → 有力；否则偏弱

### 6. 透干根气评分错误

**文件**：`bazi/stemRootAnalysis.ts`

**问题**：初版评分口径与 vibebazi 不一致。

**修正**：对齐 vibebazi 口径：
- 藏干本气 1.2、中气 0.8、余气 0.5
- 本根权重 1.0，同气根权重 0.6
- 状态：有同干藏干 → 有本根；有同五行不同干藏干 → 有同气根；否则无根

### 7. 重复数据统一（约 40 处）

**问题**：五行地支关系数据在多个文件重复定义，存在不同步风险。

**修正**：统一到 `_shared/wuxing.ts` 作为唯一数据源：
- `liuyao.ts` 移除本地 BRANCH_WUXING/LIU_CHONG/BRANCH_ORDER
- `liuren/helpers/lessons.ts` 移除本地 LIUCHONG_MAP/SANXING_MAP/STEM_HE_MAP/POST_HORSE_MAP
- `liuren/index.ts` 驿马/桃花改用共享函数
- `qimen/_constants.ts` isGenerating/isControlling 委托共享 isSheng/isKe
- `almanac.ts` / `engine/formatters.ts` 移除本地 getOppositeBranch
- `divination-data.ts` 移除硬编码 jiazi，改引用 SIXTY_CYCLE

## 验证

| 验证项 | 结果 |
|--------|------|
| core 包编译 | ✅ 0 错误，274 个 JS 文件 |
| 原项目测试 | ✅ 692/692 通过 |
| 抽取模块冒烟测试 | ✅ 10/10 通过（命卦/纳音/空亡/大运方向均验证正确） |

冒烟测试用例：
- 1990 男命卦 = 1坎水东四命 ✓
- 2000 男命卦 = 9离 ✓
- 1990 女命卦逢5寄艮 = 8艮 ✓
- 甲子日旬空 = 戌亥 ✓
- 阳男(甲)顺行、阳女(甲)逆行 ✓
- 纳音甲子=海中金、丙寅=炉中火 ✓

## 审查说明

命理术数存在流派差异，本库按主流公认理法实现。各模块源码中标注了对应的古籍依据，遇到流派分歧时选择主流方案并加注释说明。

本库的算法正确性审查**不保证绝对无误**，欢迎在 GitHub Issues 提交问题反馈。
