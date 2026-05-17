// components.jsx — shared building blocks for 강화 가이드북

const { useState, useEffect, useRef, Fragment } = React;

// ────────────────────────────────────────────────────────────
// Sticker — small all-caps badge
// ────────────────────────────────────────────────────────────
function Sticker({ children, tone = 'event' }) {
  const tones = {
    event:  { bg: 'var(--sticker-event)',  fg: '#fff' },
    sea:    { bg: 'var(--sticker-4k)',     fg: '#fff' },
    film:   { bg: 'var(--sticker-film)',   fg: '#fff' },
    morning:{ bg: 'var(--sticker-morning)',fg: '#fff' },
    free:   { bg: 'var(--free-bg)',        fg: 'var(--free-text)' },
    warn:   { bg: '#FEF3C7',               fg: '#92400e' },
    soft:   { bg: 'var(--surface2)',       fg: 'var(--text-muted)' },
  };
  const t = tones[tone] || tones.event;
  return (
    <span style={{
      display: 'inline-block', fontSize: 9, fontWeight: 800,
      background: t.bg, color: t.fg,
      padding: '2px 5px', borderRadius: 3, whiteSpace: 'nowrap',
      letterSpacing: '.04em', textTransform: 'uppercase', lineHeight: 1.3,
    }}>{children}</span>
  );
}

// ────────────────────────────────────────────────────────────
// PlacePhoto — flat color block with a single typographic mark.
// (Design system is image-free; we follow it.)
// ────────────────────────────────────────────────────────────
function PlacePhoto({ initial, color, altColor, w = 80, h = 110, radius = 8, size }) {
  const fontSize = size || Math.min(w, h) * 0.42;
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: color, color: altColor || '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontFamily: "var(--font-serif)", fontStyle: 'italic',
      fontSize, lineHeight: 1, overflow: 'hidden', userSelect: 'none',
    }}>
      {initial}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// OpenIndicator — open-now state, the hero affordance
// ────────────────────────────────────────────────────────────
function OpenIndicator({ status, size = 'sm' }) {
  const map = {
    'open':         { dot: 'var(--green)',  fg: 'var(--green)',     bg: 'var(--green-light)' },
    'closing':      { dot: '#E65100',       fg: '#9B3A00',          bg: '#FFF1E0' },
    'soon':         { dot: '#666',          fg: 'var(--text-muted)',bg: 'var(--surface2)' },
    'closed':       { dot: '#B0AFAA',       fg: 'var(--text-sub)',  bg: 'var(--surface2)' },
    'closed-today': { dot: 'var(--danger)', fg: 'var(--danger)',    bg: '#FCE8E6' },
  };
  const c = map[status.state] || map.closed;
  const px = size === 'lg' ? { padX: 10, padY: 5, fs: 12, dot: 7 } : { padX: 7, padY: 3, fs: 11, dot: 6 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.fg,
      padding: `${px.padY}px ${px.padX}px`, borderRadius: 12,
      fontSize: px.fs, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: px.dot, height: px.dot, borderRadius: '50%', background: c.dot,
        boxShadow: status.state === 'open' ? `0 0 0 3px ${c.dot}22` : 'none',
      }} />
      {status.label}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// PillChip — filter chips (active = solid dark fill, per system)
// ────────────────────────────────────────────────────────────
function PillChip({ active, onClick, children, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
        padding: '6px 12px', borderRadius: 20,
        border: `1.5px solid ${active ? 'var(--text)' : 'var(--border)'}`,
        background: active ? 'var(--text)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--text-muted)',
        cursor: 'pointer', transition: 'all .12s', whiteSpace: 'nowrap',
        userSelect: 'none', lineHeight: 1.2,
      }}>
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// PlaceCard — main 카드 (Explore default layout)
// ────────────────────────────────────────────────────────────
function PlaceCard({ place, onClick, onWish, wished }) {
  const status = window.getOpenStatus(place, window.NOW);
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
      display: 'flex', cursor: 'pointer', boxShadow: 'var(--shadow)',
      opacity: status.state === 'closed' || status.state === 'closed-today' ? 0.78 : 1,
    }}>
      <PlacePhoto initial={place.initial} color={place.color} altColor={place.altColor} w={92} h={124} radius={0} />
      <div style={{ flex: 1, minWidth: 0, padding: '11px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.25, color: 'var(--text)' }}>{place.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2, letterSpacing: '.02em' }}>
              {place.type} · {place.area}{place.free && ' · 무료'}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onWish && onWish(); }}
            aria-label="찜"
            style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              border: 'none', background: 'transparent',
              fontSize: 16, lineHeight: 1, cursor: 'pointer',
              color: wished ? 'var(--danger)' : 'var(--text-sub)',
            }}>{wished ? '♥' : '♡'}</button>
        </div>

        <div><OpenIndicator status={status} /></div>

        {place.note && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45 }}>{place.note}</div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
          {place.tags && place.tags.slice(0, 3).map(t => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
              background: 'var(--surface2)', padding: '2px 6px', borderRadius: 3,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SectionHeader — "오늘의 …" editorial italic
// ────────────────────────────────────────────────────────────
function SectionHeader({ children, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, margin: '4px 0 12px' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
        fontSize: 22, lineHeight: 1.1, color: 'var(--text)', margin: 0,
        whiteSpace: 'nowrap',
      }}>{children}</h2>
      {sub && <span style={{ fontSize: 11, color: 'var(--text-sub)', whiteSpace: 'nowrap', flexShrink: 0 }}>{sub}</span>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// BottomSheet — slide-up modal for Place Detail
// ────────────────────────────────────────────────────────────
function BottomSheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      pointerEvents: 'auto',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(26, 25, 22, 0.45)',
        animation: 'fadein .16s ease',
      }} />
      <div style={{
        position: 'relative', background: 'var(--surface)',
        borderRadius: '18px 18px 0 0',
        maxHeight: '88%', overflow: 'auto',
        animation: 'slideup .22s ease',
        boxShadow: '0 -8px 24px rgba(0,0,0,.15)',
        paddingBottom: 34,
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: 'var(--border)',
          margin: '10px auto 0',
        }} />
        {children}
      </div>
    </div>
  );
}

Object.assign(window, {
  Sticker, PlacePhoto, OpenIndicator, PillChip, PlaceCard,
  SectionHeader, BottomSheet,
});
