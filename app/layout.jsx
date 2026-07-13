import './globals.css'

export const metadata = {
  title: 'TimCards — Community TCG',
  description: 'Collecte les cartes de la communauté de Tim !',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
