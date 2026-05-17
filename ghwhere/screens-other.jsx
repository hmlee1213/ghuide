// screens-other.jsx — Planner, Wishlist, Brag

// ════════════════════════════════════════════════════════════
// PlannerScreen — 시간순 리스트 + 메모
// ════════════════════════════════════════════════════════════
function PlannerScreen({ planner, setPlanner, onOpenPlace }) {
  // Sort by time
  const sorted = [...planner].sort((a, b) => a.time.localeCompare(b.time));

  const updateMemo = (idx, memo) => {
    const next = [...planner];
    const realIdx = planner.indexOf(sorted[idx]);
    next[realIdx] = { ...next[realIdx], memo };
    setPlanner(next);
  };
  const remove = (idx) => {
    setPlanner(planner.filter(p => p !== sorted[idx]));
  };

  const resolveItem = (placeId) => {
    return window.PLACES.find(p => p.id === placeId) || window.PROGRAMS.find(p => p.id === placeId);
  };

  return (
    <div style={{ padding: '14px 16px 24px' }}>
      {/* Date header */}
      <div style={{
        background: 'var(--text)', color: '#fff', borderRadius: 12,
        padding: '14px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase' }}>
            오늘의 동선
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4, whiteSpace: 'nowrap' }}>11월 29일 (토)</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', letterSpacing: '.05em' }}>총</span>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            {planner.length}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>곳</span>
        </div>
      </div>

      <SectionHeader sub="찜한 곳을 시간순으로 배치합니다">오늘의 플래너</SectionHeader>

      {sorted.length === 0 && (
        <EmptyState text="플래너가 비어있어요. 가게 상세에서 + 플래너 버튼을 눌러 추가해보세요." />
      )}

      <div style={{ position: 'relative', paddingLeft: 64 }}>
        {/* timeline rail */}
        {sorted.length > 0 && (
          <div style={{
            position: 'absolute', left: 42, top: 14, bottom: 14, width: 2,
            background: 'var(--border)',
          }} />
        )}
        {sorted.map((entry, i) => {
          const item = resolveItem(entry.placeId);
          if (!item) return null;
          const isNow = entry.time <= `${String(window.NOW.hour).padStart(2,'0')}:${String(window.NOW.minute).padStart(2,'0')}` &&
                       (i === sorted.length - 1 || sorted[i+1].time > `${String(window.NOW.hour).padStart(2,'0')}:${String(window.NOW.minute).padStart(2,'0')}`);
          return (
            <PlannerEntry
              key={i}
              entry={entry}
              item={item}
              isNow={isNow}
              onChange={(memo) => updateMemo(i, memo)}
              onRemove={() => remove(i)}
              onClick={() => onOpenPlace(entry.placeId)}
            />
          );
        })}

        {sorted.length > 0 && (
          <div style={{ position: 'relative', marginTop: 14 }}>
            <div style={{
              position: 'absolute', left: -26, top: 14, width: 14, height: 14, borderRadius: '50%',
              border: '2px solid var(--border)', background: 'var(--bg)',
            }} />
            <button style={{
              width: '100%', padding: '12px', borderRadius: 8,
              border: '1.5px dashed var(--border)', background: 'transparent',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              color: 'var(--text-muted)', cursor: 'pointer',
            }}>+ 빈 시간 추가</button>
          </div>
        )}
      </div>

      {/* Daily summary */}
      {sorted.length > 0 && <DailySummary entries={sorted} />}
    </div>
  );
}

function PlannerEntry({ entry, item, isNow, onChange, onRemove, onClick }) {
  const status = item.hours ? window.getOpenStatus(item, window.NOW) : null;
  const willBeClosed = status && status.state === 'closed-today';
  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      {/* dot */}
      <div style={{
        position: 'absolute', left: -26, top: 14,
        width: 14, height: 14, borderRadius: '50%',
        background: isNow ? 'var(--danger)' : 'var(--text)',
        border: '2px solid var(--bg)',
        boxShadow: isNow ? '0 0 0 3px rgba(220,38,38,.18)' : 'none',
      }} />
      {/* time label */}
      <div style={{
        position: 'absolute', left: -64, top: 12,
        fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
        color: isNow ? 'var(--danger)' : 'var(--text)',
      }}>{entry.time}</div>

      <div style={{
        background: 'var(--surface)', border: `1px solid ${isNow ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 10, overflow: 'hidden',
        boxShadow: isNow ? '0 4px 12px rgba(220,38,38,.1)' : 'var(--shadow)',
      }}>
        <div onClick={onClick} style={{ display: 'flex', cursor: 'pointer' }}>
          <PlacePhoto initial={item.initial} color={item.color} altColor={item.altColor} w={68} h={84} radius={0} size={28} />
          <div style={{ flex: 1, minWidth: 0, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{item.name || item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
                  {item.type} · {item.area}
                </div>
              </div>
              {isNow && <Sticker tone="event">지금 차례</Sticker>}
            </div>
            {willBeClosed && (
              <div style={{
                marginTop: 6, fontSize: 11, color: 'var(--danger)', fontWeight: 700,
              }}>⚠ 이 시간에 임시휴무입니다. 일정 변경 필요</div>
            )}
          </div>
        </div>
        <div style={{
          padding: '8px 12px 10px', borderTop: '1px solid var(--border)',
          background: 'var(--surface2)',
        }}>
          <input
            value={entry.memo}
            onChange={(e) => onChange(e.target.value)}
            placeholder="메모 (예약번호, 메뉴, 동행 등)"
            style={{
              width: '100%', border: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 12, color: 'var(--text)',
              outline: 'none', padding: 0,
            }}
          />
        </div>
        <button onClick={onRemove} style={{
          width: '100%', padding: '6px',
          background: 'transparent', border: 'none', borderTop: '1px solid var(--border)',
          fontFamily: 'inherit', fontSize: 10, color: 'var(--text-sub)',
          cursor: 'pointer', letterSpacing: '.05em',
        }}>일정에서 제거</button>
      </div>
    </div>
  );
}

function DailySummary({ entries }) {
  const start = entries[0].time;
  const end = entries[entries.length - 1].time;
  const types = [...new Set(entries.map(e => {
    const item = window.PLACES.find(p => p.id === e.placeId) || window.PROGRAMS.find(p => p.id === e.placeId);
    return item ? item.type : null;
  }).filter(Boolean))];
  return (
    <div style={{
      marginTop: 24, padding: '14px 16px',
      background: 'var(--surface2)', borderRadius: 10,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        요약
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
        <strong style={{ fontSize: 14 }}>{start} → {end}</strong><br />
        {types.join(' · ')}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// WishlistScreen — 찜
// ════════════════════════════════════════════════════════════
function WishlistScreen({ wished, toggleWish, onOpenPlace, onAddAllToPlanner }) {
  const wishedIds = [...wished];
  const places = wishedIds.map(id =>
    window.PLACES.find(p => p.id === id) || window.PROGRAMS.find(p => p.id === id)
  ).filter(Boolean);

  return (
    <div style={{ padding: '14px 16px 24px' }}>
      <SectionHeader sub={`${places.length}곳 찜`}>관심 목록</SectionHeader>

      {places.length > 0 && (
        <button onClick={onAddAllToPlanner} style={{
          width: '100%', padding: '12px 16px', background: 'var(--green)',
          color: '#fff', border: 'none', borderRadius: 8,
          fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
          cursor: 'pointer', marginBottom: 14,
        }}>
          전체를 플래너로 옮기기 →
        </button>
      )}

      {places.length === 0 && (
        <EmptyState text="아직 찜한 곳이 없어요. 탐색에서 ♡ 버튼을 눌러보세요." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {places.map(p => p.isProgram || !p.hours
          ? <ProgramCard key={p.id} program={p} onClick={() => onOpenPlace(p.id)} />
          : <PlaceCard key={p.id} place={p} onClick={() => onOpenPlace(p.id)} wished={true} onWish={() => toggleWish(p.id)} />
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// BragScreen — 자랑하기 피드
// ════════════════════════════════════════════════════════════
function BragScreen({ onOpenPlace }) {
  const [tab, setTab] = React.useState('feed');
  return (
    <div style={{ padding: '14px 16px 24px' }}>
      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 14,
      }}>
        {[['feed','전체 자랑'], ['mine', '내 기록']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '8px 14px', borderRadius: 20,
            border: `1.5px solid ${tab === id ? 'var(--text)' : 'var(--border)'}`,
            background: tab === id ? 'var(--text)' : 'var(--surface)',
            color: tab === id ? '#fff' : 'var(--text-muted)',
            fontFamily: 'inherit', fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      <SectionHeader sub={tab === 'mine' ? '나의 발자국' : '강화 다녀온 사람들'}>
        {tab === 'mine' ? '나의 기록' : '자랑하기'}
      </SectionHeader>

      {tab === 'mine' && (
        <EmptyState text="아직 남긴 자랑이 없어요. 다녀온 곳에서 사진과 후기를 남겨주세요." />
      )}

      {tab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {window.BRAGS.map(b => {
            const place = window.PLACES.find(p => p.id === b.placeId);
            if (!place) return null;
            return (
              <div key={b.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
              }}>
                {/* Photo */}
                <div onClick={() => onOpenPlace(place.id)} style={{
                  width: '100%', aspectRatio: '4/3', background: b.color,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden',
                }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 96, opacity: 0.9 }}>
                    {place.initial}
                  </span>
                </div>
                {/* Body */}
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: b.color,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>{b.user[0]}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{b.user}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>
                        @ <span onClick={() => onOpenPlace(place.id)} style={{ borderBottom: '1px solid var(--green)', color: 'var(--text)' }}>{place.name}</span> · {b.when}
                      </div>
                    </div>
                    <button style={{
                      background: 'transparent', border: 'none', fontSize: 16,
                      color: 'var(--text-sub)', cursor: 'pointer', fontFamily: 'inherit',
                    }}>♡</button>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)' }}>{b.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button style={{
        position: 'absolute', right: 18, bottom: 80,
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--text)', color: '#fff', border: 'none',
        fontSize: 26, lineHeight: 1, cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(0,0,0,.25)', fontFamily: 'inherit',
        zIndex: 20,
      }}>+</button>
    </div>
  );
}

Object.assign(window, { PlannerScreen, WishlistScreen, BragScreen });
