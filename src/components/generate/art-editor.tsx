'use client'

import { useRef, useState } from 'react'
import { Image, Type, Layers, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EditorState, DEFAULT_EDITOR, GRADIENT_DIRECTIONS,
} from './editor-types'

interface Props {
  editor: EditorState
  onChange: (next: EditorState) => void
}

type Tab = 'fundo' | 'texto' | 'elementos'

// ─── Small helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">
      {children}
    </p>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-8 w-8 rounded-lg overflow-hidden border border-zinc-700 cursor-pointer bg-transparent p-0.5"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => {
          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value)
        }}
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-gold/50"
      />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-gold' : 'bg-zinc-700'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

function Slider({
  value, onChange, min = 0, max = 100,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-[#c9a86a] h-1"
      />
      <span className="text-xs text-zinc-400 w-8 text-right">{value}%</span>
    </div>
  )
}

// ─── Fundo Tab ────────────────────────────────────────────────────────────────

function FundoTab({ editor, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof EditorState>(key: K, val: EditorState[K]) {
    onChange({ ...editor, [key]: val })
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      onChange({ ...editor, bgType: 'image', bgImageUrl: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <Label>Tipo de fundo</Label>
        <div className="flex gap-1.5">
          {(['color', 'gradient', 'image'] as const).map(t => (
            <button
              key={t}
              onClick={() => set('bgType', t)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs capitalize border transition-colors',
                editor.bgType === t
                  ? 'bg-gold border-gold text-ink font-semibold'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              )}
            >
              {t === 'color' ? 'Cor' : t === 'gradient' ? 'Gradiente' : 'Imagem'}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      {editor.bgType === 'color' && (
        <div>
          <Label>Cor de fundo</Label>
          <ColorInput value={editor.bgColor} onChange={v => set('bgColor', v)} />
        </div>
      )}

      {/* Gradient */}
      {editor.bgType === 'gradient' && (
        <div className="space-y-3">
          <div>
            <Label>Cor inicial</Label>
            <ColorInput value={editor.gradientFrom} onChange={v => set('gradientFrom', v)} />
          </div>
          <div>
            <Label>Cor final</Label>
            <ColorInput value={editor.gradientTo} onChange={v => set('gradientTo', v)} />
          </div>
          <div>
            <Label>Direção</Label>
            <select
              value={editor.gradientDirection}
              onChange={e => set('gradientDirection', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold/50"
            >
              {GRADIENT_DIRECTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          {/* Gradient preview */}
          <div
            className="h-10 rounded-lg border border-zinc-700"
            style={{ background: `linear-gradient(${editor.gradientDirection}, ${editor.gradientFrom}, ${editor.gradientTo})` }}
          />
        </div>
      )}

      {/* Image */}
      {editor.bgType === 'image' && (
        <div className="space-y-3">
          <Label>Imagem de fundo</Label>
          {editor.bgImageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-zinc-700">
              <img src={editor.bgImageUrl} alt="bg" className="w-full h-24 object-cover" />
              <button
                onClick={() => onChange({ ...editor, bgImageUrl: null })}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-zinc-700 rounded-xl py-5 hover:border-gold transition-colors text-zinc-500 hover:text-gold"
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs">Clique para fazer upload</span>
              <span className="text-[10px]">PNG, JPG, WEBP</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      )}

      {/* Overlay */}
      <div className="pt-3 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <Label>Overlay de cor</Label>
          <Toggle checked={editor.overlayEnabled} onChange={v => set('overlayEnabled', v)} />
        </div>
        {editor.overlayEnabled && (
          <div className="space-y-3">
            <ColorInput value={editor.overlayColor} onChange={v => set('overlayColor', v)} />
            <div>
              <Label>Opacidade</Label>
              <Slider value={editor.overlayOpacity} onChange={v => set('overlayOpacity', v)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Texto Tab ────────────────────────────────────────────────────────────────

function TextoTab({ editor, onChange }: Props) {
  function set<K extends keyof EditorState>(key: K, val: EditorState[K]) {
    onChange({ ...editor, [key]: val })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label>Alinhamento do texto</Label>
        <p className="text-[10px] text-zinc-500 -mt-1 mb-2">Aplica a todos os slides do post.</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(['left', 'center', 'right'] as const).map(a => (
            <button
              key={a}
              onClick={() => set('textAlign', a)}
              className={cn(
                'py-2 rounded-lg border text-xs transition-colors flex flex-col items-center gap-1',
                editor.textAlign === a
                  ? 'bg-gold border-gold text-ink'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              )}
            >
              <span className="text-base leading-none">
                {a === 'left' ? '⬅' : a === 'center' ? '⬛' : '➡'}
              </span>
              <span className="capitalize">{a === 'left' ? 'Esquerda' : a === 'center' ? 'Centro' : 'Direita'}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Posição vertical</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['top', 'center', 'bottom'] as const).map(pos => (
            <button
              key={pos}
              onClick={() => set('textPosition', pos)}
              className={cn(
                'py-2 rounded-lg border text-xs transition-colors flex flex-col items-center gap-1',
                editor.textPosition === pos
                  ? 'bg-gold border-gold text-ink'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              )}
            >
              <span className="text-base leading-none">
                {pos === 'top' ? '⬆' : pos === 'center' ? '⬛' : '⬇'}
              </span>
              <span className="capitalize">{pos === 'top' ? 'Topo' : pos === 'center' ? 'Centro' : 'Rodapé'}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Tamanho da fonte</Label>
        <div className="flex gap-1.5">
          {(['sm', 'md', 'lg'] as const).map(s => (
            <button
              key={s}
              onClick={() => set('fontSize', s)}
              className={cn(
                'flex-1 py-1.5 rounded-lg border text-xs transition-colors',
                editor.fontSize === s
                  ? 'bg-gold border-gold text-ink font-semibold'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              )}
            >
              {s === 'sm' ? 'Pequeno' : s === 'md' ? 'Médio' : 'Grande'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Cor do texto</Label>
        <ColorInput value={editor.textColor} onChange={v => set('textColor', v)} />
      </div>

      <div>
        <Label>Cor de ênfase (_palavra_)</Label>
        <ColorInput value={editor.emphasisColor} onChange={v => set('emphasisColor', v)} />
        <p className="text-[10px] text-zinc-600 mt-1.5">
          Palavras entre _underscores_ ficam nessa cor
        </p>
      </div>
    </div>
  )
}

// ─── Elementos Tab ────────────────────────────────────────────────────────────

function ElementosTab({ editor, onChange }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof EditorState>(key: K, val: EditorState[K]) {
    onChange({ ...editor, [key]: val })
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('logoUrl', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      {/* Accent bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Barra de acento</Label>
          <Toggle checked={editor.showAccentBar} onChange={v => set('showAccentBar', v)} />
        </div>
        {editor.showAccentBar && (
          <ColorInput value={editor.accentBarColor} onChange={v => set('accentBarColor', v)} />
        )}
      </div>

      {/* Handle */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div>
          <Label>Handle da marca</Label>
          <p className="text-[10px] text-zinc-600">Exibe @nomemarca no rodapé</p>
        </div>
        <Toggle checked={editor.showHandle} onChange={v => set('showHandle', v)} />
      </div>

      {/* Slide number */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div>
          <Label>Número do slide</Label>
          <p className="text-[10px] text-zinc-600">Ex: 1/8 no canto superior</p>
        </div>
        <Toggle checked={editor.showSlideNumber} onChange={v => set('showSlideNumber', v)} />
      </div>

      {/* Logo */}
      <div className="pt-3 border-t border-zinc-800">
        <Label>Logotipo</Label>
        {editor.logoUrl ? (
          <div className="space-y-2">
            <div className="relative bg-zinc-800 rounded-lg p-3 flex items-center justify-center border border-zinc-700">
              <img src={editor.logoUrl} alt="logo" className="max-h-10 max-w-full object-contain" />
              <button
                onClick={() => set('logoUrl', null)}
                className="absolute top-1.5 right-1.5 p-1 bg-zinc-900/80 rounded-full hover:bg-black transition-colors"
              >
                <X className="h-3 w-3 text-zinc-400" />
              </button>
            </div>
            <div>
              <Label>Posição</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {([
                  ['top-left', '↖ Superior esq.'],
                  ['top-right', '↗ Superior dir.'],
                  ['bottom-left', '↙ Inferior esq.'],
                  ['bottom-right', '↘ Inferior dir.'],
                ] as const).map(([pos, label]) => (
                  <button
                    key={pos}
                    onClick={() => set('logoPosition', pos)}
                    className={cn(
                      'py-1.5 rounded-lg border text-[10px] transition-colors',
                      editor.logoPosition === pos
                        ? 'bg-gold border-gold text-ink font-semibold'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => logoRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-xl py-3 hover:border-gold transition-colors text-zinc-500 hover:text-gold text-xs"
          >
            <Upload className="h-4 w-4" />
            Fazer upload do logo
          </button>
        )}
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
      </div>

      {/* Reset */}
      <div className="pt-3 border-t border-zinc-800">
        <button
          onClick={() => onChange(DEFAULT_EDITOR)}
          className="w-full py-2 rounded-lg border border-zinc-700 text-xs text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors"
        >
          Restaurar padrões
        </button>
      </div>
    </div>
  )
}

// ─── ArtEditor ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'fundo', label: 'Fundo', icon: Image },
  { id: 'texto', label: 'Texto', icon: Type },
  { id: 'elementos', label: 'Elementos', icon: Layers },
]

export function ArtEditor({ editor, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('fundo')

  return (
    <div className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider border-b-2 transition-colors',
              tab === t.id
                ? 'border-gold text-gold'
                : 'border-transparent text-zinc-600 hover:text-zinc-400'
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'fundo' && <FundoTab editor={editor} onChange={onChange} />}
        {tab === 'texto' && <TextoTab editor={editor} onChange={onChange} />}
        {tab === 'elementos' && <ElementosTab editor={editor} onChange={onChange} />}
      </div>
    </div>
  )
}
