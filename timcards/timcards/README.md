# 🃏 TimCards — Community TCG

Site de cartes à collectionner pour la communauté Twitch de Tim, avec intégration TimCash via Wizebot.

## Stack technique
- **Next.js 14** — Framework React
- **Supabase** — Base de données + Auth Twitch
- **Wizebot** — Monnaie virtuelle TimCash
- **Vercel** — Hébergement

---

## Installation locale

### 1. Cloner le projet
```bash
git clone https://github.com/TON_PSEUDO/timcards.git
cd timcards
npm install
```

### 2. Variables d'environnement
Copier `.env.local.example` en `.env.local` et remplir :
```
NEXT_PUBLIC_SUPABASE_URL=https://zkymyqfnrswkndlekilg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_jL5NOvfeYHO-dsaJjDQx7w_akn2u2vL
TWITCH_CLIENT_ID=      ← à récupérer sur dev.twitch.tv
TWITCH_CLIENT_SECRET=  ← à récupérer sur dev.twitch.tv
NEXTAUTH_SECRET=       ← générer avec: openssl rand -base64 32
WIZEBOT_API_KEY=       ← dans Wizebot > Paramètres > API
WIZEBOT_CHANNEL=       ← ton nom de chaîne Twitch (en minuscules)
```

### 3. Créer les tables Supabase
- Aller sur supabase.com > Tim TCG > SQL Editor
- Coller le contenu de `lib/schema.sql` et cliquer Run

### 4. Configurer l'auth Twitch dans Supabase
- Supabase > Authentication > Providers > Twitch
- Activer Twitch et entrer ton Client ID + Secret

### 5. Lancer en local
```bash
npm run dev
```
→ Ouvrir http://localhost:3000

---

## Déploiement sur Vercel
1. Pousser le code sur GitHub
2. Importer le repo sur vercel.com
3. Ajouter les variables d'environnement dans Vercel
4. Déployer

---

## Structure du projet
```
timcards/
├── app/
│   ├── page.jsx              # Boutique
│   ├── collection/page.jsx   # Ma collection
│   ├── leaderboard/page.jsx  # Classement
│   ├── auth/callback/        # Callback OAuth Twitch
│   └── api/
│       └── wizebot/
│           ├── balance/      # Consulter solde TimCash
│           └── spend/        # Débiter TimCash
├── components/
│   ├── FifaCard.jsx          # Composant carte
│   ├── PackOpener.jsx        # Animation ouverture
│   └── Header.jsx            # Navigation
└── lib/
    ├── cards.js              # Données des cartes + logique tirage
    ├── supabase.js           # Client Supabase
    └── schema.sql            # Structure base de données
```
