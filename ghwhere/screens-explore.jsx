// screens.jsx — Tab screens for 강화 가이드북

const TYPE_FILTERS = ['전체', '카페', '식사', '체험', '명소'];
const AREA_FILTERS = ['전체', '강화읍', '온수리', '그 외'];
const TIME_FILTERS = ['오늘', '내일', '주말', '커스텀'];

// ════════════════════════════════════════════════════════════
// ExploreScreen — 탐색
// ════════════════════════════════════════════════════════════
function ExploreScreen({ layout, onOpenPlace, wished, toggleWish }) {
  const [time, setTime] = React.useState('오늘');
  const [customDate, setCustomDate] = React.useState('2025-12-05');
  const [customTime, setCustomTime] = React.useState('15:00');
  const [type, setType] = React.useState('전체');
  const [area, setArea] = React.useState('전체');
  const [openOnly, setOpenOnly] = React.useState(true);
  const [viewMode, setViewMode] = React.useState(layout === 'map' ? null : (layout || 'cards'));
  React.useEffect(() => {
    if (layout === 'map') setViewMode(null);
    else if (layout && layout !== viewMode) setViewMode(layout);
  }, [layout]);
  const activeLayout = layout === 'map' ? 'map' : viewMode;

  // Resolve target day from time selector.
  // Demo 기준 현재시각: window.NOW (토 14:30). 골라진 날짜 기준으로 is_open을 계산.
  const targetCtx = React.useMemo(() => {
    if (time === '내일') {
      const dayMap = { '월':'화','화':'수','수':'목','목':'금','금':'토','토':'일','일':'월' };
      return { day: dayMap[window.NOW.day], hour: 14, minute: 0, label: '내일' };
    }
    if (time === '주말') {
      // 다음 토요일
      return { day: '토', hour: 14, minute: 0, label: '이번 주말' };
    }
    if (time === '커스텀') {
      const d = new Date(customDate + 'T' + customTime);
      const days = ['일','월','화','수','목','금','토'];
      const [hh, mm] = customTime.split(':').map(Number);
      return { day: days[d.getDay()] || '토', hour: hh, minute: mm, label: `${customDate.slice(5)} ${customTime}` };
    }
    return { ...window.NOW };
  }, [time, customDate, customTime]);

  // Combine places + programs into a unified list of "events"
  const items = React.useMemo(() => {
    let result = [...window.PLACES];
    const programsAsPlaces = window.PROGRAMS.map(p => ({
      ...p, isProgram: true,
      tags: p.tags, name: p.title, area: p.area, type: p.type,
      hours: null, note: p.when,
    }));
    result = [...result, ...programsAsPlaces];
    if (type !== '전체') result = result.filter(x => x.type === type);
    if (area !== '전체') result = result.filter(x => x.area === area);
    if (openOnly) {
      result = result.filter(x => {
        if (x.isProgram) {
          return x.day === targetCtx.day && x.start <= targetCtx.hour + 4 && x.end >= targetCtx.hour;
        }
        const s = window.getOpenStatus(x, targetCtx);
        return s.state === 'open' || s.state === 'closing' || s.state === 'soon';
      });
    }
    return result;
  }, [time, type, area, openOnly, targetCtx]);

  const openCount = items.filter(x => !x.isProgram && window.getOpenStatus(x, targetCtx).state === 'open').length;

  return (
    <div style={{ padding: '14px 16px 24px' }}>
      {/* hero status — compact, reflects target time */}
      <div style={{
        background: 'var(--text)', color: '#fff', borderRadius: 10,
        padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase' }}>WHEN</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{targetCtx.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: '#A8D89A', lineHeight: 1 }}>{openCount}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>곳 열림</span>
        </div>
      </div>

      {/* condition bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden', marginBottom: 12,
      }}>
        <FilterRow label="언제" options={TIME_FILTERS} value={time} onChange={setTime} />
        {time === '커스텀' && (
          <div style={{
            padding: '8px 12px 10px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', width: 32, flexShrink: 0 }}> </span>
            <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
              style={dateInputStyle} />
            <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)}
              style={dateInputStyle} />
          </div>
        )}
        <FilterRow label="무엇" options={TYPE_FILTERS} value={type} onChange={setType} />
        <FilterRow label="어디" options={AREA_FILTERS} value={area} onChange={setArea} last />
      </div>

      {/* open-only toggle */}
      <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: openOnly ? 'var(--green-light)' : 'var(--surface)',
        border: `1px solid ${openOnly ? 'var(--green)' : 'var(--border)'}`,
        borderRadius: 10, padding: '10px 12px', marginBottom: 14, cursor: 'pointer',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            {time === '오늘' ? '즉시 방문 가능' : '그 시간 영업하는 곳'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            라스트오더 · 재료소진 · 임시휴무 반영
          </div>
        </div>
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: openOnly ? 'var(--green)' : 'var(--border)',
          position: 'relative', transition: 'all .15s',
        }}>
          <div style={{
            position: 'absolute', top: 2, left: openOnly ? 18 : 2,
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            transition: 'all .15s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
          }} />
        </div>
        <input type="checkbox" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} style={{ display: 'none' }} />
      </label>

      {/* layout-specific body */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, margin: '4px 0 12px' }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
          fontSize: 22, lineHeight: 1.1, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap',
        }}>
          {activeLayout === 'timeline' ? '오늘의 타임라인' : activeLayout === 'map' ? '오늘의 지도' : '오늘의 목록'}
        </h2>
        {activeLayout !== 'map' && (
          <ViewModeSwitch value={viewMode} onChange={setViewMode} />
        )}
        {activeLayout === 'map' && (
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>총 {items.length}곳</span>
        )}
      </div>

      {activeLayout === 'cards' && <CardsLayout items={items} onOpenPlace={onOpenPlace} wished={wished} toggleWish={toggleWish} ctx={targetCtx} />}
      {activeLayout === 'timeline' && <TimelineLayout items={items} onOpenPlace={onOpenPlace} ctx={targetCtx} />}
      {activeLayout === 'map' && <MapLayout items={items} onOpenPlace={onOpenPlace} />}
    </div>
  );
}

function FilterRow({ label, options, value, onChange, last }) {
  return (
    <div style={{
      padding: '10px 12px',
      borderBottom: last ? 'none' : '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
        letterSpacing: '.08em', textTransform: 'uppercase',
        width: 32, flexShrink: 0,
      }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, flex: 1 }}>
        {options.map(o => (
          <PillChip key={o} active={value === o} onClick={() => onChange(o)}>{o}</PillChip>
        ))}
      </div>
    </div>
  );
}

// In-page segmented switch to flip between cards & timeline view.
function ViewModeSwitch({ value, onChange }) {
  const opts = [
    { id: 'cards', label: '카드' },
    { id: 'timeline', label: '타임라인' },
  ];
  return (
    <div style={{
      display: 'inline-flex', gap: 2, background: 'var(--surface2)',
      padding: 2, borderRadius: 999, border: '1px solid var(--border)',
    }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: '5px 11px', fontSize: 11, fontWeight: 700,
          border: 'none', borderRadius: 999,
          background: value === o.id ? 'var(--text)' : 'transparent',
          color: value === o.id ? '#fff' : 'var(--text-muted)',
          cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          transition: 'all .12s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

const dateInputStyle = {
  fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
  padding: '6px 8px', borderRadius: 7,
  border: '1.5px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text)', outline: 'none', cursor: 'pointer',
};

// ── Layout: Cards ──────────────────────────────────────────
function CardsLayout({ items, onOpenPlace, wished, toggleWish, ctx }) {
  if (items.length === 0) return <EmptyState text="조건에 맞는 곳이 없습니다." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(it => it.isProgram
        ? <ProgramCard key={it.id} program={it} onClick={() => onOpenPlace(it.id)} />
        : <PlaceCard key={it.id} place={it} onClick={() => onOpenPlace(it.id)} wished={wished.has(it.id)} onWish={() => toggleWish(it.id)} />
      )}
    </div>
  );
}

function ProgramCard({ program, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', border: '1px dashed var(--green)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
      display: 'flex', cursor: 'pointer', boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        width: 64, flexShrink: 0, background: program.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 30,
      }}>{program.initial}</div>
      <div style={{ flex: 1, minWidth: 0, padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sticker tone="event">{program.type}</Sticker>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{program.when}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3, color: 'var(--text)' }}>{program.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>@ {program.host} · {program.area}</div>
      </div>
    </div>
  );
}

// ── Layout: Timeline ───────────────────────────────────────
function TimelineLayout({ items, onOpenPlace, ctx }) {
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const dayIdx = ['월','화','수','목','금','토','일'].indexOf(ctx.day);
  const nowFrac = (ctx.hour + (ctx.minute || 0) / 60 - HOURS[0]) / (HOURS.length - 1);

  // Compute for each item: an open band [startFrac, endFrac]
  const bands = items.map(it => {
    if (it.isProgram) {
      const s = (it.start - HOURS[0]) / (HOURS.length - 1);
      const e = (it.end - HOURS[0]) / (HOURS.length - 1);
      return { item: it, s: Math.max(0, s), e: Math.min(1, e), state: 'program' };
    }
    if (!it.hours) return { item: it, s: 0, e: 0, state: 'closed' };
    const today = it.hours[dayIdx];
    if (!today || it.closedToday) return { item: it, s: 0, e: 0, state: 'closed' };
    const [oh, om] = today[0].split(':').map(Number);
    const [ch, cm] = today[1].split(':').map(Number);
    const s = (oh + om/60 - HOURS[0]) / (HOURS.length - 1);
    const e = (ch + cm/60 - HOURS[0]) / (HOURS.length - 1);
    return { item: it, s: Math.max(0, s), e: Math.min(1, e), state: 'open' };
  }).filter(b => b.e > 0 && b.s < 1);

  if (bands.length === 0) return <EmptyState text="시간에 맞는 곳이 없습니다." />;

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '10px 0 14px', position: 'relative',
    }}>
      {/* hour axis */}
      <div style={{
        position: 'relative', height: 18, marginLeft: 96, marginRight: 8,
        borderBottom: '1px solid var(--border)', marginBottom: 6,
      }}>
        {HOURS.map((h, i) => (
          <span key={h} style={{
            position: 'absolute', left: `${(i / (HOURS.length - 1)) * 100}%`,
            transform: 'translateX(-50%)',
            fontSize: 9, fontWeight: 700, color: 'var(--text-sub)',
            letterSpacing: '.04em',
          }}>{h}</span>
        ))}
      </div>

      {/* rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {bands.map(b => (
          <div key={b.item.id} onClick={() => onOpenPlace(b.item.id)} style={{
            display: 'flex', alignItems: 'center', cursor: 'pointer',
            padding: '5px 8px 5px 8px', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ width: 88, flexShrink: 0, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {b.item.name}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-sub)' }}>{b.item.type} · {b.item.area}</div>
            </div>
            <div style={{ position: 'relative', flex: 1, height: 22 }}>
              {/* track */}
              <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 2, background: 'var(--surface2)' }} />
              {/* band */}
              <div style={{
                position: 'absolute', top: 4,
                left: `${b.s * 100}%`, width: `${(b.e - b.s) * 100}%`,
                height: 14, borderRadius: 7,
                background: b.state === 'program' ? b.item.color : b.item.color,
                opacity: b.state === 'program' ? 0.85 : 1,
                border: b.state === 'program' ? '1px dashed rgba(255,255,255,.5)' : 'none',
              }} />
              {/* now line */}
              {nowFrac >= 0 && nowFrac <= 1 && (
                <div style={{
                  position: 'absolute', top: -2, bottom: -2,
                  left: `${nowFrac * 100}%`,
                  width: 2, background: 'var(--danger)',
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-muted)', padding: '8px 12px 0' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 6, borderRadius: 3, background: '#5C7E4E', verticalAlign: 'middle', marginRight: 4 }} />영업</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 6, borderRadius: 3, background: '#3F4A6B', border: '1px dashed #fff', verticalAlign: 'middle', marginRight: 4 }} />프로그램</span>
        <span><span style={{ display: 'inline-block', width: 2, height: 8, background: 'var(--danger)', verticalAlign: 'middle', marginRight: 4 }} />지금</span>
      </div>
    </div>
  );
}

// ── Layout: Map ────────────────────────────────────────────
function MapLayout({ items, onOpenPlace }) {
  // Stylized abstract map of Ganghwa Island. Pins positioned per area.
  // Areas: 강화읍 (top-center), 온수리 (south-center), 그 외 (scattered)
  const POSITIONS = {
    'yeonmijeong': [62, 22], 'jocoffee': [48, 38], 'duchonga': [52, 45],
    'bookshopsijeom': [42, 42], 'francs': [55, 35], 'market': [50, 40],
    'gallery-bun': [45, 48], 'minjeokdang': [48, 50],
    'belpang': [54, 70], 'ddalgi': [48, 75],
    'manisan': [30, 78], 'deorimi': [22, 55],
    'prog-1': [45, 48], 'prog-2': [42, 42], 'prog-3': [54, 70], 'prog-4': [50, 40],
  };

  const [active, setActive] = React.useState(null);
  const activeItem = items.find(i => i.id === active);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', background: '#E8E5DC' }}>
        <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* sea */}
          <rect width="100" height="125" fill="#D4DDE3" />
          {/* island silhouette — stylized Ganghwa */}
          <path
            d="M 40 8 Q 55 6 70 14 Q 80 22 78 35 Q 85 45 80 58 Q 78 72 65 80 Q 60 95 50 100 Q 40 105 30 92 Q 20 85 18 70 Q 12 58 18 45 Q 22 30 30 20 Q 35 10 40 8 Z"
            fill="#F5F4F0" stroke="#1A1916" strokeWidth="0.6"
          />
          {/* 강화읍 region label */}
          <text x="50" y="44" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="3.6" fill="#8A8880" textAnchor="middle">江華邑</text>
          {/* 온수리 region label */}
          <text x="50" y="73" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="3" fill="#8A8880" textAnchor="middle">溫水里</text>
          {/* compass */}
          <g transform="translate(86, 14)">
            <circle r="5" fill="none" stroke="#1A1916" strokeWidth="0.4" />
            <path d="M 0 -4 L 1.2 0 L 0 4 L -1.2 0 Z" fill="#1A1916" />
            <text y="-6" fontSize="2.5" fontWeight="700" fill="#1A1916" textAnchor="middle">N</text>
          </g>
        </svg>

        {/* pins */}
        {items.map(it => {
          const pos = POSITIONS[it.id];
          if (!pos) return null;
          const isProgram = it.isProgram;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={(e) => { e.stopPropagation(); setActive(it.id); }}
              style={{
                position: 'absolute', left: `${pos[0]}%`, top: `${pos[1]}%`,
                transform: `translate(-50%, -100%) ${isActive ? 'scale(1.15)' : 'scale(1)'}`,
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                zIndex: isActive ? 5 : 1,
              }}
            >
              <div style={{
                background: it.color, color: '#fff', minWidth: 30,
                padding: '4px 6px 5px', borderRadius: 5,
                fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap', lineHeight: 1.1,
                border: isProgram ? '1px dashed rgba(255,255,255,.7)' : `1px solid ${it.color}`,
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,.25)' : '0 1px 2px rgba(0,0,0,.15)',
                fontFamily: 'inherit',
              }}>
                {it.name}
              </div>
              <div style={{
                width: 0, height: 0, margin: '0 auto',
                borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                borderTop: `5px solid ${it.color}`,
              }} />
            </button>
          );
        })}
      </div>
      {activeItem && (
        <div onClick={() => onOpenPlace(activeItem.id)} style={{
          borderTop: '1px solid var(--border)', padding: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <PlacePhoto initial={activeItem.initial} color={activeItem.color} altColor={activeItem.altColor} w={48} h={48} radius={6} size={22} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{activeItem.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {activeItem.type} · {activeItem.area} {activeItem.note && `· ${activeItem.note}`}
            </div>
          </div>
          {!activeItem.isProgram && <OpenIndicator status={window.getOpenStatus(activeItem, window.NOW)} />}
          <span style={{ fontSize: 18, color: 'var(--text-sub)' }}>›</span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{
      padding: '36px 16px', textAlign: 'center',
      color: 'var(--text-sub)', fontSize: 13,
      background: 'var(--surface)', borderRadius: 10, border: '1px dashed var(--border)',
    }}>{text}</div>
  );
}

Object.assign(window, { ExploreScreen, EmptyState, ProgramCard });
