export const CARDS = [
  {
    id: 1,
    name: "TimTheTank",
    role: "Streamer",
    rarity: "legendary",
    stats: { VIE: 99, STYLE: 95, HYPE: 98, LOL: 87, SKILL: 92 },
    color: "#FFD700",
    glow: "#FF8C00",
    bg: "linear-gradient(135deg, #1a0a00 0%, #3d2000 50%, #1a0a00 100%)",
    number: "01",
    flag: "🇫🇷",
    club: "⚡",
    edition: "Fondateur",
  },
  {
    id: 2,
    name: "PixelQueen",
    role: "Gameuse",
    rarity: "epic",
    stats: { VIE: 88, STYLE: 91, HYPE: 79, LOL: 94, SKILL: 85 },
    color: "#C084FC",
    glow: "#7C3AED",
    bg: "linear-gradient(135deg, #0d001a 0%, #1e0035 50%, #0d001a 100%)",
    number: "07",
    flag: "🇧🇪",
    club: "🎮",
    edition: "Saison 1",
  },
  {
    id: 3,
    name: "LoLBanane",
    role: "Support",
    rarity: "rare",
    stats: { VIE: 75, STYLE: 68, HYPE: 82, LOL: 99, SKILL: 71 },
    color: "#60A5FA",
    glow: "#2563EB",
    bg: "linear-gradient(135deg, #00071a 0%, #001435 50%, #00071a 100%)",
    number: "14",
    flag: "🇨🇭",
    club: "🍌",
    edition: "Saison 1",
  },
  {
    id: 4,
    name: "NightOwl",
    role: "Chat Mod",
    rarity: "rare",
    stats: { VIE: 70, STYLE: 77, HYPE: 65, LOL: 80, SKILL: 88 },
    color: "#34D399",
    glow: "#059669",
    bg: "linear-gradient(135deg, #00100a 0%, #002518 50%, #00100a 100%)",
    number: "22",
    flag: "🇫🇷",
    club: "🦉",
    edition: "Saison 1",
  },
  {
    id: 5,
    name: "SpeedRunner",
    role: "Joueur",
    rarity: "common",
    stats: { VIE: 60, STYLE: 55, HYPE: 72, LOL: 65, SKILL: 95 },
    color: "#94A3B8",
    glow: "#64748B",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
    number: "33",
    flag: "🇫🇷",
    club: "⏱️",
    edition: "Saison 1",
  },
]

export const RARITY_CONFIG = {
  legendary: { label: "LÉGENDAIRE", color: "#FFD700", dropRate: 2 },
  epic:      { label: "ÉPIQUE",     color: "#C084FC", dropRate: 10 },
  rare:      { label: "RARE",       color: "#60A5FA", dropRate: 28 },
  common:    { label: "COMMUNE",    color: "#94A3B8", dropRate: 60 },
}

export const PACK_COST = 500
export const CARDS_PER_PACK = 5

export function pickCard() {
  const rand = Math.random() * 100
  let rarity
  if (rand < 2)  rarity = "legendary"
  else if (rand < 12) rarity = "epic"
  else if (rand < 40) rarity = "rare"
  else rarity = "common"

  const pool = CARDS.filter(c => c.rarity === rarity)
  if (pool.length === 0) return CARDS[Math.floor(Math.random() * CARDS.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function generatePack() {
  const pack = []
  for (let i = 0; i < CARDS_PER_PACK; i++) {
    pack.push(pickCard())
  }
  return pack
}
