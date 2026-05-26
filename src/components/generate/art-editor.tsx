'use client'

import { useRef, useState } from 'react'
import { Image, Type, Layers, Upload, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EditorState, DEFAULT_EDITOR, GRADIENT_DIRECTIONS, CardElement,
} from './editor-types'
import { ELEMENT_ICONS } from './element-icons'
import { SlideOverridesPanel } from './slide-overrides-panel'
import type { Slide } from './art-card'

interface BrandLogoOption { url: string; label: string }

interface Props {
  editor: EditorState
  onChange: (next: EditorState) => void
  // Para painel de overrides do slide atual (opcional)
  currentSlide?: Slide
  currentSlideNumber?: number
  totalSlides?: number
  onUpdateSlide?: (overrides: NonNullable<Slide['overrides']>) => void
  // Escopo de aplicação das mudanças (fundo/texto/elementos)
  applyMode?: 'all' | 'current'
  onApplyModeChange?: (mode: 'all' | 'current') => void
  hasEditorOverrides?: boolean
  onResetEditorOverrides?: () => void
  // Variações de logo cadastradas no DNA da marca (principal + alternativas)
  brandLogos?: BrandLogoOption[]
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
  value, onChange, min = 0, max = 100, unit = '%',
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }) {
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
      <span className="text-xs text-zinc-400 w-10 text-right">{value}{unit}</span>
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

function ElementosTab({ editor, onChange, brandLogos }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)
  const elementImageRef = useRef<HTMLInputElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTab, setPickerTab] = useState<'shape' | 'icon' | 'image'>('shape')

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

  // ── Elementos livres (formas / ícones / imagens) ──
  function genId() {
    return (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID() as string
      : `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  function addElement(el: CardElement) {
    onChange({ ...editor, elements: [...(editor.elements || []), el] })
    setPickerOpen(false)
  }

  function removeElement(id: string) {
    onChange({ ...editor, elements: (editor.elements || []).filter(e => e.id !== id) })
  }

  function addShape(shape: 'circle' | 'rect' | 'line' | 'triangle') {
    const presets: Record<typeof shape, { w: number; h: number }> = {
      circle:   { w: 20, h: 20 },
      rect:     { w: 30, h: 20 },
      line:     { w: 40, h: 1 },
      triangle: { w: 20, h: 20 },
    }
    const { w, h } = presets[shape]
    addElement({
      id: genId(),
      type: 'shape',
      shape,
      x: 50 - w / 2,
      y: 50 - h / 2,
      w, h,
      rotation: 0,
      opacity: 100,
      color: editor.accentBarColor,
    })
  }

  function addIcon(key: string) {
    const w = 15
    addElement({
      id: genId(),
      type: 'icon',
      icon: key,
      x: 50 - w / 2,
      y: 50 - w / 2,
      w, h: w,
      rotation: 0,
      opacity: 100,
      color: editor.accentBarColor,
    })
  }

  function addImageFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      // Tamanho default 30x30% — img usa objectFit:contain, então o aspect
      // ratio natural é preservado dentro do bbox sem distorção.
      const w = 30, h = 30
      addElement({
        id: genId(),
        type: 'image',
        url,
        x: 50 - w / 2,
        y: 50 - h / 2,
        w, h,
        rotation: 0,
        opacity: 100,
      })
    }
    reader.readAsDataURL(file)
    if (elementImageRef.current) elementImageRef.current.value = ''
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
            {brandLogos && brandLogos.length > 1 && (
              <div>
                <Label>Variações do DNA</Label>
                <div className="flex flex-wrap gap-1.5">
                  {brandLogos.map((opt) => {
                    const active = opt.url === editor.logoUrl
                    return (
                      <button
                        key={opt.url}
                        onClick={() => set('logoUrl', opt.url)}
                        title={opt.label}
                        className={cn(
                          'h-10 w-10 rounded border flex items-center justify-center overflow-hidden transition-colors flex-shrink-0',
                          active
                            ? 'border-gold ring-1 ring-gold bg-zinc-800'
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'
                        )}
                        style={{
                          backgroundImage: 'linear-gradient(45deg, #1f1f1f 25%, transparent 25%), linear-gradient(-45deg, #1f1f1f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f1f1f 75%), linear-gradient(-45deg, transparent 75%, #1f1f1f 75%)',
                          backgroundSize: '6px 6px',
                          backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                        }}
                      >
                        <img src={opt.url} alt={opt.label} className="max-h-9 max-w-9 object-contain" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
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
            <div>
              <Label>Tamanho</Label>
              <Slider
                value={editor.logoSize ?? 60}
                onChange={v => set('logoSize', v)}
                min={30}
                max={180}
                unit="px"
              />
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

      {/* Elementos livres (formas, ícones, imagens) */}
      <div className="pt-3 border-t border-zinc-800">
        <Label>Elementos</Label>

        {/* Lista de elementos do card atual */}
        {editor.elements && editor.elements.length > 0 && (
          <ul className="space-y-1 mb-2">
            {editor.elements.map(el => (
              <li
                key={el.id}
                className="flex items-center gap-2 px-2 py-1.5 bg-zinc-800/50 rounded text-xs"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded bg-zinc-900 flex items-center justify-center">
                  {el.type === 'shape' && (
                    <ShapeMiniIcon shape={el.shape} color={el.color} size={14} />
                  )}
                  {el.type === 'icon' && (() => {
                    const I = ELEMENT_ICONS[el.icon]?.Icon
                    return I ? <I className="w-3.5 h-3.5" style={{ color: el.color }} /> : null
                  })()}
                  {el.type === 'image' && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={el.url} alt="" className="w-5 h-5 object-contain" />
                  )}
                </span>
                <span className="flex-1 truncate text-zinc-400">
                  {el.type === 'shape'
                    ? `Forma · ${shapeLabel(el.shape)}`
                    : el.type === 'icon'
                    ? `Ícone · ${ELEMENT_ICONS[el.icon]?.label || el.icon}`
                    : 'Imagem'}
                </span>
                <button
                  onClick={() => removeElement(el.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                  title="Apagar"
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {!pickerOpen ? (
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-500 hover:border-gold hover:text-gold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar elemento
          </button>
        ) : (
          <div className="border border-zinc-700 rounded-lg p-2 space-y-2">
            <div className="flex gap-1">
              {(['shape', 'icon', 'image'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setPickerTab(t)}
                  className={cn(
                    'flex-1 py-1 rounded text-[10px] uppercase tracking-wider transition-colors',
                    pickerTab === t
                      ? 'bg-gold text-ink font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {t === 'shape' ? 'Formas' : t === 'icon' ? 'Ícones' : 'Imagem'}
                </button>
              ))}
            </div>

            {pickerTab === 'shape' && (
              <div className="grid grid-cols-4 gap-1.5">
                {(['circle', 'rect', 'line', 'triangle'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => addShape(s)}
                    className="aspect-square bg-zinc-800 border border-zinc-700 rounded hover:border-gold flex items-center justify-center transition-colors"
                    title={shapeLabel(s)}
                  >
                    <ShapeMiniIcon shape={s} color={editor.accentBarColor} size={18} />
                  </button>
                ))}
              </div>
            )}

            {pickerTab === 'icon' && (
              <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto pr-1">
                {Object.entries(ELEMENT_ICONS).map(([key, { Icon, label }]) => (
                  <button
                    key={key}
                    onClick={() => addIcon(key)}
                    title={label}
                    className="aspect-square bg-zinc-800 border border-zinc-700 rounded hover:border-gold flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-zinc-300" />
                  </button>
                ))}
              </div>
            )}

            {pickerTab === 'image' && (
              <button
                onClick={() => elementImageRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg py-4 hover:border-gold transition-colors text-zinc-500 hover:text-gold text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Fazer upload de imagem
              </button>
            )}

            <input
              ref={elementImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={addImageFromFile}
            />

            <button
              onClick={() => setPickerOpen(false)}
              className="w-full text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
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

function shapeLabel(s: 'circle' | 'rect' | 'line' | 'triangle'): string {
  return s === 'circle' ? 'círculo' : s === 'rect' ? 'retângulo' : s === 'line' ? 'linha' : 'triângulo'
}

function ShapeMiniIcon({
  shape,
  color,
  size = 14,
}: {
  shape: 'circle' | 'rect' | 'line' | 'triangle'
  color: string
  size?: number
}) {
  if (shape === 'circle') {
    return <div style={{ width: size, height: size, borderRadius: '50%', background: color }} />
  }
  if (shape === 'rect') {
    return <div style={{ width: size * 1.4, height: size * 0.8, background: color }} />
  }
  if (shape === 'line') {
    return <div style={{ width: size * 1.6, height: 2, background: color }} />
  }
  if (shape === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <polygon points="50,5 95,95 5,95" fill={color} />
      </svg>
    )
  }
  return null
}

// ─── ArtEditor ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'fundo', label: 'Fundo', icon: Image },
  { id: 'texto', label: 'Texto', icon: Type },
  { id: 'elementos', label: 'Elementos', icon: Layers },
]

export function ArtEditor({
  editor, onChange,
  currentSlide, currentSlideNumber, totalSlides, onUpdateSlide,
  applyMode, onApplyModeChange, hasEditorOverrides, onResetEditorOverrides,
  brandLogos,
}: Props) {
  const [tab, setTab] = useState<Tab>('fundo')

  // Escopo é controlado externamente (vem do ArtCanvas). Default 'all'.
  const mode = applyMode ?? 'all'

  return (
    <div className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950 h-full min-h-0">
      {/* Tab bar — fixa no topo */}
      <div className="flex border-b border-zinc-800 flex-shrink-0">
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

      {/* ─── Escopo de aplicação (todos vs slide atual) ─── */}
      {onApplyModeChange && currentSlideNumber && (
        <div className="border-b border-zinc-800 p-3 bg-zinc-950 flex-shrink-0">
          <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-semibold mb-1.5">
            Aplicar mudanças a
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => onApplyModeChange('all')}
              className={cn(
                'flex-1 py-1.5 rounded text-[10px] tracking-wider uppercase font-semibold transition-all border',
                mode === 'all'
                  ? 'bg-gold border-gold text-ink'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              )}
            >
              Todos os slides
            </button>
            <button
              onClick={() => onApplyModeChange('current')}
              className={cn(
                'flex-1 py-1.5 rounded text-[10px] tracking-wider uppercase font-semibold transition-all border relative',
                mode === 'current'
                  ? 'bg-gold border-gold text-ink'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              )}
            >
              Slide {currentSlideNumber}
              {hasEditorOverrides && mode !== 'current' && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </button>
          </div>

          {/* Reset overrides do slide atual */}
          {hasEditorOverrides && mode === 'current' && onResetEditorOverrides && (
            <button
              onClick={onResetEditorOverrides}
              className="w-full mt-2 text-[9px] tracking-[0.2em] uppercase text-zinc-500 hover:text-gold transition-colors py-1 border border-zinc-800 rounded"
              title="Remove a customização deste slide e volta a usar a aparência global"
            >
              ↺ Restaurar padrão global neste slide
            </button>
          )}

          {/* Hint contextual */}
          <p className="text-[10px] text-zinc-600 leading-relaxed mt-2">
            {mode === 'all'
              ? 'Mudanças neste painel afetam todos os slides do carrossel.'
              : `Mudanças aqui afetam apenas o slide ${currentSlideNumber}. Slides com customização ficam marcados com ponto dourado.`}
          </p>
        </div>
      )}

      {/* Conteúdo (tab + slide overrides) — scroll único, min-h-0 garante que
          o overflow-y-auto respeite a altura do pai flex em vez de crescer */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          {tab === 'fundo' && <FundoTab editor={editor} onChange={onChange} />}
          {tab === 'texto' && <TextoTab editor={editor} onChange={onChange} />}
          {tab === 'elementos' && <ElementosTab editor={editor} onChange={onChange} brandLogos={brandLogos} />}
        </div>

        {/* Painel do slide atual — vem direto após o conteúdo da aba, sem gap */}
        {currentSlide && currentSlideNumber && totalSlides && onUpdateSlide && (
          <div className="border-t border-zinc-800 p-3 bg-zinc-950/80">
            <SlideOverridesPanel
              slide={currentSlide}
              slideNumber={currentSlideNumber}
              total={totalSlides}
              onChange={onUpdateSlide}
            />
          </div>
        )}
      </div>
    </div>
  )
}
