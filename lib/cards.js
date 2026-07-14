export const CARDS = [
  {
    id: 1, name: "TimTheTank", role: "Streamer", rarity: "legendary",
    stats: { VIE: 99, STYLE: 95, HYPE: 98, LOL: 87, SKILL: 92 },
    color: "#FFD700", glow: "#FF8C00",
    bg: "linear-gradient(135deg, #1a0a00 0%, #3d2000 50%, #1a0a00 100%)",
    number: "01", flag: "🇫🇷", club: "⚡", edition: "Fondateur",
  },
  {
    id: 2, name: "PixelQueen", role: "Gameuse", rarity: "epic",
    stats: { VIE: 88, STYLE: 91, HYPE: 79, LOL: 94, SKILL: 85 },
    color: "#C084FC", glow: "#7C3AED",
    bg: "linear-gradient(135deg, #0d001a 0%, #1e0035 50%, #0d001a 100%)",
    number: "07", flag: "🇧🇪", club: "🎮", edition: "Saison 1",
  },
  {
    id: 3, name: "LoLBanane", role: "Support", rarity: "rare",
    stats: { VIE: 75, STYLE: 68, HYPE: 82, LOL: 99, SKILL: 71 },
    color: "#60A5FA", glow: "#2563EB",
    bg: "linear-gradient(135deg, #00071a 0%, #001435 50%, #00071a 100%)",
    number: "14", flag: "🇨🇭", club: "🍌", edition: "Saison 1",
  },
  {
    id: 4, name: "NightOwl", role: "Chat Mod", rarity: "rare",
    stats: { VIE: 70, STYLE: 77, HYPE: 65, LOL: 80, SKILL: 88 },
    color: "#34D399", glow: "#059669",
    bg: "linear-gradient(135deg, #00100a 0%, #002518 50%, #00100a 100%)",
    number: "22", flag: "🇫🇷", club: "🦉", edition: "Saison 1",
  },
  {
    id: 5, name: "SpeedRunner", role: "Joueur", rarity: "common",
    stats: { VIE: 60, STYLE: 55, HYPE: 72, LOL: 65, SKILL: 95 },
    color: "#94A3B8", glow: "#64748B",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
    number: "33", flag: "🇫🇷", club: "⏱️", edition: "Saison 1",
  },
]

export const RARITY_CONFIG = {
  legendary: { label: "LÉGENDAIRE", color: "#FFD700", dropRate: 2 },
  epic:      { label: "ÉPIQUE",     color: "#C084FC", dropRate: 10 },
  rare:      { label: "RARE",       color: "#60A5FA", dropRate: 28 },
  common:    { label: "COMMUNE",    color: "#94A3B8", dropRate: 60 },
}

// ─── Configuration des paquets ────────────────────────────────────────────────
export const PACKS = {
  classic: {
    id: 'classic',
    name: 'Classique',
    emoji: '📦',
    description: '5 cartes · Toutes raretés',
    cost: 500,
    cardsCount: 5,
    access: 'all', // tous les viewers
    available: true,
    dropRates: { legendary: 2, epic: 10, rare: 28, common: 60 },
    color: '#FFD700',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e2d4a 50%, #0f172a 100%)',
    border: '#FFD70033',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    emoji: '🌟',
    description: '5 cartes · Meilleures chances',
    cost: 1500,
    cardsCount: 5,
    access: 'all',
    available: true,
    dropRates: { legendary: 8, epic: 25, rare: 40, common: 27 },
    color: '#C084FC',
    bg: 'linear-gradient(135deg, #0d001a 0%, #1e0035 50%, #0d001a 100%)',
    border: '#C084FC33',
  },
  exclusive: {
    id: 'exclusive',
    name: 'Exclusif',
    emoji: '👑',
    description: '5 cartes · Réservé Sub / VIP / Modo',
    cost: 2000,
    cardsCount: 5,
    access: 'exclusive', // sub, vip, moderator uniquement
    available: true,
    dropRates: { legendary: 15, epic: 35, rare: 35, common: 15 },
    color: '#FF8C00',
    bg: 'linear-gradient(135deg, #1a0800 0%, #3d1800 50%, #1a0800 100%)',
    border: '#FF8C0033',
  },
  special: {
    id: 'special',
    name: 'Spécial',
    emoji: '🔮',
    description: 'Mystérieux · Bientôt disponible',
    cost: 0,
    cardsCount: 5,
    access: 'none', // personne pour l'instant
    available: false,
    dropRates: { legendary: 30, epic: 40, rare: 20, common: 10 },
    color: '#EC4899',
    bg: 'linear-gradient(135deg, #1a0010 0%, #3d0025 50%, #1a0010 100%)',
    border: '#EC489933',
  },
}

export const CARDS_PER_PACK = 5

// ─── Tirage pondéré selon les taux du paquet ─────────────────────────────────
function pickCardForPack(pack) {
  const { dropRates } = pack
  const rand = Math.random() * 100
  let rarity

  if (rand < dropRates.legendary)                              rarity = 'legendary'
  else if (rand < dropRates.legendary + dropRates.epic)        rarity = 'epic'
  else if (rand < dropRates.legendary + dropRates.epic + dropRates.rare) rarity = 'rare'
  else                                                          rarity = 'common'

  const pool = CARDS.filter(c => c.rarity === rarity)
  if (pool.length === 0) return CARDS[Math.floor(Math.random() * CARDS.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function generatePack(packId = 'classic') {
  const pack = PACKS[packId] || PACKS.classic
  const cards = []
  for (let i = 0; i < pack.cardsCount; i++) {
    cards.push(pickCardForPack(pack))
  }
  return cards
}

// ─── Vérification accès paquet exclusif ──────────────────────────────────────
export function canAccessPack(pack, userRoles = []) {
  if (!pack.available) return false
  if (pack.access === 'all') return true
  if (pack.access === 'none') return false
  if (pack.access === 'exclusive') {
    return userRoles.some(r => ['subscriber', 'vip', 'moderator'].includes(r))
  }
  return false
}

