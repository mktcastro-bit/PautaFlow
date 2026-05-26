'use client'

import React, { useRef } from 'react'
import { CardElement } from './editor-types'
import { ELEMENT_ICONS } from './element-icons'

interface RenderElementProps {
  element: CardElement
  /** Largura do card em px (já com scale aplicado) */
  cardWidth: number
  /** Altura do card em px (já com scale aplicado) */
  cardHeight: number

  // ── Modo editável (opcional) ──
  /** Se true, o elemento intercepta pointer events e pode ser arrastado */
  editable?: boolean
  /** Se true, mostra contorno tracejado dourado */
  selected?: boolean
  /** Disparado no pointer down — usado para selecionar e iniciar drag */
  onSelect?: () => void
  /** Aplicado durante drag; recebe um delta parcial (x, y em %) */
  onChange?: (partial: Partial<CardElement>) => void
}

/**
 * Renderiza um CardElement (forma, ícone ou imagem) no card.
 * Posição e tamanho são em % do card — convertemos para px aqui.
 *
 * Quando `editable=true`, o elemento se torna interativo: o pointer down
 * dispara onSelect e inicia um drag livre que atualiza element.x/y em %.
 * O drag usa setPointerCapture para sobreviver a movimentos fora do bbox.
 */
export function CardElementView({
  element,
  cardWidth,
  cardHeight,
  editable = false,
  selected = false,
  onSelect,
  onChange,
}: RenderElementProps) {
  const dragRef = useRef<{
    startX: number
    startY: number
    elX: number
    elY: number
  } | null>(null)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!editable) return
    e.stopPropagation()
    onSelect?.()
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId)
    } catch {/* ignore */}
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elX: element.x,
      elY: element.y,
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || !onChange) return
    const dxPx = e.clientX - dragRef.current.startX
    const dyPx = e.clientY - dragRef.current.startY
    const dxPct = (dxPx / cardWidth) * 100
    const dyPct = (dyPx / cardHeight) * 100
    onChange({
      x: dragRef.current.elX + dxPct,
      y: dragRef.current.elY + dyPct,
    })
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = null
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId)
    } catch {/* ignore */}
  }

  const xPx = (element.x / 100) * cardWidth
  const yPx = (element.y / 100) * cardHeight
  const wPx = (element.w / 100) * cardWidth
  const hPx = (element.h / 100) * cardHeight

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: xPx,
    top: yPx,
    width: wPx,
    height: hPx,
    transform: `rotate(${element.rotation}deg)`,
    transformOrigin: 'center center',
    opacity: element.opacity / 100,
    pointerEvents: editable ? 'auto' : 'none',
    cursor: editable ? 'move' : undefined,
    outline: selected ? '2px dashed #c9a86a' : undefined,
    outlineOffset: 2,
    boxSizing: 'border-box',
  }

  return (
    <div
      style={wrapperStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <ElementVisual element={element} />
    </div>
  )
}

/**
 * Renderização "pura" do conteúdo visual do elemento — sem position,
 * sem transform, sem cursor. Vive dentro do wrapper que cuida disso.
 * Ocupa 100% do container.
 */
function ElementVisual({ element }: { element: CardElement }) {
  if (element.type === 'shape') {
    if (element.shape === 'circle') {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: element.color,
            borderRadius: '50%',
          }}
        />
      )
    }
    if (element.shape === 'rect') {
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: element.color }} />
      )
    }
    if (element.shape === 'line') {
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: element.color }} />
      )
    }
    if (element.shape === 'triangle') {
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon points="50,0 100,100 0,100" fill={element.color} />
        </svg>
      )
    }
  }

  if (element.type === 'icon') {
    const entry = ELEMENT_ICONS[element.icon]
    if (!entry) return null
    const { Icon } = entry
    return (
      <Icon
        color={element.color}
        strokeWidth={1.5}
        style={{ width: '100%', height: '100%' }}
      />
    )
  }

  if (element.type === 'image') {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={element.url}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        draggable={false}
      />
    )
  }

  return null
}
