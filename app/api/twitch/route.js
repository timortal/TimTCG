import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ roles: [] })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const channel = process.env.WIZEBOT_CHANNEL

  if (!clientId || !clientSecret || !channel) {
    return NextResponse.json({ roles: [], demo: true })
  }

  try {
    // 1. Obtenir un token app Twitch
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    )
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // 2. Récupérer l'ID du channel
    const channelRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${channel}`,
      { headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${accessToken}` } }
    )
    const channelData = await channelRes.json()
    const broadcasterId = channelData.data?.[0]?.id

    // 3. Récupérer l'ID de l'utilisateur
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${username}`,
      { headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${accessToken}` } }
    )
    const userData = await userRes.json()
    const userId = userData.data?.[0]?.id

    if (!broadcasterId || !userId) {
      return NextResponse.json({ roles: [] })
    }

    // 4. Si c'est le broadcaster lui-même → accès total
    if (userId === broadcasterId) {
      return NextResponse.json({ roles: ['subscriber', 'vip', 'moderator', 'broadcaster'] })
    }

    const roles = []

    // 5. Vérifier si sub
    const subRes = await fetch(
      `https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${broadcasterId}&user_id=${userId}`,
      { headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${accessToken}` } }
    )
    if (subRes.ok) {
      const subData = await subRes.json()
      if (subData.data?.length > 0) roles.push('subscriber')
    }

    // 6. Vérifier si VIP
    const vipRes = await fetch(
      `https://api.twitch.tv/helix/channels/vips?broadcaster_id=${broadcasterId}&user_id=${userId}`,
      { headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${accessToken}` } }
    )
    if (vipRes.ok) {
      const vipData = await vipRes.json()
      if (vipData.data?.length > 0) roles.push('vip')
    }

    // 7. Vérifier si modérateur
    const modRes = await fetch(
      `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcasterId}&user_id=${userId}`,
      { headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${accessToken}` } }
    )
    if (modRes.ok) {
      const modData = await modRes.json()
      if (modData.data?.length > 0) roles.push('moderator')
    }

    return NextResponse.json({ roles })
  } catch (err) {
    console.error('Twitch roles error:', err)
    return NextResponse.json({ roles: [] })
  }
}
