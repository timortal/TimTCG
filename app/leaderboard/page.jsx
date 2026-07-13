'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import { RARITY_CONFIG } from '@/lib/cards'

export default function LeaderboardPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [timcash, setTimcash] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const u = {
          id: session.user.id,
          username: session.user.user_metadata?.name || session.user.user_metadata?.preferred_username,
          avatar: session.user.user_metadata?.avatar_url,
        }
        setUser(u)
        const res = await fetch(`/api/wizebot/balance?username=${u.username}`)
        if (res.ok) { const d = await res.json(); setTimcash(d.balance) }
      }

      // Charger le classement (nombre de cartes uniques par user)
      const { data } = await supabase
        .from('collection')
        .select('user_id, card_id, profiles(twitch_username, twitch_avatar)')

      if (data) {
        const userMap = {}
        data.forEach(row => {
          const uid = row.user_id
          if (!userMap[uid]) {
            userMap[uid] = {
              username: row.profiles?.twitch_username || 'Inconnu',
              avatar: row.profiles?.twitch_avatar,
              unique: new Set(),
              total: 0,
            }
          }
          userMap[uid].unique.add(row.card_id)
          userMap[uid].total += 1
        })

        const sorted = Object.entries(userMap)
          .map(([uid, v]) => ({ uid, ...v, uniqueCount: v.unique.size }))
          .sort((a, b) => b.uniqueCount - a.uniqueCount)
          .slice(0, 20)

        setLeaderboard(sorted)
      }
      setLoading(false)
    }
    load()
  }, [])

  const medals = ['🥇', '🥈', '🥉']
  const rankColors = ['#FFD700', '#94A3B8', '#CD7F32']

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a' }}>
      <Header user={user} timcash={timcash} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 900, marginBottom: 8,
          color: '#FFD700', fontFamily: "'Arial Black', sans-serif", letterSpacing: 1,
        }}>🏆 Classement</h1>
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 36 }}>
          Classé par nombre de cartes uniques collectées
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>Chargement…</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🃏</div>
            Personne n'a encore ouvert de paquet. Sois le premier !
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard.map((entry, i) => {
              const isMine = user?.id === entry.uid
              return (
                <div key={entry.uid} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: isMine ? '#1e2d4a' : i < 3 ? '#0f172a' : '#070d1a',
                  border: `1px solid ${isMine ? '#FFD70066' : i < 3 ? rankColors[i] + '33' : '#1e3a5f'}`,
                  borderRadius: 14, padding: '16px 20px',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  {/* Rang */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: i < 3 ? rankColors[i] + '22' : '#1e293b',
                    border: `2px solid ${i < 3 ? rankColors[i] : '#334155'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: i < 3 ? 18 : 14, fontWeight: 900,
                    color: i < 3 ? rankColors[i] : '#64748b',
                  }}>
                    {i < 3 ? medals[i] : i + 1}
                  </div>

                  {/* Avatar */}
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>🎮</div>
                  )}

                  {/* Infos */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 15,
                      color: isMine ? '#FFD700' : '#e2e8f0',
                    }}>
                      {entry.username} {isMine && '(moi)'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {entry.total} cartes au total
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: i < 3 ? rankColors[i] : '#e2e8f0',
                      fontWeight: 800, fontSize: 20,
                      fontFamily: "'Arial Black', sans-serif",
                    }}>
                      {entry.uniqueCount}
                    </div>
                    <div style={{ color: '#475569', fontSize: 11 }}>uniques</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
