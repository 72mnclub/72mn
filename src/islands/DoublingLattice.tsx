import { useEffect, useMemo, useState } from 'react';

// 72mn = seven doublings to a million. $10K × 2⁷ ≈ $1.28M.
// A 16×8 = 128-cell grid that *is* the brand. Each step appends a
// rectangle equal in area to all that came before.

const ROWS = 8;
const COLS = 16;

function cellStep(r: number, c: number): number {
  if (r === 0 && c === 0) return 0;                  // 1×1
  if (r === 0 && c === 1) return 1;                  // → 1×2
  if (r === 1 && c <= 1) return 2;                   // → 2×2
  if (r <= 1 && c >= 2 && c <= 3) return 3;          // → 2×4
  if (r >= 2 && r <= 3 && c <= 3) return 4;          // → 4×4
  if (r <= 3 && c >= 4 && c <= 7) return 5;          // → 4×8
  if (r >= 4 && r <= 7 && c <= 7) return 6;          // → 8×8
  return 7;                                          // → 8×16 (full)
}

type Step = { label: string; sub: string; kind?: 'pixel' };

const DOUBLING_STEPS: Step[] = [
  { label: '$10K',   sub: 'start'    },
  { label: '$20K',   sub: 'double 1' },
  { label: '$40K',   sub: 'double 2' },
  { label: '$80K',   sub: 'double 3' },
  { label: '$160K',  sub: 'double 4' },
  { label: '$320K',  sub: 'double 5' },
  { label: '$640K',  sub: 'double 6' },
  { label: '$1.28M', sub: 'double 7' },
  { label: '72MN',   sub: 'the name', kind: 'pixel' },
  { label: '72',     sub: 'the mark', kind: 'pixel' },
];

const TEXT_PATTERNS: Record<number, string> = {
  8: [
    '................',
    '###.###.#.#.#..#',
    '..#...#.###.##.#',
    '.#...#..###.#.##',
    '.#..#...#.#.#.##',
    '.#..###.#.#.#..#',
    '................',
    '................',
  ].join(''),
  9: [
    '..#####.#####...',
    '......#.....#...',
    '.....#......#...',
    '....#....###....',
    '...#.....#......',
    '...#.....#......',
    '...#....#####...',
    '................',
  ].join(''),
};

export default function DoublingLattice() {
  const stepGrid = useMemo(() => {
    const arr: number[] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        arr.push(cellStep(r, c));
    return arr;
  }, []);

  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let id: ReturnType<typeof setTimeout> | undefined;
    let s = 0;
    const tick = () => {
      if (cancelled) return;
      setStep(s);
      const isPeak = s === 7;
      const isPixel = DOUBLING_STEPS[s].kind === 'pixel';
      const hold = isPeak ? 2000 : isPixel ? 2200 : 800;
      s = (s + 1) % DOUBLING_STEPS.length;
      id = setTimeout(tick, hold);
    };
    id = setTimeout(tick, 500);
    return () => {
      cancelled = true;
      if (id) clearTimeout(id);
    };
  }, []);

  const cur = DOUBLING_STEPS[step];
  const isPixel = cur.kind === 'pixel';
  const textPattern = isPixel ? TEXT_PATTERNS[step] : null;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
      role="img"
      aria-label="72mn — seven doublings turn $10K into $1.28 million"
    >
      <div
        className="mono"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 6,
          fontSize: 10,
          letterSpacing: '0.08em',
          color: 'var(--muted)',
          textTransform: 'uppercase',
        }}
      >
        {DOUBLING_STEPS.slice(0, 8).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-start',
              opacity: i <= step ? 1 : 0.35,
              transition: 'opacity .5s',
            }}
          >
            <span
              style={{
                color:
                  i === step
                    ? 'var(--accent)'
                    : i < step
                    ? 'var(--ink)'
                    : 'var(--muted)',
              }}
            >
              {i === 0 ? '×1' : `×${2 ** i}`}
            </span>
            <span
              style={{
                height: 2,
                width: '100%',
                background:
                  i <= step
                    ? i === step
                      ? 'var(--accent)'
                      : 'var(--ink)'
                    : 'var(--hair-2)',
                transition: 'background .5s',
              }}
            />
          </div>
        ))}
      </div>

      <div
        className="lattice doubling"
        style={{
          ['--lc' as string]: COLS,
          gap: 6,
          width: '100%',
          aspectRatio: `${COLS} / ${ROWS}`,
        }}
      >
        {stepGrid.map((cellS, i) => {
          let cls = '';
          if (isPixel && textPattern) {
            cls = textPattern[i] === '#' ? 'on' : '';
          } else {
            if (cellS < step) cls = 'on';
            else if (cellS === step) cls = 'now';
          }
          return <i key={i} className={cls} />;
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span
            key={'v-' + step}
            className="mono"
            data-counter
            aria-live="polite"
            style={{
              fontSize: isPixel ? 24 : 34,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
              animation: 'countPop .35s cubic-bezier(.2,.7,.3,1)',
            }}
          >
            {cur.label}
          </span>
          <span
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}
          >
            {step <= 7 ? `${cur.sub} of 7` : cur.sub}
          </span>
        </div>
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          72mn · seven · to · million
        </div>
      </div>
    </div>
  );
}
