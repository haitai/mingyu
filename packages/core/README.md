# mingyu-core

Mingyu (命理) core algorithms - a comprehensive TypeScript package for traditional Chinese metaphysics and divination.

**⚠️ Important Disclaimer:** This library provides algorithmic implementations only. All results are for **reference and entertainment purposes only**. Nothing in this package should be construed as professional advice, fortune-telling, or predictions of any kind. The authors assume no responsibility for decisions made based on the output of these algorithms.

## Installation

```bash
npm install mingyu-core
```

## Features

| Module | Description | Status |
|--------|-------------|--------|
| **Bazi (八字)** | Four Pillars of Destiny - birth chart calculation, Shensha (神煞), strength analysis, pattern recognition, useful god determination | ✅ |
| **Qimen Dunjia (奇门遁甲)** | Mysterious Gate - rotating plate method, 81 patterns, direction advice, yingqi timing | ✅ |
| **Liuyao (六爻)** | Six Lines - Jingfang eight-palace method, Najia (纳甲), Shiying (世应), Six Animals | ✅ |
| **Meihua Yishu (梅花易数)** | Plum Blossom Divination - 5 divination methods, Ti-Yong analysis, mutual/derived hexagrams | ✅ |
| **Da Liuren (大六壬)** | Great Six Ren - moon leader, nobleman, four lessons, three transmissions, nine categories | ✅ |
| **Xiao Liuren (小六壬)** | Small Six Ren - time/number/random divination, six palaces | ✅ |
| **Almanac (择日)** | Day selection - auspicious/inauspicious days, Xuan Kong Fei Xing, Peng Zu prohibitions | ✅ |
| **SSGW (灵签)** | Deity oracle - random sign drawing | ✅ |
| **Lenormand (雷诺曼)** | Lenormand cards - 8 spread types, card combinations | ✅ |
| **Western Astrology (星盘)** | Natal chart, Placidus houses, aspects, transits | ✅ |
| **Ziwei Doushu (紫微斗数)** | Purple Star - analysis payload, pattern detection, evidence pool | ✅ |
| **Calendar (历法)** | Lunar calendar, ganzhi (干支), solar terms, void branches | ✅ |

## Usage

```typescript
// Bazi calculation
import { baziCalculator } from 'mingyu-core/bazi';

const result = baziCalculator.calculateBazi({
  year: 1990,
  month: 1,
  day: 1,
  timeIndex: 5,
  gender: 'male',
});

// Qimen Dunjia
import { generateQimen } from 'mingyu-core/divination/qimen';
const qimenData = generateQimen(new Date('2025-01-01T10:00:00'));

// Liuyao
import { generateLiuyao } from 'mingyu-core/divination/liuyao';
const liuyaoData = generateLiuyao();

// Liuren
import { generateLiuren } from 'mingyu-core/divination/liuren';
const liurenData = generateLiuren();

// Calendar utilities
import { getDivinationTime, getVoidBranches } from 'mingyu-core/calendar';

// Types
import type { BaziChartResult, QimenData, LiurenData } from 'mingyu-core/types';
```

## Development

```bash
git clone https://github.com/Brhiza/mingyu
cd mingyu/packages/core
npm install
npm run build
```

## License

MIT

## References

This package implements algorithms based on classical Chinese texts including:
- 《渊海子平》(Yuanhai Ziping) - Bazi system
- 《三命通会》(Sanming Tonghui) - Bazi/Shensha 
- 《穷通宝鉴》(Qiong Tong Bao Jian) - Climate rules
- 《卜筮正宗》(Bu Shi Zheng Zong) - Liuyao
- 《增删卜易》(Zeng Shan Bu Yi) - Liuyao
- 《梅花易数》(Meihua Yishu) - Plum Blossom
- 《烟波钓叟歌》(Yan Bo Diao Sou Ge) - Qimen Dunjia
- 《遁甲演义》(Dunjia Yanyi) - Qimen Dunjia
- 《大六壬大全》(Da Liuren Daquan) - Liuren
- 《大六壬指南》(Da Liuren Zhinan) - Liuren
- 《协纪辨方书》(Xieji Bianfang Shu) - Almanac
- 《紫微斗数全书》(Ziwei Doushu Quanshu) - Ziwei
