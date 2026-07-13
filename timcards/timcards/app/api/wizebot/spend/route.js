import { NextResponse } from 'next/server'

export async function POST(request) {
  const { username, amount } = await request.json()

  if (!username || !amount) {
    return NextResponse.json({ error: 'Username et montant requis' }, { status: 400 })
  }

  const apiKey = process.env.WIZEBOT_API_KEY
  const channel = process.env.WIZEBOT_CHANNEL

  if (!apiKey || !channel) {
    // Mode démo : simuler la dépense sans appel réel
    return NextResponse.json({ success: true, demo: true })
  }

  try {
    // D'abord vérifier le solde
    const balanceRes = await fetch(
      `https://api.wizebot.tv/api/currency/${channel}/${username}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    )

    if (!balanceRes.ok) {
      return NextResponse.json({ error: 'Utilisateur introuvable dans Wizebot' }, { status: 404 })
    }

    const balanceData = await balanceRes.json()
    const currentBalance = balanceData.value ?? balanceData.amount ?? 0

    if (currentBalance < amount) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 402 })
    }

    // Débiter le montant
    const spendRes = await fetch(
      `https://api.wizebot.tv/api/currency/${channel}/${username}/remove/${amount}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!spendRes.ok) {
      return NextResponse.json({ error: 'Erreur lors du débit' }, { status: 500 })
    }

    return NextResponse.json({ success: true, newBalance: currentBalance - amount })
  } catch (err) {
    console.error('Wizebot spend error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
