'use client'
import { RARITY_CONFIG } from '@/lib/cards'

export default function FifaCard({ card, size = 'normal', flipped = false, onClick, glowing = false, locked = false }) {
  const isSmall = size === 'small'
  const w = isSmall ? 110 : 200
  const h = isSmall ? 154 : 280
  const rarityInfo = RARITY_CONFIG[card.rarity]
  const statEntries = Object.entries(card.stats)

  return (
    <div
      onClick={onClick}
      style={{
        width: w, height: h,
        perspective: 800,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div style={{
        width: '100%', height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* DOS */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: isSmall ? 8 : 14,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          border: '2px solid #334155',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: isSmall ? 28 : 52, opacity: 0.4 }}>🃏</span>
        </div>

        {/* FACE */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: isSmall ? 8 : 14,
          background: card.bg,
          border: `${isSmall ? 1.5 : 2.5}px solid ${card.color}55`,
          overflow: 'hidden',
          boxShadow: glowing
            ? `0 0 30px ${card.glow}99, 0 0 60px ${card.glow}44`
            : '0 4px 24px #00000088',
          display: 'flex', flexDirection: 'column',
          filter: locked ? 'grayscale(1) brightness(0.4)' : 'none',
        }}>
          {/* Shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${card.color}18 0%, transparent 50%, ${card.color}0a 100%)`,
            pointerEvents: 'none',
          }} />

          {/* HEADER */}
          <div style={{
            padding: isSmall ? '6px 7px 4px' : '12px 14px 8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                fontSize: isSmall ? 18 : 34, fontWeight: 900, color: card.color,
                lineHeight: 1, fontFamily: "'Arial Black', sans-serif",
                textShadow: `0 0 12px ${card.glow}`,
              }}>{card.number}</span>
              <span style={{ fontSize: isSmall ? 7 : 12, color: card.color + 'cc', letterSpacing: 1, marginTop: 1 }}>
                {card.flag}
              </span>
              <span style={{ fontSize: isSmall ? 8 : 14, marginTop: 2 }}>{card.club}</span>
            </div>
            <div style={{
              background: card.color + '22', borderRadius: isSmall ? 4 : 8,
              padding: isSmall ? '2px 5px' : '4px 10px',
              border: `1px solid ${card.color}44`,
            }}>
              <span style={{
                fontSize: isSmall ? 6 : 9, color: card.color,
                fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
              }}>{rarityInfo.label}</span>
            </div>
          </div>

          {/* AVATAR */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: isSmall ? 60 : 110, height: isSmall ? 60 : 110,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${card.color}33 0%, ${card.glow}11 100%)`,
              border: `${isSmall ? 2 : 3}px solid ${card.color}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isSmall ? 30 : 56,
              boxShadow: `0 0 20px ${card.glow}44`,
            }}>
              {card.avatar || '🎭'}
            </div>
          </div>

          {/* NOM */}
          <div style={{ textAlign: 'center', padding: isSmall ? '0 6px 4px' : '0 10px 8px', position: 'relative', zIndex: 1 }}>
            <div style={{
              color: card.color, fontSize: isSmall ? 9 : 14, fontWeight: 900,
              letterSpacing: isSmall ? 1 : 2, textTransform: 'uppercase',
              fontFamily: "'Arial Black', sans-serif",
              textShadow: `0 0 10px ${card.glow}`,
            }}>{card.name}</div>
            <div style={{ color: '#94A3B8', fontSize: isSmall ? 7 : 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
              {card.role}
            </div>
          </div>

          {/* STATS */}
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            borderTop: `1px solid ${card.color}33`,
            padding: isSmall ? '4px 7px' : '8px 12px',
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: isSmall ? 2 : 4,
          }}>
            {statEntries.map(([key, val]) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{
                  color: card.color, fontSize: isSmall ? 10 : 16,
                  fontWeight: 900, lineHeight: 1,
                  fontFamily: "'Arial Black', sans-serif",
                }}>{val}</div>
                <div style={{
                  color: '#64748B', fontSize: isSmall ? 5 : 8,
                  letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 1,
                }}>{key}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay cadenas si non débloquée */}
      {locked && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isSmall ? 20 : 36, pointerEvents: 'none',
        }}>🔒</div>
      )}
    </div>
  )
}
