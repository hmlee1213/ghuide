// screens-detail.jsx — 가게 상세 sheet content

function PlaceDetailContent({ id, onClose, onAddPlanner, wished, toggleWish }) {
  // Could be a place or a program
  const place = window.PLACES.find(p => p.id === id);
  const program = window.PROGRAMS.find(p => p.id === id);
  if (place) return <PlaceDetail place={place} onClose={onClose} onAddPlanner={onAddPlanner} wished={wished} toggleWish={toggleWish} />;
  if (program) return <ProgramDetail program={program} onClose={onClose} onAddPlanner={onAddPlanner} wished={wished} toggleWish={toggleWish} />;
  return null;
}

function PlaceDetail({ place, onClose, onAddPlanner, wished, toggleWish }) {
  const status = window.getOpenStatus(place, window.NOW);
  const [activeTab, setActiveTab] = React.useState('info');
  const isWished = wished.has(place.id);

  return (
    <div>
      {/* Hero */}
      <div style={{
        position: 'relative', height: 220, background: place.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: place.altColor || '#fff', overflow: 'hidden',
      }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 120, lineHeight: 1, opacity: 0.9,
        }}>{place.initial}</span>
        {place.free && (
          <div style={{ position: 'absolute', top: 14, left: 14 }}>
            <Sticker tone="free">무료</Sticker>
          </div>
        )}
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
          <button onClick={() => toggleWish(place.id)} aria-label="찜" style={{
            width: 36, height: 36, borderRadius: 18, border: 'none',
            background: 'rgba(255,255,255,.9)', color: isWished ? 'var(--danger)' : 'var(--text-muted)',
            fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
          }}>{isWished ? '♥' : '♡'}</button>
          <button onClick={onClose} aria-label="닫기" style={{
            width: 36, height: 36, borderRadius: 18, border: 'none',
            background: 'rgba(255,255,255,.9)', color: 'var(--text)',
            fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
          }}>✕</button>
        </div>
      </div>

      {/* Title block */}
      <div style={{ padding: '16px 18px 8px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 700, letterSpacing: '.04em' }}>
          {place.type} · {place.area}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '4px 0 8px', lineHeight: 1.2 }}>{place.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <OpenIndicator status={status} size="lg" />
          {status.detail && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{status.detail}</span>}
        </div>
        {place.closedToday && (
          <div style={{
            marginTop: 10, padding: '10px 12px',
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
            fontSize: 12, color: '#991B1B', lineHeight: 1.5,
          }}>
            <strong>오늘 임시휴무</strong> — {place.closedToday.reason}<br />
            <span style={{ color: '#7F1D1D' }}>{place.closedToday.until}</span>
          </div>
        )}
        <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)' }}>{place.blurb}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          {place.tags && place.tags.map(t => (
            <span key={t} style={{
              fontSize: 11, color: 'var(--text-muted)',
              padding: '4px 8px', borderRadius: 12,
              background: 'var(--surface2)', fontWeight: 500,
            }}>#{t}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid var(--border)',
        margin: '14px 0 0', padding: '0 18px',
      }}>
        {['info', place.menu && 'menu', 'photos', place.program && 'program'].filter(Boolean).map(t => (
          <div key={t} onClick={() => setActiveTab(t)} style={{
            padding: '12px 14px', fontSize: 13, fontWeight: 700,
            color: activeTab === t ? 'var(--green)' : 'var(--text-muted)',
            borderBottom: activeTab === t ? '2px solid var(--green)' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>
            {t === 'info' ? '정보' : t === 'menu' ? '메뉴판' : t === 'photos' ? '사진' : '프로그램'}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 18px 80px' }}>
        {activeTab === 'info' && <InfoTab place={place} />}
        {activeTab === 'menu' && <MenuTab menu={place.menu} />}
        {activeTab === 'photos' && <PhotosTab place={place} />}
        {activeTab === 'program' && place.program && (
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>다가오는 프로그램</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{place.program.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{place.program.date}</div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'sticky', bottom: 34, left: 0, right: 0,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        padding: '10px 16px 14px',
        display: 'flex', gap: 8,
      }}>
        <button onClick={() => toggleWish(place.id)} style={{
          flex: '0 0 auto', padding: '12px 14px', borderRadius: 8,
          border: `1.5px solid ${isWished ? 'var(--danger)' : 'var(--border)'}`,
          background: 'var(--surface)', color: isWished ? 'var(--danger)' : 'var(--text)',
          fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {isWished ? '♥ 찜됨' : '♡ 찜'}
        </button>
        <button onClick={() => onAddPlanner(place.id)} style={{
          flex: 1, padding: '12px 14px', borderRadius: 8,
          border: 'none', background: 'var(--text)', color: '#fff',
          fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          + 플래너에 추가
        </button>
      </div>
    </div>
  );
}

function InfoTab({ place }) {
  const DAYS = ['월','화','수','목','금','토','일'];
  const todayIdx = DAYS.indexOf(window.NOW.day);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 영업시간 grid */}
      <Section title="영업시간">
        <div style={{
          background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          {DAYS.map((d, i) => {
            const h = place.hours[i];
            const isToday = i === todayIdx;
            return (
              <div key={d} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '4px 0',
                color: isToday ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: isToday ? 800 : 500,
              }}>
                <span>{d}{isToday && ' · 오늘'}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {h ? `${h[0]} – ${h[1]}` : '휴무'}
                </span>
              </div>
            );
          })}
        </div>
        {place.note && (
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 6, lineHeight: 1.5 }}>
            ⓘ {place.note}
          </div>
        )}
      </Section>

      {/* 교통 */}
      {place.transit === 'bus' && (
        <Section title="대중교통 (뚜벅이용)">
          <div style={{
            background: '#FFFCEF', border: '1px solid #FCD34D', borderRadius: 8,
            padding: '10px 12px', fontSize: 12, color: 'var(--text)', lineHeight: 1.6,
          }}>
            <strong style={{ color: '#92400e' }}>버스 운행 횟수가 적습니다.</strong><br />
            {place.extra && place.extra.busFromTerminal}
          </div>
        </Section>
      )}
      {place.walkOnly && (
        <Section title="접근">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            대중교통으로는 가기 어렵습니다. 차량 또는 택시 권장.
          </div>
        </Section>
      )}

      {/* 자랑 미리보기 */}
      <Section title="이곳을 다녀온 사람들">
        <BragPreview placeId={place.id} />
      </Section>
    </div>
  );
}

function MenuTab({ menu }) {
  if (!menu) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{
        background: 'var(--text)', color: '#fff',
        padding: '10px 14px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18,
      }}>
        Menu
      </div>
      {menu.map((m, i) => (
        <div key={i} style={{
          padding: '12px 14px',
          borderBottom: i < menu.length - 1 ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{m.name}</div>
            {m.note && <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>{m.note}</div>}
          </div>
          <div style={{
            flexGrow: 1, borderBottom: '1px dotted var(--border)',
            alignSelf: 'flex-end', height: 1, marginBottom: 6,
          }} />
          <div style={{
            fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: 'var(--text)', whiteSpace: 'nowrap',
          }}>{m.price}<span style={{ fontSize: 10, color: 'var(--text-sub)', marginLeft: 2 }}>원</span></div>
        </div>
      ))}
      <div style={{
        padding: '8px 14px', background: 'var(--surface2)',
        fontSize: 10, color: 'var(--text-sub)', textAlign: 'center',
      }}>
        가격 · 메뉴는 변동될 수 있어요
      </div>
    </div>
  );
}

function PhotosTab({ place }) {
  // Editorial photo placeholders — colored blocks with serif letters
  // Simulates a small gallery
  const photos = [
    { color: place.color, initial: place.initial, label: '대표' },
    { color: '#3F4A52', initial: place.name[0], label: '외관' },
    { color: '#8B7355', initial: place.type[0], label: '내부' },
    { color: '#5C6B57', initial: '味', label: '메뉴' },
  ];
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
      }}>
        {photos.map((p, i) => (
          <div key={i} style={{
            aspectRatio: i === 0 ? '2/1' : '1/1', gridColumn: i === 0 ? 'span 2' : 'auto',
            background: p.color, color: '#fff', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: i === 0 ? 64 : 48, opacity: 0.85 }}>
              {p.initial}
            </span>
            <span style={{
              position: 'absolute', bottom: 6, left: 8, fontSize: 10,
              color: 'rgba(255,255,255,.8)', fontWeight: 600, letterSpacing: '.04em',
            }}>{p.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-sub)', textAlign: 'center' }}>
        방문자 사진 12장 · 자랑 탭에서 더 보기
      </div>
    </div>
  );
}

function BragPreview({ placeId }) {
  const brags = window.BRAGS.filter(b => b.placeId === placeId).slice(0, 2);
  if (brags.length === 0) {
    return (
      <div style={{
        padding: '14px', background: 'var(--surface2)', borderRadius: 8,
        fontSize: 12, color: 'var(--text-sub)', textAlign: 'center',
      }}>
        아직 자랑이 없어요. 첫 자랑을 남겨보세요.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {brags.map(b => (
        <div key={b.id} style={{
          background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: b.color,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>{b.user[0]}</div>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{b.user}</span>
            <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>· {b.when}</span>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--text)' }}>{b.text}</div>
        </div>
      ))}
    </div>
  );
}

function ProgramDetail({ program, onClose, onAddPlanner }) {
  return (
    <div>
      <div style={{
        height: 180, background: program.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 110, opacity: 0.85 }}>
          {program.initial}
        </span>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 18,
          border: 'none', background: 'rgba(255,255,255,.9)', fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
        }}>✕</button>
      </div>
      <div style={{ padding: '18px 18px 24px' }}>
        <Sticker tone="event">{program.type}</Sticker>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 4px', lineHeight: 1.25 }}>{program.title}</h1>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{program.when} · @ {program.host}</div>
        <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.65, color: 'var(--text-muted)' }}>{program.blurb}</p>
        <button onClick={() => onAddPlanner(program.id)} style={{
          marginTop: 18, width: '100%', padding: '14px',
          background: 'var(--text)', color: '#fff', border: 'none', borderRadius: 8,
          fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}>+ 플래너에 추가</button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
        letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  );
}

Object.assign(window, { PlaceDetailContent });
