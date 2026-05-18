export const metadata = {
  title: 'Painel — interno',
  robots: { index: false, follow: false },
}

export default function AdminPainelLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
