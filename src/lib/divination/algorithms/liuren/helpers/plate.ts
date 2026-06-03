import type { LiurenPlateItem } from '../../../../../types/divination';
import {
  BASIC_MAPPINGS,
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
} from '../../../../../utils/bazi/baziMappingsData';
import { BRANCH_WUXING, getBranchIndex, isKe, isSheng } from '../../_shared';

export const DIZHI = EARTHLY_BRANCHES;
export const TIANGAN = HEAVENLY_STEMS;
export const TIANJIANG = [
  '贵人',
  '螣蛇',
  '朱雀',
  '六合',
  '勾陈',
  '青龙',
  '天空',
  '白虎',
  '太常',
  '玄武',
  '太阴',
  '天后',
] as const;

export const GUIREN_BRANCH_BY_STEM: Record<string, { day: string; night: string }> = {
  甲: { day: '丑', night: '未' },
  戊: { day: '丑', night: '未' },
  庚: { day: '丑', night: '未' },
  乙: { day: '子', night: '申' },
  己: { day: '子', night: '申' },
  丙: { day: '亥', night: '酉' },
  丁: { day: '亥', night: '酉' },
  壬: { day: '巳', night: '卯' },
  癸: { day: '巳', night: '卯' },
  辛: { day: '午', night: '寅' },
};
const REVERSE_GENERAL_GROUND_BRANCHES = new Set(['巳', '午', '未', '申', '酉', '戌']);
export const DAY_STEM_RESIDENCE_MAP: Record<string, string> = {
  甲: '寅',
  乙: '辰',
  丙: '巳',
  丁: '未',
  戊: '巳',
  己: '未',
  庚: '申',
  辛: '戌',
  壬: '亥',
  癸: '丑',
};

export function describeRelation(sourceBranch: string, targetBranch: string) {
  const sourceElement = getGanZhiWuxing(sourceBranch);
  const targetElement = getGanZhiWuxing(targetBranch);

  if (!sourceElement || !targetElement) {
    return '关系待定';
  }
  if (sourceElement === targetElement) {
    return '比和';
  }
  if (isSheng(sourceElement, targetElement)) {
    return `${sourceElement}生${targetElement}`;
  }
  if (isSheng(targetElement, sourceElement)) {
    return `${targetElement}生${sourceElement}`;
  }
  if (isKe(sourceElement, targetElement)) {
    return `${sourceElement}克${targetElement}`;
  }
  if (isKe(targetElement, sourceElement)) {
    return `${targetElement}克${sourceElement}`;
  }

  return `${sourceElement}与${targetElement}杂见`;
}

export function getGanZhiWuxing(value: string) {
  const stemIndex = TIANGAN.indexOf(value as (typeof TIANGAN)[number]);
  if (stemIndex >= 0) {
    return BASIC_MAPPINGS.STEM_WUXING[stemIndex] || '';
  }

  return BRANCH_WUXING[value] || '';
}

export function isBranchKe(sourceBranch: string, targetBranch: string) {
  const sourceElement = getGanZhiWuxing(sourceBranch);
  const targetElement = getGanZhiWuxing(targetBranch);
  if (!sourceElement || !targetElement) {
    return false;
  }

  return isKe(sourceElement, targetElement);
}

export function isElementKe(sourceElement: string, targetElement: string) {
  if (!sourceElement || !targetElement) {
    return false;
  }

  return isKe(sourceElement, targetElement);
}

export function getNoblemanBranch(dayStem: string, dayNight: '昼占' | '夜占') {
  const pair = GUIREN_BRANCH_BY_STEM[dayStem];
  if (!pair) {
    return dayNight === '昼占' ? '丑' : '未';
  }

  return dayNight === '昼占' ? pair.day : pair.night;
}

export function getUpperByUnder(plate: LiurenPlateItem[], under: string) {
  return plate.find((item) => item.under === under)?.branch || under;
}

export function getUnderByUpper(plate: LiurenPlateItem[], upper: string) {
  return plate.find((item) => item.branch === upper)?.under || upper;
}

export function buildHeavenlyPlate(args: {
  monthLeader: string;
  divinationBranch: string;
  noblemanBranch: string;
  dayNight: '昼占' | '夜占';
}) {
  const monthLeaderIndex = getBranchIndex(args.monthLeader);
  const divinationBranchIndex = getBranchIndex(args.divinationBranch);
  const offset = (divinationBranchIndex - monthLeaderIndex + DIZHI.length) % DIZHI.length;
  const basePlate = DIZHI.map((under, underIndex) => ({
    branch: DIZHI[(underIndex - offset + DIZHI.length) % DIZHI.length],
    under,
    god: '',
  })) satisfies LiurenPlateItem[];

  const byUpperGod = new Map<string, string>();
  const noblemanGroundBranch = getUnderByUpper(basePlate, args.noblemanBranch);
  const isReverseGeneral = REVERSE_GENERAL_GROUND_BRANCHES.has(noblemanGroundBranch);
  const noblemanBranchIndex = getBranchIndex(args.noblemanBranch);

  for (let step = 0; step < DIZHI.length; step += 1) {
    const branchIndex = (noblemanBranchIndex + step + DIZHI.length) % DIZHI.length;
    const godIndex = isReverseGeneral ? (DIZHI.length - step) % DIZHI.length : step;
    byUpperGod.set(DIZHI[branchIndex], TIANJIANG[godIndex]);
  }

  return basePlate.map((item) => ({
    ...item,
    god: byUpperGod.get(item.branch) || '贵人',
  }));
}

export function getPlateItemByBranch(plate: LiurenPlateItem[], branch: string) {
  return plate.find((item) => item.branch === branch) || plate[0];
}

export function getDayStemResidence(dayStem: string, fallbackBranch: string) {
  return DAY_STEM_RESIDENCE_MAP[dayStem] || fallbackBranch;
}
