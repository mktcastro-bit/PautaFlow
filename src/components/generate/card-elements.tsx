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
  /** Se true, mostra contorno + handles de resize e rotação */
  selected?: boolean
  /** Disparado no pointer down — usado para selecionar e iniciar drag */
  onSelect?: () => void
  /** Aplicado durante drag/resize/rotate; recebe delta parcial em % do card */
  onChange?: (partial: Partial<CardElement>) => void
}

type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw'
type DragMode = 'move' | ResizeHandle | 'rotate'

const HANDLE_SIZE = 11
const ROTATION_OFFSET = 28

/**
 * Renderiza um CardElement (forma, ícone ou imagem) no card.
 * Posição e tamanho são em % do card — convertemos para px aqui.
 *
 * Quando `editable=true && selected`, mostra 4 handles de canto para
 * redimensionar e 1 handle superior para rotacionar.
 *
 * Math de resize: a delta do pointer (em screen coords) é projetada
 * no frame local do elemento (desfazendo a rotação) antes de aplicar
 * a w/h. Isso garante que arrastar o handle SE de um elemento rotado
 * em 45° aumenta a largura ao longo do eixo local do elemento, não
 * do eixo da tela. A posição (x,y) é o canto top-left do bbox não
 * rotado; durante resize ancorado em corners opostos, ajustamos x,y
 * para manter o corner oposto fixo no frame local.
 *
 * Shift durante resize trava aspect ratio; durante rotate, snap 15°.
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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    mode: DragMode
    startX: number
    startY: number
    elX: number
    elY: number
    elW: number
    elH: number
    elRotation: number
    // Para rotate
    centerX?: number
    centerY?: number
    startAngleDeg?: number
  } | null>(null)

  function startDrag(mode: DragMode, e: React.PointerEvent<HTMLElement>) {
    if (!editable) return
    e.stopPropagation()
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId)
    } catch {/* ignore */}
    if (mode === 'move') onSelect?.()

    const data: NonNullable<typeof dragRef.current> = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      elX: element.x,
      elY: element.y,
      elW: element.w,
      elH: element.h,
      elRotation: element.rotation,
    }
    if (mode === 'rotate' && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      data.centerX = rect.left + rect.width / 2
      data.centerY = rect.top + rect.height / 2
      data.startAngleDeg = (Math.atan2(e.clientY - data.centerY, e.clientX - data.centerX) * 180) / Math.PI
    }
    dragRef.current = data
  }

  function moveDrag(e: React.PointerEvent<HTMLElement>) {
    const r = dragRef.current
    if (!r || !onChange) return

    // ── ROTATE ──
    if (r.mode === 'rotate') {
      const cx = r.centerX!, cy = r.centerY!
      const startDeg = r.startAngleDeg!
      const currentDeg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
      let next = r.elRotation + (currentDeg - startDeg)
      if (e.shiftKey) next = Math.round(next / 15) * 15
      onChange({ rotation: next })
      return
    }

    // ── MOVE ──
    if (r.mode === 'move') {
      const dxPct = ((e.clientX - r.startX) / cardWidth) * 100
      const dyPct = ((e.clientY - r.startY) / cardHeight) * 100
      onChange({ x: r.elX + dxPct, y: r.elY + dyPct })
      return
    }

    // ── RESIZE (corners) ──
    // Projeta delta do screen pro frame local (desfaz a rotação)
    const rad = (r.elRotation * Math.PI) / 180
    const dxScreen = e.clientX - r.startX
    const dyScreen = e.clientY - r.startY
    const dxLocal = dxScreen * Math.cos(rad) + dyScreen * Math.sin(rad)
    const dyLocal = -dxScreen * Math.sin(rad) + dyScreen * Math.cos(rad)
    const dxPct = (dxLocal / cardWidth) * 100
    const dyPct = (dyLocal / cardHeight) * 100

    let newX = r.elX, newY = r.elY, newW = r.elW, newH = r.elH
    switch (r.mode) {
      case 'se':
        newW = Math.max(2, r.elW + dxPct)
        newH = Math.max(2, r.elH + dyPct)
        break
      case 'nw':
        newW = Math.max(2, r.elW - dxPct)
        newH = Math.max(2, r.elH - dyPct)
        newX = r.elX + (r.elW - newW)
        newY = r.elY + (r.elH - newH)
        break
      case 'ne':
        newW = Math.max(2, r.elW + dxPct)
        newH = Math.max(2, r.elH - dyPct)
        newY = r.elY + (r.elH - newH)
        break
      case 'sw':
        newW = Math.max(2, r.elW - dxPct)
        newH = Math.max(2, r.elH + dyPct)
        newX = r.elX + (r.elW - newW)
        break
    }

    // Shift = trava aspect ratio
    if (e.shiftKey && r.elH > 0) {
      const ratio = r.elW / r.elH
      if (newW / newH > ratio) newW = newH * ratio
      else newH = newW / ratio
    }

    onChange({ x: newX, y: newY, w: newW, h: newH })
  }

  function endDrag(e: React.PointerEvent<HTMLElement>) {
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

  const showHandles = editable && selected

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
    // overflow visível para que os handles apareçam fora do bbox
    overflow: 'visible',
  }

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onPointerDown={(e) => startDrag('move', e)}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <ElementVisual element={element} />

      {showHandles && (
        <>
          {/* Linha conectando o handle de rotação à borda superior */}
          <div
            style={{
              position: 'absolute',
              top: -ROTATION_OFFSET + HANDLE_SIZE / 2,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 2,
              height: ROTATION_OFFSET - HANDLE_SIZE / 2,
              backgroundColor: '#c9a86a',
              opacity: element.opacity > 0 ? 1 / (element.opacity / 100) : 1,
              pointerEvents: 'none',
            }}
          />

          {/* Handle de rotação (círculo no topo) */}
          <Handle
            cursor="grab"
            shape="circle"
            style={{
              top: -ROTATION_OFFSET,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            onPointerDown={(e) => startDrag('rotate', e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />

          {/* 4 handles de canto */}
          <Handle
            cursor="nwse-resize"
            style={{ top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 }}
            onPointerDown={(e) => startDrag('nw', e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          <Handle
            cursor="nesw-resize"
            style={{ top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 }}
            onPointerDown={(e) => startDrag('ne', e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          <Handle
            cursor="nwse-resize"
            style={{ bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 }}
            onPointerDown={(e) => startDrag('se', e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          <Handle
            cursor="nesw-resize"
            style={{ bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 }}
            onPointerDown={(e) => startDrag('sw', e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </>
      )}
    </div>
  )
}

function Handle({
  style,
  cursor,
  shape = 'square',
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  style: React.CSSProperties
  cursor: string
  shape?: 'square' | 'circle'
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        position: 'absolute',
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        backgroundColor: '#c9a86a',
        border: '2px solid #fff',
        borderRadius: shape === 'circle' ? '50%' : 2,
        cursor,
        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
        // Garante que opacidade do wrapper não afete os handles
        opacity: 1,
        ...style,
      }}
    />
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
      return <div style={{ width: '100%', height: '100%', backgroundColor: element.color }} />
    }
    if (element.shape === 'line') {
      return <div style={{ width: '100%', height: '100%', backgroundColor: element.color }} />
    }
    if (element.shape === 'triangle') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
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
