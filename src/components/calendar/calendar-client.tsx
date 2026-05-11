'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalIcon, Loader2, Check } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, parseISO
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent, CalendarStatus, Workspace } from '@/types'
import { cn } from '@/lib/utils'
import { DnaIncompleteBanner } from '@/components/shared/dna-incomplete-banner'

interface PautaLite {
  id: string
  title: string
  platform: string[]
  format: string
  status?: string
}

interface Props {
  workspace: Workspace
  events: CalendarEvent[]
  pautas: PautaLite[]
  dnaIncomplete?: boolean
}

export function CalendarClient({ workspace, events, pautas, dnaIncomplete }: Props) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalEvent, setModalEvent] = useState<CalendarEvent | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function getEventsForDay(day: Date) {
    return events.filter(e => isSameDay(parseISO(e.scheduled_date), day))
  }

  function prevMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }
  function todayBtn() { setCurrentDate(new Date()) }

  function handleDayClick(day: Date) {
    setSelectedDate(day)
    setModalEvent(null)
    setShowModal(true)
  }

  function handleEventClick(event: CalendarEvent, e: React.MouseEvent) {
    e.stopPropagation()
    setModalEvent(event)
    setShowModal(true)
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm('Excluir este evento?')) return
    const res = await fetch(`/api/calendar-events?id=${eventId}`, { method: 'DELETE' })
    if (res.ok) {
      setShowModal(false)
      router.refresh()
    }
  }

  // Stats
  const monthEvents = events.filter(e => isSameMonth(parseISO(e.scheduled_date), currentDate))
  const stats = {
    total: monthEvents.length,
    agendados: monthEvents.filter(e => e.status === 'agendado').length,
    publicados: monthEvents.filter(e => e.status === 'publicado').length,
  }

  return (
    <div className="min-h-screen bg-background">

      {dnaIncomplete && <DnaIncompleteBanner workspaceSlug={workspace.slug} variant="sticky" />}

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="px-4 md:px-8 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground tracking-luxe uppercase">
              {workspace.name}
            </p>
            <h1 className="font-serif text-xl md:text-2xl tracking-tight mt-0.5 truncate">
              Calendário <span className="text-gold italic">Editorial</span>
            </h1>
          </div>
          <button
            onClick={() => { setSelectedDate(new Date()); setModalEvent(null); setShowModal(true) }}
            className="flex items-center gap-1.5 bg-gold text-ink px-4 py-2 text-xs tracking-luxe uppercase font-semibold hover:bg-gold-soft transition-colors flex-shrink-0"
          >
            <Plus className="h-3 w-3" /> Novo evento
          </button>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">

        {/* Stats row */}
        <section className="grid grid-cols-3 gap-4 md:gap-6 border-b border-border pb-6 md:pb-8">
          <Stat n={stats.total} label="Eventos no mês" />
          <Stat n={stats.agendados} label="Agendados" />
          <Stat n={stats.publicados} label="Publicados" />
        </section>

        {/* Calendar nav */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 border border-border hover:border-gold/40 transition-colors" aria-label="Mês anterior">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={nextMonth} className="p-2 border border-border hover:border-gold/40 transition-colors" aria-label="Próximo mês">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={todayBtn} className="text-[10px] tracking-luxe uppercase text-muted-foreground hover:text-foreground transition-colors px-3 py-2 border border-border hover:border-border/80">
              Hoje
            </button>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight capitalize">
            {format(currentDate, "MMMM", { locale: ptBR })} <span className="text-gold italic">{format(currentDate, 'yyyy', { locale: ptBR })}</span>
          </h2>
        </div>

        {/* Calendar grid */}
        <div className="bg-card border border-border overflow-hidden">

          {/* Day names */}
          <div className="grid grid-cols-7 border-b border-border bg-background/50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-[10px] tracking-luxe uppercase text-muted-foreground py-3 font-semibold">
                <span className="md:hidden">{day.charAt(0)}</span>
                <span className="hidden md:inline">{day}</span>
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isTodayDate = isToday(day)
              const isLastInRow = idx % 7 === 6

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'min-h-[80px] md:min-h-[110px] p-1.5 md:p-2.5 border-b border-r border-border cursor-pointer hover:bg-gold/5 transition-colors group',
                    !isCurrentMonth && 'bg-background/40',
                    isLastInRow && 'border-r-0'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      'inline-flex h-6 w-6 items-center justify-center text-xs font-serif font-semibold rounded-full transition-colors',
                      isTodayDate ? 'bg-gold text-ink' :
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/60'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] text-gold tracking-luxe">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    {dayEvents.slice(0, window?.innerWidth < 768 ? 1 : 3).map(event => (
                      <button
                        key={event.id}
                        onClick={e => handleEventClick(event, e)}
                        className="w-full text-left px-1.5 py-0.5 text-[10px] font-medium truncate hover:opacity-80 transition-opacity border-l-2"
                        style={{
                          backgroundColor: (event.color || '#c9a86a') + '15',
                          color: event.color || '#c9a86a',
                          borderLeftColor: event.color || '#c9a86a',
                        }}
                      >
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > (window?.innerWidth < 768 ? 1 : 3) && (
                      <span className="text-[9px] text-muted-foreground pl-1.5 tracking-wide">
                        +{dayEvents.length - (window?.innerWidth < 768 ? 1 : 3)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-[10px] tracking-luxe uppercase text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gold" /> Hoje
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-zinc-400" /> Agendado
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" /> Publicado
          </span>
        </div>
      </div>

      {showModal && (
        <EventModal
          workspace={workspace}
          pautas={pautas}
          event={modalEvent}
          selectedDate={selectedDate || new Date()}
          onClose={() => { setShowModal(false); setModalEvent(null) }}
          onSave={() => { setShowModal(false); setModalEvent(null); router.refresh() }}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}

// ─── Stat ──────────────────────────────────────────────────────────────────
function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="font-serif text-3xl md:text-5xl text-gold leading-none">{n}</div>
      <div className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</div>
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────
function EventModal({
  workspace, pautas, event, selectedDate, onClose, onSave, onDelete
}: {
  workspace: Workspace
  pautas: PautaLite[]
  event: CalendarEvent | null
  selectedDate: Date
  onClose: () => void
  onSave: () => void
  onDelete: (id: string) => void
}) {
  const [form, setForm] = useState({
    title: event?.title || '',
    pauta_id: event?.pauta_id || '',
    scheduled_date: event?.scheduled_date || format(selectedDate, 'yyyy-MM-dd'),
    scheduled_time: event?.scheduled_time || '',
    platform: event?.platform || [] as string[],
    color: event?.color || '#c9a86a',
    status: event?.status || 'agendado' as CalendarStatus,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPauta = pautas.find(p => p.id === form.pauta_id)

  async function handleSave() {
    if (!form.title && !form.pauta_id) {
      setError('Adicione um título ou selecione uma pauta.')
      return
    }
    setSaving(true); setError(null)

    const payload: any = {
      workspace_id: workspace.id,
      title: form.title || (selectedPauta?.title || ''),
      pauta_id: form.pauta_id || null,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time || null,
      platform: form.platform.length > 0 ? form.platform : (selectedPauta?.platform || []),
      color: form.color,
      status: form.status,
    }

    try {
      const res = await fetch('/api/calendar-events', {
        method: event ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event ? { id: event.id, ...payload } : payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      onSave()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md md:rounded">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">
              {event ? 'Editar' : 'Novo evento'}
            </p>
            <h2 className="font-serif text-xl mt-0.5 flex items-center gap-2">
              <CalIcon className="h-4 w-4 text-gold" />
              {event ? 'Evento' : 'Agendamento'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Field label="Pauta relacionada" hint="Vincule a uma pauta existente ou crie um evento livre.">
            <select
              value={form.pauta_id}
              onChange={e => setForm(p => ({ ...p, pauta_id: e.target.value }))}
              className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
            >
              <option value="">Sem pauta vinculada</option>
              {pautas.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          {!form.pauta_id && (
            <Field label="Título do evento *">
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Nome do evento"
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data *">
              <input
                type="date"
                value={form.scheduled_date}
                onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              />
            </Field>
            <Field label="Horário">
              <input
                type="time"
                value={form.scheduled_time}
                onChange={e => setForm(p => ({ ...p, scheduled_time: e.target.value }))}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as CalendarStatus }))}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              >
                <option value="agendado">Agendado</option>
                <option value="publicado">Publicado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Field>
            <Field label="Cor">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="h-10 w-12 cursor-pointer bg-transparent border border-border"
                />
                <span className="text-xs text-muted-foreground font-mono">{form.color}</span>
              </div>
            </Field>
          </div>

          {error && <p className="text-xs text-red-400">✗ {error}</p>}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-border">
          {event ? (
            <button
              onClick={() => onDelete(event.id)}
              className="text-[10px] tracking-luxe uppercase text-red-400 hover:text-red-300 transition-colors"
            >
              Excluir evento
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-[10px] tracking-luxe uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!form.title && !form.pauta_id)}
              className="flex items-center gap-1.5 bg-gold text-ink px-4 py-2.5 text-[10px] tracking-luxe uppercase font-semibold hover:bg-gold-soft transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              {saving ? 'Salvando' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}
