'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalIcon } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, parseISO
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent, CalendarStatus, Workspace } from '@/types'
import { PLATFORM_LABELS, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Props {
  workspace: Workspace
  events: CalendarEvent[]
  pautas: Array<{ id: string; title: string; platform: string[]; format: string; status: string }>
}

export function CalendarClient({ workspace, events, pautas }: Props) {
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

  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

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
    const supabase = createClient()
    await supabase.from('calendar_events').delete().eq('id', eventId)
    setShowModal(false)
    router.refresh()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendário Editorial</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Planeje e visualize suas publicações
          </p>
        </div>
        <button
          onClick={() => { setSelectedDate(new Date()); setModalEvent(null); setShowModal(true) }}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo evento
        </button>
      </div>

      {/* Calendar header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'min-h-[90px] p-1.5 border-b border-r border-border cursor-pointer hover:bg-accent/50 transition-colors',
                  !isCurrentMonth && 'bg-muted/20',
                  idx % 7 === 6 && 'border-r-0'
                )}
              >
                <span className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                  isTodayDate ? 'bg-primary text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(event => (
                    <button
                      key={event.id}
                      onClick={e => handleEventClick(event, e)}
                      className="w-full text-left rounded px-1.5 py-0.5 text-xs font-medium truncate transition-opacity hover:opacity-80"
                      style={{ backgroundColor: event.color + '30', color: event.color }}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-muted-foreground pl-1">
                      +{dayEvents.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            )
          })}
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

function EventModal({
  workspace, pautas, event, selectedDate, onClose, onSave, onDelete
}: {
  workspace: Workspace
  pautas: Array<{ id: string; title: string; platform: string[]; format: string }>
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
    color: event?.color || '#6366f1',
    status: event?.status || 'agendado',
  })
  const [loading, setLoading] = useState(false)

  const selectedPauta = pautas.find(p => p.id === form.pauta_id)

  async function handleSave() {
    if (!form.title && !form.pauta_id) return
    setLoading(true)

    const supabase = createClient()
    const payload = {
      workspace_id: workspace.id,
      title: form.title || (selectedPauta?.title || ''),
      pauta_id: form.pauta_id || null,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time || null,
      platform: form.platform.length > 0 ? form.platform : (selectedPauta?.platform || []),
      color: form.color,
      status: form.status,
    }

    if (event) {
      await supabase.from('calendar_events').update(payload).eq('id', event.id)
    } else {
      await supabase.from('calendar_events').insert(payload)
    }

    setLoading(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <CalIcon className="h-4 w-4" />
            {event ? 'Editar evento' : 'Novo evento'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Pauta relacionada</label>
            <select
              value={form.pauta_id}
              onChange={e => setForm(p => ({ ...p, pauta_id: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Nenhuma pauta</option>
              {pautas.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {!form.pauta_id && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Título do evento *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Nome do evento"
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Data *</label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Horário</label>
              <input
                type="time"
                value={form.scheduled_time}
                onChange={e => setForm(p => ({ ...p, scheduled_time: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as CalendarStatus }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="agendado">Agendado</option>
                <option value="publicado">Publicado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="h-9 w-12 px-1 py-1 border border-input rounded-lg cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">{form.color}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-border">
          {event ? (
            <button
              onClick={() => onDelete(event.id)}
              className="text-sm text-destructive hover:underline"
            >
              Excluir evento
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-input hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || (!form.title && !form.pauta_id)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
