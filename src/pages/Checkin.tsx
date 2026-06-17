import { useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { useCheckin } from '../hooks/useCheckin'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Slider } from '../components/ui/Slider'
import { Badge } from '../components/ui/Badge'
import { Toast } from '../components/ui/Toast'
import { getGreeting, getMoodEmoji, getMoodLabel, getEnergyLabel, formatDate } from '../lib/utils'

const MOOD_OPTIONS = [1, 2, 3, 4, 5] as const
const MOOD_LABELS = ['Péssimo', 'Ruim', 'Ok', 'Bom', 'Ótimo']

const PHYSICAL_OPTIONS = [
  { value: 'headache', label: 'Dor de cabeça', icon: '🤕' },
  { value: 'fatigue', label: 'Cansaço', icon: '😴' },
  { value: 'nausea', label: 'Náusea', icon: '🤢' },
  { value: 'tension', label: 'Tensão', icon: '😤' },
  { value: 'none', label: 'Nenhum', icon: '✅' },
]

function getTimeSubtitle() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Como você acordou hoje?'
  if (hour < 18) return 'Como está sendo sua tarde?'
  return 'Como foi seu dia?'
}

interface CheckinPageProps {
  user: User
}

export function Checkin({ user }: CheckinPageProps) {
  const name = (user.user_metadata?.name as string) ?? user.email?.split('@')[0] ?? 'você'
  const { todayCheckin, loading, saveCheckin } = useCheckin(user.id)

  const [editing, setEditing] = useState(false)
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)
  const [physical, setPhysical] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function togglePhysical(value: string) {
    if (value === 'none') {
      setPhysical(['none'])
      return
    }
    setPhysical((prev) => {
      const without = prev.filter((v) => v !== 'none')
      return without.includes(value) ? without.filter((v) => v !== value) : [...without, value]
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await saveCheckin({
      mood,
      energy,
      sleep_hours: sleepHours,
      physical: physical.length === 0 ? ['none'] : physical,
      note,
    })

    setSaving(false)

    if (error) {
      setToast({ message: error, type: 'error' })
    } else {
      setToast({ message: 'Check-in salvo com sucesso!', type: 'success' })
      setEditing(false)
    }
  }

  function startEdit() {
    if (todayCheckin) {
      setMood(todayCheckin.mood)
      setEnergy(todayCheckin.energy)
      setSleepHours(todayCheckin.sleep_hours)
      setPhysical(todayCheckin.physical)
      setNote(todayCheckin.note)
    }
    setEditing(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const showForm = !todayCheckin || editing

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="animate-fade-in">
        <p className="text-white/50 text-sm">{getGreeting()},</p>
        <h1 className="text-3xl font-bold text-white capitalize">{name} 👋</h1>
        <p className="text-white/40 text-sm mt-1">{getTimeSubtitle()}</p>
      </div>

      {!showForm && todayCheckin && (
        <Card className="space-y-4">
          <div className="text-center pt-2 pb-4 border-b border-white/5">
            <div className="text-5xl mb-3">{getMoodEmoji(todayCheckin.mood)}</div>
            <Badge variant="success">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline mr-1">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Feito
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xl mb-1">🌙</p>
              <p className="text-lg font-bold text-white">{todayCheckin.sleep_hours}h</p>
              <p className="text-xs text-white/50 mt-0.5">Sono</p>
            </div>
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xl mb-1">⚡</p>
              <p className="text-lg font-bold text-white">{todayCheckin.energy}/5</p>
              <p className="text-xs text-white/50 mt-0.5">Energia</p>
            </div>
            <div className="bg-bg rounded-xl p-3 text-center">
              <p className="text-xl mb-1">💭</p>
              <p className="text-sm font-bold text-white">{getMoodLabel(todayCheckin.mood)}</p>
              <p className="text-xs text-white/50 mt-0.5">Humor</p>
            </div>
          </div>

          {todayCheckin.physical.length > 0 && !todayCheckin.physical.includes('none') && (
            <div className="flex flex-wrap gap-2">
              {todayCheckin.physical.map((s) => (
                <Badge key={s} variant="warning">
                  {PHYSICAL_OPTIONS.find((o) => o.value === s)?.icon}{' '}
                  {PHYSICAL_OPTIONS.find((o) => o.value === s)?.label ?? s}
                </Badge>
              ))}
            </div>
          )}

          {todayCheckin.note && (
            <p className="text-white/70 text-sm italic border-l-2 border-primary/30 pl-3">
              "{todayCheckin.note}"
            </p>
          )}

          <Button variant="ghost" onClick={startEdit} className="w-full border border-white/10">
            Editar check-in
          </Button>
        </Card>
      )}

      {showForm && (
        <Card className="border border-purple-500/20 bg-gradient-to-b from-white/5 to-transparent">
          <h2 className="font-semibold text-white mb-5">
            {todayCheckin ? 'Editar check-in' : 'Como você está hoje?'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Humor */}
            <div>
              <label className="block text-sm text-white/70 mb-3">Como está seu humor?</label>
              <div className="flex justify-between gap-2">
                {MOOD_OPTIONS.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all duration-150 ${
                      mood === m
                        ? 'ring-2 ring-purple-500 bg-purple-500/20 scale-110'
                        : 'bg-bg border border-transparent hover:border-white/10 opacity-50 hover:opacity-70'
                    }`}
                  >
                    <span className="text-3xl">{getMoodEmoji(m)}</span>
                    <span className="text-[10px] text-gray-400 mt-1">{MOOD_LABELS[idx]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energia */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-white/70">Nível de energia</label>
                <span className="text-lg font-bold text-purple-400">{energy}/5</span>
              </div>
              <Slider
                value={energy}
                min={1}
                max={5}
                onChange={setEnergy}
                label={getEnergyLabel(energy)}
              />
            </div>

            {/* Sono */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-white/70">Horas de sono</label>
                <span className="text-sm font-medium text-primary">{sleepHours}h</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">h</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[5, 6, 7, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSleepHours(h)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      sleepHours === h
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : 'bg-bg border border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Sintomas físicos */}
            <div>
              <label className="block text-sm text-white/70 mb-3">Sintomas físicos</label>
              <div className="flex flex-wrap gap-2">
                {PHYSICAL_OPTIONS.map((opt) => {
                  const selected = physical.includes(opt.value)
                  const isNone = opt.value === 'none'
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => togglePhysical(opt.value)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm border transition-all duration-150 ${
                        selected
                          ? isNone
                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                            : 'bg-red-500/20 border-red-500/50 text-red-300'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Nota livre */}
            <div>
              <label className="block text-sm text-white/70 mb-2">Nota livre</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Conte como foi... (opcional)"
                rows={3}
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              {editing && (
                <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="flex-1">
                  Cancelar
                </Button>
              )}
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base text-white transition-all duration-150 bg-gradient-to-r from-purple-600 to-purple-500 hover:brightness-110 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar check-in'
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      {todayCheckin && !editing && (
        <p className="text-center text-xs text-white/30">
          Registrado em {formatDate(todayCheckin.date)}
        </p>
      )}
    </div>
  )
}
