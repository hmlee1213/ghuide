// app.jsx — main App: tabs, navigation state, tweaks

const APP_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "customer",
  "layout": "cards",
  "palette": "system",
  "openOnlyDefault": true,
  "showHeaderStats": true
}/*EDITMODE-END*/;

const PALETTES = {
  system: {
    label: '시스템',
    sub: '디자인 시스템 그대로',
    vars: {}, // use defaults
  },
  tidal: {
    label: '갯벌',
    sub: '강화 갯벌·흙·해 톤',
    vars: {
      '--bg': '#F2EBDD',
      '--surface': '#FBF6EA',
      '--surface2': '#ECE2CC',
      '--border': '#D8C9AC',
      '--text': '#2C2118',
      '--text-muted': '#5C4A38',
      '--text-sub': '#8E7B5F',
      '--green': '#9A5A2C', // tidal rust
      '--green-light': '#F4E8D7',
      '--green-dark': '#7A4520',
    },
  },
  sea: {
    label: '바다',
    sub: '서해·고려청자 톤',
    vars: {
      '--bg': '#E8EEF1',
      '--surface': '#F4F7F9',
      '--surface2': '#D8E1E6',
      '--border': '#B9C8D1',
      '--text': '#102230',
      '--text-muted': '#3A5566',
      '--text-sub': '#6F8493',
      '--green': '#1F5D77',
      '--green-light': '#DCEAF1',
      '--green-dark': '#143F52',
    },
  },
};

const TABS = [
  { id: 'explore', label: '탐색' },
  { id: 'planner', label: '플래너' },
  { id: 'wish',    label: '관심' },
  { id: 'brag',    label: '자랑' },
];

function App() {
  const [tweaks, setTweak] = useTweaks(APP_DEFAULTS);
  const isOwner = tweaks.mode === 'owner';
  const [tab, setTab] = React.useState('explore');
  const [openId, setOpenId] = React.useState(null);
  const [wished, setWished] = React.useState(new Set(['yeonmijeong', 'belpang', 'prog-2']));
  const [planner, setPlanner] = React.useState(window.PLANNER_INITIAL);
  const [ownerStore, setOwnerStore] = React.useState({ id: 'ddalgi' });
  const [toast, setToast] = React.useState(null);

  const toggleWish = (id) => {
    setWished(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else { next.add(id); showToast('찜에 추가됨'); }
      return next;
    });
  };

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 1500);
  };

  const addToPlanner = (id) => {
    if (planner.find(p => p.placeId === id)) { showToast('이미 플래너에 있어요'); return; }
    // pick a default time based on existing slots
    const used = planner.map(p => p.time);
    let candidate = '13:00';
    for (const t of ['09:30', '11:00', '13:00', '15:00', '17:00', '19:00']) {
      if (!used.includes(t)) { candidate = t; break; }
    }
    setPlanner([...planner, { placeId: id, time: candidate, memo: '' }]);
    showToast('플래너에 추가됨');
    setOpenId(null);
    setTab('planner');
  };

  const addAllWishedToPlanner = () => {
    const existing = new Set(planner.map(p => p.placeId));
    const newOnes = [...wished].filter(id => !existing.has(id));
    const used = planner.map(p => p.time);
    const slots = ['09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00'].filter(t => !used.includes(t));
    const next = newOnes.map((id, i) => ({ placeId: id, time: slots[i] || `${10+i}:00`, memo: '' }));
    setPlanner([...planner, ...next]);
    showToast(`${newOnes.length}곳 플래너에 추가`);
    setTab('planner');
  };

  // Apply palette
  React.useEffect(() => {
    const palette = PALETTES[tweaks.palette] || PALETTES.system;
    const root = document.documentElement;
    // first reset
    Object.keys(PALETTES.tidal.vars).forEach(k => root.style.removeProperty(k));
    Object.entries(palette.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [tweaks.palette]);

  return (
    <>
      <IOSDevice width={402} height={874} dark={true}>
        <div style={{
          height: '100%', background: 'var(--bg)', color: 'var(--text)',
          fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column',
          position: 'absolute', inset: 0,
        }}>
          <BrandHeader showStats={tweaks.showHeaderStats && !isOwner} isOwner={isOwner} />

          <div style={{
            flex: 1, minHeight: 0,
            overflow: 'auto', WebkitOverflowScrolling: 'touch',
            position: 'relative',
          }}>
            {isOwner ? (
              <OwnerScreen ownerStore={ownerStore} setOwnerStore={setOwnerStore} planner={planner} />
            ) : (
              <>
                {tab === 'explore' && (
                  <ExploreScreen
                    layout={tweaks.layout}
                    onOpenPlace={setOpenId}
                    wished={wished}
                    toggleWish={toggleWish}
                  />
                )}
                {tab === 'planner' && (
                  <PlannerScreen planner={planner} setPlanner={setPlanner} onOpenPlace={setOpenId} />
                )}
                {tab === 'wish' && (
                  <WishlistScreen wished={wished} toggleWish={toggleWish} onOpenPlace={setOpenId} onAddAllToPlanner={addAllWishedToPlanner} />
                )}
                {tab === 'brag' && (
                  <BragScreen onOpenPlace={setOpenId} />
                )}
              </>
            )}
          </div>

          {!isOwner && <TabBar activeTab={tab} onChange={setTab} planCount={planner.length} wishCount={wished.size} />}

          <BottomSheet open={!!openId} onClose={() => setOpenId(null)}>
            <PlaceDetailContent
              id={openId}
              onClose={() => setOpenId(null)}
              onAddPlanner={addToPlanner}
              wished={wished}
              toggleWish={toggleWish}
            />
          </BottomSheet>

          {toast && (
            <div style={{
              position: 'absolute', left: '50%', bottom: 100, transform: 'translateX(-50%)',
              background: 'rgba(26,25,22,.92)', color: '#fff',
              padding: '10px 18px', borderRadius: 24,
              fontSize: 13, fontWeight: 600, zIndex: 200,
              animation: 'fadein .2s ease',
            }}>{toast}</div>
          )}
        </div>
      </IOSDevice>

      {/* Tweaks panel (host-controlled) */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="역할 모드">
          <TweakRadio
            label="화면"
            value={tweaks.mode}
            options={[
              { value: 'customer', label: '손님' },
              { value: 'owner',    label: '사장님' },
            ]}
            onChange={(v) => setTweak('mode', v)}
          />
          <div style={{ fontSize: 10, color: '#888', lineHeight: 1.4, marginTop: 4 }}>
            사장님 모드는 관리 링크에서 열리는 화면이에요.
          </div>
        </TweakSection>

        <TweakSection label="기본 화면">
          <TweakRadio
            label="레이아웃"
            value={tweaks.layout}
            options={[
              { value: 'cards', label: '카드' },
              { value: 'timeline', label: '타임' },
              { value: 'map', label: '지도' },
            ]}
            onChange={(v) => setTweak('layout', v)}
          />
          <div style={{ fontSize: 10, color: '#888', lineHeight: 1.4, marginTop: 4 }}>
            카드·타임라인은 앱 안에서도 전환 가능. 지도는 실험적 옵션.
          </div>
        </TweakSection>

        <TweakSection label="강화 색상 톤">
          <TweakSelect
            label="팔레트"
            value={tweaks.palette}
            options={[
              { value: 'system', label: '시스템 (포레스트 그린)' },
              { value: 'tidal',  label: '갯벌 (키움·흐·해)' },
              { value: 'sea',    label: '바다 (서해·청자)' },
            ]}
            onChange={(v) => setTweak('palette', v)}
          />
        </TweakSection>

        <TweakSection label="옵션">
          <TweakToggle
            label="진짜 열린 곳만 (기본)"
            value={tweaks.openOnlyDefault}
            onChange={(v) => setTweak('openOnlyDefault', v)}
          />
          <TweakToggle
            label="헤더 통계 표시"
            value={tweaks.showHeaderStats}
            onChange={(v) => setTweak('showHeaderStats', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// BrandHeader — sticky dark header
// ════════════════════════════════════════════════════════════
function BrandHeader({ showStats, isOwner }) {
  return (
    <div style={{
      background: isOwner ? '#0A0908' : '#1A1916', color: '#fff',
      padding: '64px 16px 10px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 12, borderBottom: '1px solid #000', flexShrink: 0,
    }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase' }}>
          {isOwner ? 'OWNER // MANAGE' : 'GANGHWA // GUIDEBOOK'}
        </div>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 800,
          letterSpacing: '-.01em', marginTop: 1, color: '#fff',
        }}>
          어디가시꺄{isOwner && <span style={{ fontSize: 11, color: '#FFB199', fontWeight: 600, marginLeft: 6 }}>· 가게 관리</span>}
        </div>
      </div>
      {showStats && (
        <div style={{ display: 'flex', gap: 14, fontSize: 10, lineHeight: 1.2 }}>
          <Stat label="열린 가게" value={window.PLACES.filter(p => window.getOpenStatus(p, window.NOW).state === 'open').length} />
          <Stat label="오늘 프로그램" value={window.PROGRAMS.filter(p => p.day === window.NOW.day).length} />
        </div>
      )}
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ color: 'rgba(255,255,255,.55)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginTop: 1 }}>{value}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TabBar — bottom tab navigation
// ════════════════════════════════════════════════════════════
function TabBar({ activeTab, onChange, planCount, wishCount }) {
  return (
    <div style={{
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
      display: 'flex', padding: '6px 0 34px',
      flexShrink: 0,
    }}>
      {TABS.map(t => {
        const active = activeTab === t.id;
        const badge = t.id === 'planner' ? planCount : t.id === 'wish' ? wishCount : null;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, background: 'transparent', border: 'none',
            padding: '8px 0 4px', cursor: 'pointer', fontFamily: 'inherit',
            color: active ? 'var(--green)' : 'var(--text-sub)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ position: 'relative', fontSize: 18, lineHeight: 1 }}>
              <TabIcon id={t.id} active={active} />
              {!!badge && (
                <span style={{
                  position: 'absolute', top: -4, right: -10,
                  background: 'var(--danger)', color: '#fff',
                  fontSize: 9, fontWeight: 800, padding: '1px 4px',
                  borderRadius: 8, lineHeight: 1.2,
                }}>{badge}</span>
              )}
            </span>
            <span style={{
              fontSize: 10, fontWeight: active ? 800 : 600,
              letterSpacing: '.02em',
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TabIcon({ id, active }) {
  const stroke = active ? 'var(--green)' : 'var(--text-sub)';
  const sw = 1.6;
  if (id === 'explore') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="6" stroke={stroke} strokeWidth={sw}/>
      <path d="M13.5 13.5L17 17" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
  if (id === 'planner') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke={stroke} strokeWidth={sw}/>
      <path d="M3 8H17" stroke={stroke} strokeWidth={sw}/>
      <path d="M7 2.5V5" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M13 2.5V5" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      <circle cx="7" cy="12" r="1" fill={stroke}/>
      <circle cx="10" cy="12" r="1" fill={stroke}/>
      <circle cx="13" cy="12" r="1" fill={stroke}/>
    </svg>
  );
  if (id === 'wish') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={active ? stroke : 'none'}>
      <path d="M10 17S3 12.5 3 7.5C3 5 5 3.5 6.8 3.5C8.2 3.5 9.3 4.3 10 5.5C10.7 4.3 11.8 3.5 13.2 3.5C15 3.5 17 5 17 7.5C17 12.5 10 17 10 17Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
    </svg>
  );
  if (id === 'brag') return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="5" width="14" height="11" rx="2" stroke={stroke} strokeWidth={sw}/>
      <circle cx="10" cy="10.5" r="3" stroke={stroke} strokeWidth={sw}/>
      <path d="M6.5 5L7.5 3H12.5L13.5 5" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
    </svg>
  );
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
