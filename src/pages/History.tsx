import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useCheckin } from '../hooks/useCheckin'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { getMoodEmoji, getMoodColor, getMoodLabel, getEnergyLabel, formatDate } from '../lib/utils'
import type { Checkin } from '../types'

interface HistoryProps {
  user: User
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const PHYSICAL_LABELS: Record<string, string> = {
  headache: 'Headache',
  fatigue: 'Fatigue',
  nausea: 'Nausea',
  tension: 'Tension',
  none: 'None',
}

export function History({ user }: HistoryProps) {
  const { getCheckins } = useCheckin(user.id)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Checkin | null>(null)
  const [viewDate, setViewDate] = useState(() => new Date())

  useEffect(() => {
    getCheckins(90).then((data) => {
      setCheckins(data)
      setLoading(false)
    })
  }, [])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const checkinMap = new Map<string, Checkin>()
  checkins.forEach((c) => checkinMap.set(c.date, c))

  function padDate(n: number) {
    return String(n).padStart(2, '0')
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    setSelected(null)
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    setSelected(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">History</h1>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
            ‹
          </button>
          <h2 className="font-semibold text-white">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs text-white/30 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${padDate(month + 1)}-${padDate(day)}`
            const checkin = checkinMap.get(dateStr)
            const isSelected = selected?.date === dateStr
            const isToday = dateStr === new Date().toISOString().slice(0, 10)

            return (
              <button
                key={dateStr}
                onClick={() => setSelected(isSelected ? null : (checkin ?? null))}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all
                  ${checkin ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''}
                  ${isToday && !checkin ? 'border border-white/20' : ''}
                `}
              >
                {checkin ? (
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base font-medium"
                    style={{ backgroundColor: getMoodColor(checkin.mood) + '33', color: getMoodColor(checkin.mood) }}
                  >
                    {day}
                  </span>
                ) : (
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-white/30">
                    {day}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
          {[{ color: '#f87171', label: 'Bad' }, { color: '#facc15', label: 'Neutral' }, { color: '#4ade80', label: 'Good' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color + '66', border: `1px solid ${color}` }} />
              {label}
            </div>
          ))}
        </div>
      </Card>

      {selected && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{formatDate(selected.date)}</h3>
            <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-2xl">{getMoodEmoji(selected.mood)}</p>
              <p className="text-xs text-white/50 mt-1">Mood</p>
              <p className="text-xs font-medium text-white">{getMoodLabel(selected.mood)}</p>
            </div>
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-primary">{selected.energy}/5</p>
              <p className="text-xs text-white/50 mt-1">Energy</p>
              <p className="text-xs font-medium text-white">{getEnergyLabel(selected.energy)}</p>
            </div>
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-success">{selected.sleep_hours}h</p>
              <p className="text-xs text-white/50 mt-1">Sleep</p>
            </div>
          </div>

          {selected.physical.length > 0 && !selected.physical.includes('none') && (
            <div>
              <p className="text-xs text-white/50 mb-2">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {selected.physical.map((s) => (
                  <Badge key={s} variant="warning">{PHYSICAL_LABELS[s] ?? s}</Badge>
                ))}
              </div>
            </div>
          )}

          {selected.note && (
            <div>
              <p className="text-xs text-white/50 mb-1">Note</p>
              <p className="text-sm text-white/80 italic">"{selected.note}"</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
