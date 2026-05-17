// screens-owner.jsx — 사장님(가게 관리) 모드
// Inspired by templates/manage.html: big 오늘 휴무 toggle as the hero,
// then info / menu / hours sections.

function OwnerScreen({ ownerStore, setOwnerStore, planner }) {
  // ownerStore is just an id; we resolve from PLACES + accept overrides
  const place = window.PLACES.find(p => p.id === ownerStore.id);
  if (!place) return null;
  const [closedToday, setClosedToday] = React.useState(!!ownerStore.closedToday);
  const [closedReason, setClosedReason] = React.useState(ownerStore.closedReason || '');
  const [showReasonInput, setShowReasonInput] = React.useState(false);
  const [section, setSection] = React.useState('today'); // today | info | hours

  return (
    <div style={{ padding: '14px 16px 24px' }}>
      {/* Store picker / brand */}
      <div style={{
        background: 'var(--text)', color: '#fff', borderRadius: 10,
        padding: '12px 14px', marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase' }}>
            STORE MANAGE
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>{place.name}</div>
        </div>
        <select
          value={place.id}
          onChange={(e) => setOwnerStore({ id: e.target.value })}
          style={{
            fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
            background: 'rgba(255,255,255,.12)', color: '#fff',
            border: '1px solid rgba(255,255,255,.25)', borderRadius: 6,
            padding: '5px 8px', outline: 'none',
          }}>
          {window.PLACES.map(p => (
            <option key={p.id} value={p.id} style={{ color: '#000' }}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* HERO — Today closed toggle */}
      <ClosedTodayCard
        place={place}
        closed={closedToday}
        reason={closedReason}
        showReasonInput={showReasonInput}
        onToggle={() => {
          if (closedToday) {
            setClosedToday(false);
            setClosedReason('');
            setShowReasonInput(false);
          } else {
            setClosedToday(true);
            setShowReasonInput(true);
          }
        }}
        onReasonChange={setClosedReason}
        onCloseReason={() => setShowReasonInput(false)}
      />

      {/* Section tabs */}
      <div style={{
        display: 'flex', gap: 6, margin: '6px 0 14px',
      }}>
        {[
          ['today', '오늘'],
          ['info',  '기본정보 · 메뉴'],
          ['hours', '영업시간'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 8,
            border: `1.5px solid ${section === id ? 'var(--text)' : 'var(--border)'}`,
            background: section === id ? 'var(--text)' : 'var(--surface)',
            color: section === id ? '#fff' : 'var(--text-muted)',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 11.5,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{label}</button>
        ))}
      </div>

      {section === 'today'  && <TodaySection place={place} closed={closedToday} planner={planner} />}
      {section === 'info'   && <InfoEditorSection place={place} />}
      {section === 'hours'  && <HoursViewSection place={place} />}

      {/* Footer note */}
      <div style={{
        marginTop: 28, padding: '12px 14px',
        background: 'var(--surface2)', borderRadius: 8,
        fontSize: 10.5, color: 'var(--text-sub)', lineHeight: 1.6,
      }}>
        이 화면은 가게 사장님이 받는 관리 링크에서 열립니다 ({location.host || 'ghwhere'}/manage/&lt;토큰&gt;).
        영업시간 변경 등 큰 수정은 운영자에게 요청해주세요.
      </div>
    </div>
  );
}

// ─── Big 오늘 휴무 toggle (the brief's centerpiece) ─────
function ClosedTodayCard({ place, closed, reason, showReasonInput, onToggle, onReasonChange, onCloseReason }) {
  return (
    <div style={{
      background: closed ? '#FDECEA' : 'var(--surface)',
      border: `2px solid ${closed ? '#C0392B' : 'var(--border)'}`,
      borderRadius: 12, padding: 16, marginBottom: 10,
      transition: 'all .15s',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: closed ? '#C0392B' : 'var(--text-sub)',
        letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10,
      }}>
        오늘 영업 여부 · {window.NOW.label.split(' ')[0]}
      </div>
      <button onClick={onToggle} style={{
        width: '100%', padding: '20px 14px', borderRadius: 10,
        background: closed ? '#C0392B' : 'var(--surface)',
        border: `2px solid ${closed ? '#C0392B' : 'var(--border)'}`,
        color: closed ? '#fff' : 'var(--text)',
        fontFamily: 'inherit', fontSize: 17, fontWeight: 800,
        cursor: 'pointer', transition: 'all .15s',
        textAlign: 'left',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <span style={{ lineHeight: 1.3 }}>
          {closed ? '오늘 임시휴무로 표시 중' : '오늘 영업합니다'}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 14,
          background: closed ? 'rgba(255,255,255,.18)' : 'var(--surface2)',
          color: closed ? '#fff' : 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}>
          {closed ? '↻ 취소' : '한 번만 눌러요'}
        </span>
      </button>

      {showReasonInput && closed && (
        <div style={{ marginTop: 12, animation: 'fadein .2s ease' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
            손님이 보는 사유 (선택 — 비워두면 "임시휴무"로만 표시)
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="예) 가족과 캠핑 다녀와요"
              style={{
                flex: 1, fontFamily: 'inherit', fontSize: 13,
                padding: '8px 10px', borderRadius: 7,
                border: '1.5px solid #C0392B', background: '#fff',
                color: 'var(--text)', outline: 'none',
              }}
            />
            <button onClick={onCloseReason} style={{
              padding: '8px 14px', borderRadius: 7, border: 'none',
              background: '#C0392B', color: '#fff', fontFamily: 'inherit',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>확인</button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 6 }}>
            손님 화면 미리보기 → <span style={{ color: '#C0392B', fontWeight: 700 }}>
              ⓘ 오늘 임시휴무 {reason && `· ${reason}`}
            </span>
          </div>
        </div>
      )}

      {closed && !showReasonInput && reason && (
        <div style={{ fontSize: 12, color: '#7F1D1D', marginTop: 10 }}>
          사유: {reason}
        </div>
      )}
    </div>
  );
}

// ─── 오늘 섹션 — 현재 상태 한눈에 ──────────────────────
function TodaySection({ place, closed, planner }) {
  const status = closed ? { state: 'closed-today', label: '오늘 임시휴무', detail: null }
                        : window.getOpenStatus(place, window.NOW);
  // mock visits/plans today
  const plannedToday = planner.filter(p => p.placeId === place.id).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '14px 16px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          손님 화면에 지금 이렇게 보여요
        </div>
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <PlacePhoto initial={place.initial} color={place.color} altColor={place.altColor} w={48} h={48} radius={6} size={22} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{place.name}</div>
            <div style={{ marginTop: 4 }}>
              <OpenIndicator status={status} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Metric label="오늘 플래너에 담은 손님" value={plannedToday} suffix="명" />
        <Metric label="이번 주 자랑" value={2} suffix="건" />
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '14px 16px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          예정된 임시 변경
        </div>
        {place.id === 'ddalgi' ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', background: '#FDF0EA', borderRadius: 6,
            fontSize: 12, color: '#7F1D1D',
          }}>
            <span><strong>11/29 (토)</strong> — 휴무 (가족과 캠핑)</span>
            <button style={{
              fontFamily: 'inherit', fontSize: 11, border: 'none', background: 'transparent',
              color: '#7F1D1D', cursor: 'pointer', textDecoration: 'underline',
            }}>취소</button>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
            예정된 휴무가 없어요.
          </div>
        )}
        <button style={{
          marginTop: 10, width: '100%', padding: '10px',
          background: 'transparent', border: '1.5px dashed var(--border)',
          borderRadius: 7, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
          color: 'var(--text-muted)', cursor: 'pointer',
        }}>+ 며칠 미리 휴무 등록</button>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--text)', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{suffix}</span>
      </div>
    </div>
  );
}

// ─── 기본정보 · 메뉴 ────────────────────────────────────
function InfoEditorSection({ place }) {
  const PRICE_RANGES = [
    { value: 'low',  label: '저렴 (~1만)' },
    { value: 'mid',  label: '보통 (1~3만)' },
    { value: 'high', label: '고가 (3만+)' },
  ];
  const [description, setDescription] = React.useState(place.blurb || '');
  const [phone, setPhone] = React.useState(place.phone || '');
  const [insta, setInsta] = React.useState(place.instagram || '');
  const [pr, setPr] = React.useState(place.priceRange || '');
  const [tags, setTags] = React.useState((place.tags || []).join(', '));
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setDescription(place.blurb || '');
    setPhone(place.phone || '');
    setInsta(place.instagram || '');
    setPr(place.priceRange || '');
    setTags((place.tags || []).join(', '));
  }, [place.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card title="기본 정보">
        <Field label="소개">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="가게 한 줄 소개" rows={3}
            style={fieldStyle} />
        </Field>
        <Field label="전화번호">
          <input value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="0507-0000-0000" style={fieldStyle} />
        </Field>
        <Field label="인스타그램">
          <input value={insta} onChange={(e) => setInsta(e.target.value)}
            placeholder="계정명 (@ 제외)" style={fieldStyle} />
        </Field>
        <Field label="가격대">
          <div style={{ display: 'flex', gap: 6 }}>
            {PRICE_RANGES.map(o => (
              <button key={o.value} onClick={() => setPr(o.value)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 7,
                border: `1.5px solid ${pr === o.value ? 'var(--green)' : 'var(--border)'}`,
                background: pr === o.value ? 'var(--green-light)' : 'var(--surface)',
                color: pr === o.value ? 'var(--green)' : 'var(--text-muted)',
                fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}>{o.label}</button>
            ))}
          </div>
        </Field>
      </Card>

      <Card title="메뉴 정보">
        <Field label="메뉴판 사진 (URL)">
          <input placeholder="https://..." style={fieldStyle} />
        </Field>
        <Field label="대표 메뉴 / 태그" hint="쉼표로 구분 — 3~5개">
          <input value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="딸기라떼, 카눌레, 마들렌" style={fieldStyle} />
        </Field>
        <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 7 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            등록된 메뉴 ({(place.menu || []).length}개)
          </div>
          {(place.menu || []).length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>아직 메뉴가 없어요.</div>
          )}
          {(place.menu || []).slice(0, 4).map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', color: 'var(--text-muted)' }}>
              <span>{m.name}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{m.price}원</span>
            </div>
          ))}
        </div>
      </Card>

      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}
        style={{
          width: '100%', padding: 14, borderRadius: 10,
          background: 'var(--green)', color: '#fff', border: 'none',
          fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
          cursor: 'pointer',
        }}>
        {saved ? '✓ 저장됨' : '정보 저장'}
      </button>
    </div>
  );
}

// ─── 영업시간 (view-only — backend has admin handle this) ───
function HoursViewSection({ place }) {
  const DAYS = ['일','월','화','수','목','금','토'];
  const todayIdx = ['월','화','수','목','금','토','일'].indexOf(window.NOW.day);
  // map our wk(mo..su) → backend dow order (su, mo..sa) for visual
  // Just present in 월~일 order for readability
  return (
    <div>
      <Card title="정기 영업시간">
        <div style={{
          background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px',
        }}>
          {['월','화','수','목','금','토','일'].map((d, i) => {
            const h = place.hours[i];
            const isToday = i === todayIdx;
            return (
              <div key={d} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
                color: isToday ? 'var(--green)' : 'var(--text)',
                fontWeight: isToday ? 800 : 500,
                fontSize: 13,
              }}>
                <span style={{ width: 28 }}>{d}{isToday && ' ·'}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', flex: 1, textAlign: 'right' }}>
                  {h ? `${h[0]} – ${h[1]}` : <span style={{ color: 'var(--danger)' }}>정기휴무</span>}
                </span>
              </div>
            );
          })}
        </div>
        <button style={{
          marginTop: 14, width: '100%', padding: 12, borderRadius: 8,
          background: 'transparent', border: '1.5px solid var(--border)',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5, color: 'var(--text-muted)',
          cursor: 'pointer',
        }}>영업시간 변경 요청 →</button>
        <div style={{ fontSize: 10.5, color: 'var(--text-sub)', marginTop: 8, lineHeight: 1.6 }}>
          정기 영업시간 변경은 운영자가 확인 후 적용해요.
          오늘 하루만 쉬는 거라면 위의 <strong style={{ color: 'var(--text)' }}>오늘 휴무</strong> 버튼을 눌러주세요.
        </div>
      </Card>
    </div>
  );
}

// helpers
const fieldStyle = {
  width: '100%', fontFamily: 'inherit', fontSize: 13,
  padding: '8px 10px', borderRadius: 7,
  border: '1.5px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', outline: 'none', resize: 'vertical',
};
function Card({ title, children }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 14px 14px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}
function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 10.5, color: 'var(--text-sub)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

Object.assign(window, { OwnerScreen });
