'use client'
import { useState, useEffect } from 'react'
import FifaCard from './FifaCard'

export default function PackOpener({ pack, onDone }) {
  const [step, setStep] = useState('shake')
  const [revealed, setRevealed] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [shakeAnim, setShakeAnim] = useState(false)

  useEffect(() => {
    setShakeAnim(true)
    const t1 = setTimeout(() => setShakeAnim(false), 300)
    const t2 = setTimeout(() => {
      setShakeAnim(true)
      setTimeout(() => {
        setShakeAnim(false)
        setTimeout(() => setStep('reveal'), 400)
      }, 300)
    }, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (step !== 'reveal') return
    if (currentIdx < pack.length) {
      const t = setTimeout(() => {
        setRevealed(prev => [...prev, pack[currentIdx]])
        setCurrentIdx(i => i + 1)
      }, currentIdx === 0 ? 200 : 600)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setStep('done'), 500)
      return () => clearTimeout(t)
    }
  }, [step, currentIdx, pack])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32,
    }}>
      {/* Particules fond */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 2, height: 2, borderRadius: '50%',
            background: '#ffffff22',
            animation: `twinkle ${1 + Math.random() * 2}s infinite alternate`,
          }} />
        ))}
      </div>

      {step === 'shake' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
          animation: shakeAnim ? 'shake 0.3s ease-in-out' : 'none',
        }}>
          <div style={{
            width: 140, height: 200,
            background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
            borderRadius: 16, border: '3px solid #FFD70066',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px #FFD70044', fontSize: 64,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #FFD70011, transparent, #FFD70011)',
            }} />
            📦
          </div>
          <div style={{ color: '#94A3B8', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>
            Ouverture en cours…
          </div>
        </div>
      )}

      {(step === 'reveal' || step === 'done') && (
        <>
          <div style={{ color: '#FFD700', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>
            {step === 'done' ? '✨ Tes cartes !' : `Carte ${Math.min(revealed.length + 1, pack.length)} / ${pack.length}`}
          </div>
          <div style={{
            display: 'flex', gap: 16, flexWrap: 'wrap',
            justifyContent: 'center', alignItems: 'center', maxWidth: 900,
          }}>
            {pack.map((card, i) => {
              const isRevealed = i < revealed.length
              return (
                <div key={i} style={{
                  transform: isRevealed ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.8)',
                  opacity: isRevealed ? 1 : 0,
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                  <FifaCard card={card} flipped={isRevealed} glowing={isRevealed && card.rarity === 'legendary'} />
                </div>
              )
            })}
          </div>
          {step === 'done' && (
            <button onClick={onDone} style={{
              marginTop: 8, padding: '14px 40px',
              background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
              border: 'none', borderRadius: 12,
              color: '#000', fontSize: 15, fontWeight: 800,
              cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
              boxShadow: '0 4px 20px #FFD70044',
            }}>
              Ajouter à ma collection
            </button>
          )}
        </>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg) scale(1.05); }
          75% { transform: rotate(4deg) scale(1.05); }
        }
        @keyframes twinkle {
          from { opacity: 0.1; transform: scale(1); }
          to { opacity: 0.7; transform: scale(1.5); }
        }
      `}</style>
    </div>
  )
}
