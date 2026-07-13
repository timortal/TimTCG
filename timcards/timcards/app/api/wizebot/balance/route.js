import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username requis' }, { status: 400 })
  }

  const apiKey = process.env.WIZEBOT_API_KEY
  const channel = process.env.WIZEBOT_CHANNEL

  if (!apiKey || !channel) {
    // Mode démo : retourner un solde fictif si pas de clé configurée
    return NextResponse.json({ balance: 2500, demo: true })
  }

  try {
    const res = await fetch(
      `https://api.wizebot.tv/api/currency/${channel}/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!res.ok) {
      // L'utilisateur n'existe peut-être pas encore dans Wizebot
      return NextResponse.json({ balance: 0 })
    }

    const data = await res.json()
    return NextResponse.json({ balance: data.value ?? data.amount ?? 0 })
  } catch (err) {
    console.error('Wizebot balance error:', err)
    return NextResponse.json({ balance: 0 })
  }
}
