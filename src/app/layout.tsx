import type { Metadata } from 'next'
import { Inter, Playfair_Display, Bebas_Neue, Caveat, IBM_Plex_Sans, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

// ─── 5 famílias tipográficas suportadas ────────────────────────────────────
// Cada uma vira uma CSS variable, ativada conforme step4_typography_style do DNA

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const bebas = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: '400',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-tech',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-grotesque',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const fontVariables = [
  inter.variable,
  playfair.variable,
  bebas.variable,
  caveat.variable,
  ibmPlex.variable,
  bricolage.variable,
].join(' ')

export const metadata: Metadata = {
  title: 'PautaFlow — Gestão de Conteúdo com IA',
  description: 'Plataforma inteligente para gestão de pautas, DNA da marca e geração de conteúdo com IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${fontVariables}`}>
      <body className="font-sans bg-background text-foreground">{children}</body>
    </html>
  )
}
