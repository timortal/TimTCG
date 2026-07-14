'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import FifaCard from '@/components/FifaCard'
import PackOpener from '@/components/PackOpener'
import { CARDS, RARITY_CONFIG, PACK_COST, generatePack } from '@/lib/cards'

// ─── Sélection aléatoire des cartes vitrine ───────────────────────────────────
function getShowcaseCards(cards) {
  const legendaries = cards.filter(c => c.rarity === 'legendary')
  const epics = cards.filter(c => c.rarity === 'epic')

  // Carte 1 : légendaire aléatoire
  const card1 = legendaries[Math.floor(Math.random() * legendaries.length)]

  // Carte 2 : épique aléatoire
  const card2 = epics[Math.floor(Math.random() * epics.length)]

  // Carte 3 : totalement aléatoire, différente des deux premières
  const remaining = cards.filter(c => c.id !== card1?.id && c.id !== card2?.id)
  const card3 = remaining[Math.floor(Math.random() * remaining.length)]

  return [card1, card2, card3].filter(Boolean)
}

export default function ShopPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [timcash, setTimcash] = useState(null)
  const [openingPack, setOpeningPack] = useState(null)
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)

  // Tirage unique au chargement de la page
  const [showcaseCards] = useState(() => getShowcaseCards(CARDS))

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  // Charger l'utilisateur connecté
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      setUser({
        id: session.user.id,
        username: session.user.user_metadata?.name || session.user.user_metadata?.preferred_username,
        avatar: session.user.user_metadata?.avatar_url,
      })

      // Charger le profil et le solde TimCash via Wizebot
      const res = await fetch(`/api/wizebot/balance?username=${session.user.user_metadata?.name}`)
      if (res.ok) {
        const data = await res.json()
        setTimcash(data.balance)
      }
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          username: session.user.user_metadata?.name || session.user.user_metadata?.preferred_username,
          avatar: session.user.user_metadata?.avatar_url,
        })
      } else {
        setUser(null)
        setTimcash(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleBuyPack = async () => {
    if (!user) { showNotif('Connecte-toi avec Twitch !', 'error'); return }
    if (timcash === null || timcash < PACK_COST) {
      showNotif(`Pas assez de TimCash ! (${PACK_COST} requis)`, 'error'); return
    }
    setLoading(true)
    try {
      // Débiter le TimCash via Wizebot
      const res = await fetch('/api/wizebot/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, amount: PACK_COST }),
      })
      if (!res.ok) throw new Error('Impossible de débiter le TimCash')
      setTimcash(t => t - PACK_COST)
      setOpeningPack(generatePack())
    } catch (e) {
      showNotif(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePackDone = async (pack) => {
    if (!user) return
    try {
      // Sauvegarder les cartes obtenues en base
      const inserts = pack.map(card => ({ user_id: user.id, card_id: card.id }))
      await supabase.from('collection').insert(inserts)

      // Historique
      await supabase.from('pack_history').insert({
        user_id: user.id,
        cards_obtained: pack.map(c => c.id),
        timcash_spent: PACK_COST,
      })
      showNotif('5 cartes ajoutées à ta collection ! 🃏')
    } catch (e) {
      showNotif('Cartes obtenues mais erreur de sauvegarde', 'error')
    }
    setOpeningPack(null)
  }

  const canBuy = user && timcash !== null && timcash >= PACK_COST && !loading

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 200,
          background: notification.type === 'error' ? '#7f1d1d' : '#064e3b',
          border: `1px solid ${notification.type === 'error' ? '#dc2626' : '#10b981'}`,
          color: notification.type === 'error' ? '#fca5a5' : '#6ee7b7',
          padding: '12px 24px', borderRadius: 12,
          fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.3s ease',
        }}>{notification.msg}</div>
      )}

      {openingPack && <PackOpener pack={openingPack} onDone={() => handlePackDone(openingPack)} />}

      <Header user={user} timcash={timcash} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h1 style={{
            fontSize: 48, fontWeight: 900, margin: 0,
            fontFamily: "'Arial Black', sans-serif",
            background: 'linear-gradient(135deg, #FFD700, #FF8C00, #FFD700)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: 2,
          }}>
            TIM<span style={{ WebkitTextFillColor: '#fff' }}>CARDS</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 10, letterSpacing: 1 }}>
            Collectionne les cartes de la communauté en revivant les grands moments du stream
          </p>
        </div>

        {/* Aperçu cartes — aléatoires à chaque visite */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 56, flexWrap: 'wrap' }}>
          {showcaseCards.map((card, i) => (
            <div key={card.id} style={{
              transform: `rotate(${(i - 1) * 3}deg)`,
              transition: 'transform 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = `rotate(${(i - 1) * 3}deg)`}
            >
              <FifaCard card={card} flipped={true} glowing={card.rarity === 'legendary'} />
            </div>
          ))}
        </div>

        {/* Bloc achat paquet */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 40 }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e2d4a 50%, #0f172a 100%)',
            border: '1px solid #FFD70033',
            borderRadius: 24, padding: '40px',
            textAlign: 'center', position: 'relative',
            overflow: 'hidden', maxWidth: 400, flex: '1 1 340px',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 0%, #FFD70011 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <div style={{
              color: '#FFD700', fontSize: 22, fontWeight: 900,
              fontFamily: "'Arial Black', sans-serif", letterSpacing: 1, marginBottom: 8,
            }}>Paquet Standard</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              5 cartes · Toutes raretés possibles
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              {Object.entries(RARITY_CONFIG).map(([r, info]) => (
                <div key={r} style={{
                  fontSize: 10, color: info.color,
                  background: info.color + '15', border: `1px solid ${info.color}33`,
                  borderRadius: 6, padding: '3px 10px', fontWeight: 600,
                }}>{info.label} — {info.dropRate}%</div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#FFD700', fontFamily: "'Arial Black', sans-serif" }}>
                {PACK_COST.toLocaleString()}
              </div>
              <div style={{ color: '#94A3B8', fontSize: 13 }}>TimCash</div>
            </div>

            <button onClick={handleBuyPack} disabled={!canBuy} style={{
              width: '100%', padding: '16px',
              background: canBuy ? 'linear-gradient(135deg, #FFD700, #FF8C00)' : '#1e293b',
              border: 'none', borderRadius: 14,
              color: canBuy ? '#000' : '#475569',
              fontSize: 16, fontWeight: 800,
              cursor: canBuy ? 'pointer' : 'not-allowed',
              letterSpacing: 1, textTransform: 'uppercase',
              boxShadow: canBuy ? '0 4px 24px #FFD70044' : 'none',
              transition: 'all 0.2s',
            }}>
              {!user ? '🔒 Connecte-toi pour jouer'
                : loading ? '⏳ Ouverture…'
                : timcash === null ? '⏳ Chargement solde…'
                : timcash < PACK_COST ? `⚠️ Pas assez de TimCash`
                : '⚡ Ouvrir un paquet'}
            </button>

            {user && timcash !== null && (
              <div style={{
                marginTop: 14, fontSize: 12,
                color: timcash >= PACK_COST ? '#34d399' : '#f87171',
              }}>
                Solde actuel : {timcash.toLocaleString()} TimCash
                {timcash >= PACK_COST
                  ? ` · Reste : ${(timcash - PACK_COST).toLocaleString()} après ouverture`
                  : ` · Manque : ${(PACK_COST - timcash).toLocaleString()} TimCash`}
              </div>
            )}
          </div>
        </div>

        {/* Bandeau horizontal — Comment gagner du TimCash */}
        <div style={{
          background: '#0f172a', border: '1px solid #1e3a5f',
          borderRadius: 20, padding: '28px 32px',
        }}>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 22, textAlign: 'center' }}>
            Comment gagner des TimCashs ?
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '18px 28px',
          }}>
            {[
              { icon: '📺', label: 'Regarder le stream', amount: '+2 / 15 min' },
              { icon: '⭐', label: 'Être sub', amount: '+10 / 15 min' },
              { icon: '💎', label: 'Membre du Club (VIP)', amount: '+20 / 15 min' },
              { icon: '💬', label: 'Chatter', amount: '+0.05 par message' },
              { icon: '💎', label: 'Prime de VIP', amount: '+2000' },
              { icon: '🎯', label: 'Évènements spéciaux', amount: 'Bonus' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                textAlign: 'center', padding: '8px 4px',
              }}>
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

