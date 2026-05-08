import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'PautaFlow — Gestão de Conteúdo com IA',
  description: 'Plataforma inteligente para gestão de pautas, DNA da marca e geração de conteúdo com IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-background text-foreground">{children}</body>
    </html>
  )
}
