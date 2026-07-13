'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image' import logo from '@/assets/Tim_Logo_Full.png'

const TABS = [
  { href: '/',            label: 'Boutique',   icon: '🛍️' },
  { href: '/collection', label: 'Collection', icon: '📦' },
  { href: '/leaderboard', label: 'Classement', icon: '🏆' },
]

export default function Header({ user, timcash }) {
  const pathname = usePathname()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header style={{
      borderBottom: '1px solid #1e3a5f',
      background: 'rgba(7,13,26,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50,
      padding: '0 32px',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src={logo} alt="TimCards" width={32} height={32} />
          <div>
            <div style={{
              color: '#FFD700', fontWeight: 900, fontSize: 18,
              letterSpacing: 1, fontFamily: "'Arial Black', sans-serif", lineHeight: 1,
            }}>
              TIM<span style={{ color: '#fff' }}>CARDS</span>
            </div>
            <div style={{ color: '#475569', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>
              Community TCG
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '8px 18px',
                background: pathname === tab.href ? '#FFD70022' : 'transparent',
                border: pathname === tab.href ? '1px solid #FFD70066' : '1px solid transparent',
                borderRadius: 8,
                color: pathname === tab.href ? '#FFD700' : '#64748b',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* User */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#0f172a', border: '1px solid #1e3a5f',
              borderRadius: 10, padding: '8px 14px',
            }}>
              {user.avatar && (
                <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1 }}>
                  {user.username}
                </div>
                <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700, marginTop: 2 }}>
                  💰 {timcash !== null ? timcash.toLocaleString() : '...'} TimCash
                </div>
              </div>
            </div>
            <button onClick={handleLogout} style={{
              padding: '8px 14px',
              background: 'transparent', border: '1px solid #334155',
              borderRadius: 8, color: '#64748b',
              fontSize: 12, cursor: 'pointer',
            }}>
              Déco
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #9147ff, #6441a5)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 4px 16px #9147ff44',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
            </svg>
            {loading ? 'Connexion…' : 'Connexion Twitch'}
          </button>
        )}
      </div>
    </header>
  )
}
