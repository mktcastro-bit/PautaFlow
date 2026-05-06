'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-red-400">Erro na aplicação</h1>
        <pre className="text-xs bg-black/50 rounded-lg p-3 overflow-auto max-h-64 text-zinc-300 whitespace-pre-wrap break-all">
          {error.message}
          {error.digest && `\n\nDigest: ${error.digest}`}
        </pre>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Tentar novamente
          </button>
          <a
            href="/api/auth/signout"
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Sair da conta
          </a>
        </div>
      </div>
    </div>
  )
}
