import type { DivinationDraft } from '@/lib/divination/engine';
import type { DivinationSession } from '@/lib/divination/engine';
import type { DivinationSummaryBlocks } from '@/lib/divination/summary';
import type {
  AstrolabeData,
  LiurenData,
  LiurenLesson,
  LiurenPlateItem,
  LiurenTransmission,
  XiaoliurenData,
  XiaoliurenPalaceDetail,
} from '@/types/divination';
import { AstrolabeChart } from '@/components/AstrolabeChart';

interface DivinationResultProps {
  isSubmitting: boolean;
  session: DivinationSession | null;
  summary: DivinationSummaryBlocks | null;
  methodLabelMap: Record<DivinationDraft['method'], string>;
  copyState: string;
  shareState: string;
  showShareButton: boolean;
  onCopy: () => void;
  onShare: () => void;
}

const LIUREN_BRANCH_POSITIONS: Record<string, { row: number; column: number }> = {
  子: { row: 1, column: 3 },
  丑: { row: 1, column: 4 },
  寅: { row: 2, column: 5 },
  卯: { row: 3, column: 5 },
  辰: { row: 4, column: 5 },
  巳: { row: 5, column: 4 },
  午: { row: 5, column: 3 },
  未: { row: 5, column: 2 },
  申: { row: 4, column: 1 },
  酉: { row: 3, column: 1 },
  戌: { row: 2, column: 1 },
  亥: { row: 1, column: 2 },
};

const LIUREN_BRANCH_ORDER = Object.keys(LIUREN_BRANCH_POSITIONS);

function findLiurenTransmissionStage(
  transmissions: LiurenTransmission[],
  branch: string,
): LiurenTransmission['stage'] | null {
  return transmissions.find((item) => item.branch === branch)?.stage || null;
}

function getLiurenPlateTags(data: LiurenData, item: LiurenPlateItem) {
  return [
    item.under === data.divinationBranch ? '占时' : '',
    item.branch === data.monthLeader ? '月将' : '',
    item.under === data.noblemanBranch ? '贵人落地' : '',
    data.xunKong?.includes(item.under) ? '旬空' : '',
    findLiurenTransmissionStage(data.threeTransmissions, item.branch) || '',
  ].filter(Boolean);
}

function XiaoliurenStageCard(props: { label: string; detail: XiaoliurenPalaceDetail }) {
  const { label, detail } = props;

  return (
    <article className="xiaoliuren-stage-card">
      <div className="xiaoliuren-stage-head">
        <span>{label}</span>
        <strong>{detail.name}</strong>
      </div>
      <p>{detail.meaning}</p>
      <div className="xiaoliuren-keyword-row">
        {detail.keywords.map((keyword) => (
          <span className="result-soft-tag" key={`${detail.name}-${keyword}`}>
            {keyword}
          </span>
        ))}
      </div>
      <small>建议：{detail.advice}</small>
    </article>
  );
}

function XiaoliurenBoard({ data }: { data: XiaoliurenData }) {
  return (
    <div className="divination-extra-panel xiaoliuren-board">
      <div className="divination-extra-head">
        <strong>小六壬三段推演</strong>
        <span>
          {data.methodLabel} · {data.hourLabel}
        </span>
      </div>

      <div className="xiaoliuren-card-grid">
        <XiaoliurenStageCard label="起因" detail={data.sequence.start} />
        <XiaoliurenStageCard label="过程" detail={data.sequence.process} />
        <XiaoliurenStageCard label="结果" detail={data.sequence.result} />
      </div>

      <div className="xiaoliuren-overview-grid">
        <div className="xiaoliuren-overview-item">
          <span>主判断</span>
          <strong>{data.primary.name}</strong>
          <p>{data.primary.tendency}</p>
        </div>
        <div className="xiaoliuren-overview-item">
          <span>问事提醒</span>
          <strong>{data.questionHint}</strong>
          <p>适合把这个判断继续交给 AI 展开细拆。</p>
        </div>
      </div>
    </div>
  );
}

function LiurenPlateCell({ data, item }: { data: LiurenData; item: LiurenPlateItem }) {
  const position = LIUREN_BRANCH_POSITIONS[item.under];
  const tags = getLiurenPlateTags(data, item);
  const className = [
    'liuren-plate-cell',
    tags.includes('占时') ? 'is-hour' : '',
    tags.includes('月将') ? 'is-month-leader' : '',
    tags.includes('贵人落地') ? 'is-nobleman' : '',
    tags.includes('旬空') ? 'is-empty' : '',
    tags.some((tag) => tag.endsWith('传')) ? 'is-transmission' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={className}
      style={position ? { gridColumn: position.column, gridRow: position.row } : undefined}
    >
      <div className="liuren-plate-branch-row">
        <span>地盘</span>
        <strong>{item.under}</strong>
      </div>
      <div className="liuren-plate-upper">
        <span>天盘</span>
        <strong>{item.branch}</strong>
      </div>
      <div className="liuren-plate-god">{item.god}</div>
      {tags.length ? (
        <div className="liuren-plate-tags">
          {tags.map((tag) => (
            <span key={`${item.under}-${tag}`}>{tag}</span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function LiurenPlateGrid({ data }: { data: LiurenData }) {
  const plateMap = new Map(data.heavenlyPlate.map((item) => [item.under, item]));
  const orderedPlate = LIUREN_BRANCH_ORDER.map((branch) => plateMap.get(branch)).filter(
    (item): item is LiurenPlateItem => Boolean(item),
  );

  return (
    <div className="liuren-plate-grid">
      {orderedPlate.map((item) => (
        <LiurenPlateCell data={data} item={item} key={item.under} />
      ))}
      <div className="liuren-plate-center">
        <span>天地盘</span>
        <strong>
          月将{data.monthLeader}加{data.divinationBranch}
        </strong>
        <p>
          {data.dayNight || '时段未知'} ·{' '}
          {data.xunKong?.length ? `旬空${data.xunKong.join('、')}` : '旬空未知'}
        </p>
      </div>
    </div>
  );
}

function LiurenLessonCard({ lesson }: { lesson: LiurenLesson }) {
  return (
    <article className="liuren-lesson-card">
      <div className="liuren-card-kicker">{lesson.name}</div>
      <div className="liuren-lesson-stack">
        <div>
          <span>上神</span>
          <strong>{lesson.upper}</strong>
        </div>
        <div>
          <span>下位</span>
          <strong>{lesson.lower}</strong>
        </div>
      </div>
      <div className="liuren-card-meta">
        <span>{lesson.god}</span>
        <span>{lesson.relation}</span>
      </div>
      <p>{lesson.note}</p>
    </article>
  );
}

function LiurenTransmissionCard({ transmission }: { transmission: LiurenTransmission }) {
  return (
    <article className="liuren-transmission-card">
      <div className="liuren-card-kicker">{transmission.stage}</div>
      <strong className="liuren-transmission-branch">{transmission.branch}</strong>
      <div className="liuren-card-meta">
        <span>{transmission.god}</span>
        <span>{transmission.relation}</span>
      </div>
      <p>{transmission.note}</p>
    </article>
  );
}

function LiurenBoard({ data }: { data: LiurenData }) {
  return (
    <div className="divination-extra-panel liuren-board">
      <div className="divination-extra-head">
        <strong>大六壬盘面</strong>
        <span>
          {data.ganzhi.day}日 · {data.ganzhi.hour}时
        </span>
      </div>

      <LiurenPlateGrid data={data} />

      <div className="liuren-section-head">
        <strong>四课</strong>
        <span>
          {data.dayStemResidence
            ? `${data.ganzhi.day.charAt(0)}寄${data.dayStemResidence}`
            : '日干寄宫未标注'}
        </span>
      </div>
      <div className="liuren-lessons-grid">
        {data.fourLessons.map((lesson) => (
          <LiurenLessonCard lesson={lesson} key={lesson.name} />
        ))}
      </div>

      <div className="liuren-section-head">
        <strong>三传</strong>
        <span>
          {data.transmissionRule || '取传法未标注'}
          {data.transmissionPattern ? ` · ${data.transmissionPattern}` : ''}
        </span>
      </div>
      <div className="liuren-transmission-chain">
        {data.threeTransmissions.map((transmission) => (
          <LiurenTransmissionCard transmission={transmission} key={transmission.stage} />
        ))}
      </div>
    </div>
  );
}

export function DivinationResult({
  isSubmitting,
  session,
  summary,
  methodLabelMap,
  copyState,
  shareState,
  showShareButton,
  onCopy,
  onShare,
}: DivinationResultProps) {
  if (isSubmitting) {
    return (
      <div className="workspace-grid divination-output-grid" aria-hidden="true">
        <section className="panel divination-result-panel">
          <div className="divination-result-skeleton">
            <span className="skeleton-block divination-result-skeleton-title" />
            <div className="divination-result-skeleton-tags">
              {Array.from({ length: 4 }, (_, index) => (
                <span
                  className="skeleton-block divination-result-skeleton-tag"
                  key={`tag-${index}`}
                />
              ))}
            </div>
            <div className="divination-result-skeleton-list">
              {Array.from({ length: 4 }, (_, index) => (
                <span
                  className="skeleton-block divination-result-skeleton-line"
                  key={`line-a-${index}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="panel divination-result-panel">
          <div className="divination-result-skeleton">
            <span className="skeleton-block divination-result-skeleton-title" />
            <div className="divination-result-skeleton-list">
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  className="skeleton-block divination-result-skeleton-line"
                  key={`line-b-${index}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!session || !summary) {
    return null;
  }

  const isLiurenResult = session.method === 'liuren';

  return (
    <div className="workspace-grid divination-output-grid">
      <section className="panel divination-result-panel">
        {!isLiurenResult ? (
          <div className="panel-head">
            <div>
              <h2>{summary.title}</h2>
              <p>这部分是本地算法生成的结构化结果，方便你判断本次提示词是否符合预期。</p>
            </div>
          </div>
        ) : null}

        {session.requestedMethod === 'random' ? (
          <div className="divination-random-note">本次随机到：{methodLabelMap[session.method]}</div>
        ) : null}

        {!isLiurenResult ? (
          <>
            <div className="divination-tag-cloud">
              {summary.tags.map((item) => (
                <span className="result-soft-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <div className="divination-summary-list">
              {summary.lines.filter(Boolean).map((item) => (
                <div className="divination-summary-item" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {session.method === 'astrolabe' ? (
          <AstrolabeChart data={session.data as AstrolabeData} />
        ) : null}

        {session.method === 'xiaoliuren' ? (
          <XiaoliurenBoard data={session.data as XiaoliurenData} />
        ) : null}

        {session.method === 'liuren' ? <LiurenBoard data={session.data as LiurenData} /> : null}
      </section>

      <section className="panel panel-output divination-result-panel">
        <div className="panel-head divination-prompt-head">
          <div>
            <h2>占卜提示词</h2>
            <p>系统要求、结构化结果和你的问题都已经合并，复制整段即可使用。</p>
          </div>
          <div className="action-row compact-actions divination-prompt-actions">
            <button className="copy-button secondary-button" type="button" onClick={onCopy}>
              {copyState}
            </button>
            {showShareButton ? (
              <button className="copy-button" type="button" onClick={onShare}>
                {shareState}
              </button>
            ) : null}
          </div>
        </div>
        <div className="prompt-send-tip">点击复制后，发送到你常用的在线 AI 软件继续提问。</div>

        <pre className="result-pre">{session.prompt}</pre>
      </section>
    </div>
  );
}
