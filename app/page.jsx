'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import FifaCard from '@/components/FifaCard'
import PackOpener from '@/components/PackOpener'
import { CARDS, RARITY_CONFIG, PACKS, generatePack, canAccessPack } from '@/lib/cards'

// ─── Sélection aléatoire des cartes vitrine ───────────────────────────────────
function getShowcaseCards(cards) {
  const legendaries = cards.filter(c => c.rarity === 'legendary')
  const epics = cards.filter(c => c.rarity === 'epic')
  const card1 = legendaries[Math.floor(Math.random() * legendaries.length)]
  const card2 = epics[Math.floor(Math.random() * epics.length)]
  const remaining = cards.filter(c => c.id !== card1?.id && c.id !== card2?.id)
  const card3 = remaining[Math.floor(Math.random() * remaining.length)]
  return [card1, card2, card3].filter(Boolean)
}

// ─── Composant carte paquet ───────────────────────────────────────────────────
function PackCard({ pack, user, timcash, userRoles, onBuy, loading }) {
  const hasAccess = canAccessPack(pack, userRoles)
  const canBuy = user && timcash !== null && timcash >= pack.cost && hasAccess && !loading && pack.available
  const isLocked = !pack.available
  const isRestricted = pack.available && pack.access === 'exclusive' && !hasAccess

  return (
    <div style={{
      background: pack.bg,
      border: `1px solid ${pack.border}`,
      borderRadius: 24, padding: '32px 28px',
      textAlign: 'center', position: 'relative',
      overflow: 'hidden', flex: '1 1 220px', maxWidth: 280,
      opacity: isLocked ? 0.6 : 1,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${pack.color}22` } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 0%, ${pack.color}11 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {isRestricted && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: '#FF8C0022', border: '1px solid #FF8C0066',
          borderRadius: 6, padding: '3px 8px',
          fontSize: 10, color: '#FF8C00', fontWeight: 700,
        }}>Sub / VIP / Modo</div>
      )}

      {isLocked && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: '#EC489922', border: '1px solid #EC489966',
          borderRadius: 6, padding: '3px 8px',
          fontSize: 10, color: '#EC4899', fontWeight: 700,
        }}>Bientôt</div>
      )}

      <div style={{ fontSize: 52, marginBottom: 12 }}>{pack.emoji}</div>
      <div style={{
        color: pack.color, fontSize: 18, fontWeight: 900,
        fontFamily: "'Arial Black', sans-serif", letterSpacing: 1, marginBottom: 6,
      }}>{pack.name}</div>
      <div style={{ color: '#64748b', fontSize: 12, marginBottom: 16 }}>{pack.description}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {Object.entries(pack.dropRates).map(([rarity, rate]) => (
          <div key={rarity} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '2px 8px',
            background: RARITY_CONFIG[rarity].color + '11',
            borderRadius: 6,
          }}>
            <span style={{ fontSize: 10, color: RARITY_CONFIG[rarity].color, fontWeight: 600 }}>
              {RARITY_CONFIG[rarity].label}
            </span>
            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>{rate}%</span>
          </div>
        ))}
      </div>

      {pack.available && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: pack.color, fontFamily: "'Arial Black', sans-serif" }}>
            {pack.cost.toLocaleString()}
          </div>
          <div style={{ color: '#94A3B8', fontSize: 12 }}>TimCash</div>
        </div>
      )}

      <button
        onClick={() => canBuy && onBuy(pack.id)}
        disabled={!canBuy}
        style={{
          width: '100%', padding: '12px',
          background: canBuy ? `linear-gradient(135deg, ${pack.color}, ${pack.color}aa)` : '#1e293b',
          border: 'none', borderRadius: 12,
          color: canBuy ? '#000' : '#475569',
          fontSize: 13, fontWeight: 800,
          cursor: canBuy ? 'pointer' : 'not-allowed',
          letterSpacing: 0.5, textTransform: 'uppercase',
          boxShadow: canBuy ? `0 4px 16px ${pack.color}44` : 'none',
          transition: 'all 0.2s',
        }}
      >
        {isLocked ? '🔮 Bientôt disponible'
          : !user ? '🔒 Connecte-toi'
          : isRestricted ? '🔒 Accès restreint'
          : loading ? '⏳ Ouverture…'
          : timcash === null ? '⏳ Chargement…'
          : timcash < pack.cost ? `⚠️ ${(pack.cost - timcash).toLocaleString()} manquants`
          : `⚡ Ouvrir`}
      </button>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ShopPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [timcash, setTimcash] = useState(null)
  const [userRoles, setUserRoles] = useState([])
  const [openingPack, setOpeningPack] = useState(null)
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showcaseCards] = useState(() => getShowcaseCards(CARDS))

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const username = session.user.user_metadata?.name || session.user.user_metadata?.preferred_username
      setUser({ id: session.user.id, username, avatar: session.user.user_metadata?.avatar_url })

      const balRes = await fetch(`/api/wizebot/balance?username=${username}`)
      if (balRes.ok) { const d = await balRes.json(); setTimcash(d.balance) }

      const rolesRes = await fetch(`/api/twitch?username=${username}`)
      if (rolesRes.ok) { const d = await rolesRes.json(); setUserRoles(d.roles || []) }
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        const username = session.user.user_metadata?.name || session.user.user_metadata?.preferred_username
        setUser({ id: session.user.id, username, avatar: session.user.user_metadata?.avatar_url })
      } else {
        setUser(null); setTimcash(null); setUserRoles([])
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleBuyPack = async (packId) => {
    const pack = PACKS[packId]
    if (!user || !pack) return
    if (!canAccessPack(pack, userRoles)) { showNotif("Tu n'as pas accès à ce paquet.", 'error'); return }
    if (timcash < pack.cost) { showNotif(`Pas assez de TimCash ! (${pack.cost} requis)`, 'error'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/wizebot/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, amount: pack.cost }),
      })
      if (!res.ok) throw new Error('Impossible de débiter le TimCash')
      setTimcash(t => t - pack.cost)
      setOpeningPack({ cards: generatePack(packId), packId })
    } catch (e) {
      showNotif(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePackDone = async () => {
    if (!user || !openingPack) return
    try {
      const inserts = openingPack.cards.map(card => ({ user_id: user.id, card_id: card.id }))
      await supabase.from('collection').insert(inserts)
      await supabase.from('pack_history').insert({
        user_id: user.id,
        cards_obtained: openingPack.cards.map(c => c.id),
        timcash_spent: PACKS[openingPack.packId]?.cost || 0,
      })
      showNotif('5 cartes ajoutées à ta collection ! 🃏')
    } catch (e) {
      showNotif('Cartes obtenues mais erreur de sauvegarde', 'error')
    }
    setOpeningPack(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a' }}>
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 200,
          background: notification.type === 'error' ? '#7f1d1d' : '#064e3b',
          border: `1px solid ${notification.type === 'error' ? '#dc2626' : '#10b981'}`,
          color: notification.type === 'error' ? '#fca5a5' : '#6ee7b7',
          padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'slideIn 0.3s ease',
        }}>{notification.msg}</div>
      )}

      {openingPack && <PackOpener pack={openingPack.cards} onDone={handlePackDone} />}

      <Header user={user} timcash={timcash} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h1 style={{
            fontSize: 48, fontWeight: 900, margin: 0,
            fontFamily: "'Arial Black', sans-serif",
            background: 'linear-gradient(135deg, #FFD700, #FF8C00, #FFD700)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 2,
          }}>
            TIM<span style={{ WebkitTextFillColor: '#fff' }}>CARDS</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 10, letterSpacing: 1 }}>
            Collectionne les cartes de la communauté en revivant les grands moments du stream
          </p>
        </div>

        {/* Cartes vitrine */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 56, flexWrap: 'wrap' }}>
          {showcaseCards.map((card, i) => (
            <div key={card.id} style={{ transform: `rotate(${(i - 1) * 3}deg)`, transition: 'transform 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = `rotate(${(i - 1) * 3}deg)`}
            >
              <FifaCard card={card} flipped={true} glowing={card.rarity === 'legendary'} />
            </div>
          ))}
        </div>

        {/* Titre paquets */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' }}>
            Choisir un paquet
          </div>
        </div>

        {/* Grille des 4 paquets */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {Object.values(PACKS).map(pack => (
            <PackCard key={pack.id} pack={pack} user={user} timcash={timcash}
              userRoles={userRoles} onBuy={handleBuyPack} loading={loading} />
          ))}
        </div>

        {/* Solde */}
        {user && timcash !== null && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Ton solde : <span style={{ color: '#FFD700', fontWeight: 700 }}>{timcash.toLocaleString()} TimCash</span>
            </span>
          </div>
        )}

        {/* Bandeau comment gagner */}
        <div style={{ background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 20, padding: '28px 32px' }}>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 22, textAlign: 'center' }}>
            Comment gagner des TimCashs ?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px 28px' }}>
            {[
              { icon: '📺', label: 'Regarder le stream', amount: '+2 / 15 min' },
              { icon: '⭐', label: 'Être sub', amount: '+10 / 15 min' },
              { icon: '💎', label: 'Membre du Club (VIP)', amount: '+20 / 15 min' },
              { icon: '💬', label: 'Chatter', amount: '+0.05 par message' },
              { icon: '💎', label: 'Prime de VIP', amount: '+2000' },
              { icon: '🎯', label: 'Évènements spéciaux', amount: 'Bonus' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center', padding: '8px 4px' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>{item.label}</span>
                <span style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>{item.amount}</span>
              </div>
            ))}
          </div>
          <div style={{ color: '#475569', fontSize: 11, marginTop: 20, textAlign: 'center' }}>
            Attribution automatique par Wizebot sur le stream de Timortal
          </div>
        </div>
      </main>
    </div>
  )
}


