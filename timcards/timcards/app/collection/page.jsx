'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import FifaCard from '@/components/FifaCard'
import { CARDS, RARITY_CONFIG } from '@/lib/cards'

export default function CollectionPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [timcash, setTimcash] = useState(null)
  const [ownedCards, setOwnedCards] = useState({}) // { card_id: count }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const u = {
        id: session.user.id,
        username: session.user.user_metadata?.name || session.user.user_metadata?.preferred_username,
        avatar: session.user.user_metadata?.avatar_url,
      }
      setUser(u)

      // Charger la collection
      const { data: collection } = await supabase
        .from('collection')
        .select('card_id')
        .eq('user_id', session.user.id)

      const counts = {}
      collection?.forEach(row => {
        counts[row.card_id] = (counts[row.card_id] || 0) + 1
      })
      setOwnedCards(counts)

      // Solde Wizebot
      const res = await fetch(`/api/wizebot/balance?username=${u.username}`)
      if (res.ok) {
        const data = await res.json()
        setTimcash(data.balance)
      }

      setLoading(false)
    }
    load()
  }, [])

  const totalOwned = Object.keys(ownedCards).length
  const totalCards = CARDS.length

  const byRarity = { legendary: [], epic: [], rare: [], common: [] }
  CARDS.forEach(card => {
    byRarity[card.rarity].push({ ...card, count: ownedCards[card.id] || 0 })
  })

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a' }}>
      <Header user={user} timcash={timcash} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 900, marginBottom: 32,
          color: '#FFD700', fontFamily: "'Arial Black', sans-serif", letterSpacing: 1,
        }}>Ma Collection</h1>

        {!user && !loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Connecte-toi pour voir ta collection</div>
            <div style={{ fontSize: 14 }}>Utilise le bouton Twitch en haut à droite</div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
            Chargement…
          </div>
        ) : (
          <>
            {/* Progression */}
            <div style={{
              background: '#0f172a', border: '1px solid #1e3a5f',
              borderRadius: 16, padding: '20px 28px', marginBottom: 36,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#94A3B8', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Collection complétée
                </span>
                <span style={{ color: '#FFD700', fontWeight: 800, fontSize: 16 }}>
                  {totalOwned} / {totalCards}
                </span>
              </div>
              <div style={{ height: 8, background: '#1e293b', borderRadius: 8 }}>
                <div style={{
                  height: '100%',
                  width: `${totalCards > 0 ? (totalOwned / totalCards) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #FFD700, #FF8C00)',
                  borderRadius: 8, transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                {Object.entries(RARITY_CONFIG).map(([rarity, info]) => {
                  const cards = byRarity[rarity]
                  const owned = cards.filter(c => c.count > 0).length
                  return (
                    <div key={rarity} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.color }} />
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {info.label} : <span style={{ color: info.color, fontWeight: 700 }}>{owned}/{cards.length}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cartes par rareté */}
            {Object.entries(byRarity).map(([rarity, cards]) => (
              <div key={rarity} style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ height: 2, flex: 1, background: `${RARITY_CONFIG[rarity].color}44` }} />
                  <span style={{
                    color: RARITY_CONFIG[rarity].color,
                    fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
                  }}>{RARITY_CONFIG[rarity].label}</span>
                  <div style={{ height: 2, flex: 1, background: `${RARITY_CONFIG[rarity].color}44` }} />
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {cards.map(card => (
                    <div key={card.id} style={{ position: 'relative' }}>
                      <FifaCard
                        card={card}
                        flipped={card.count > 0}
                        locked={card.count === 0}
                        glowing={card.count > 0 && card.rarity === 'legendary'}
                      />
                      {card.count > 1 && (
                        <div style={{
                          position: 'absolute', top: 8, right: 8,
                          background: '#FFD700', color: '#000',
                          borderRadius: 20, padding: '2px 8px',
                          fontSize: 11, fontWeight: 800,
                        }}>×{card.count}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
