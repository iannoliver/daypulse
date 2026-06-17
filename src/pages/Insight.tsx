import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useInsight } from '../hooks/useInsight'
import { useCheckin } from '../hooks/useCheckin'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import type { Checkin } from '../types'

interface InsightPageProps {
  user: User
}

function WaveIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="12" fill="#7c6af7" fillOpacity="0.8" />
      <circle cx="40" cy="40" r="22" stroke="#7c6af7" strokeOpacity="0.5" strokeWidth="2" />
      <circle cx="40" cy="40" r="32" stroke="#7c6af7" strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="38" stroke="#7c6af7" strokeOpacity="0.15" strokeWidth="1" />
    </svg>
  )
}

function CalendarIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="48" height="42" rx="6" stroke="#7c6af7" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="8" y1="26" x2="56" y2="26" stroke="#7c6af7" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="22" y1="8" x2="22" y2="20" stroke="#7c6af7" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="8" x2="42" y2="20" stroke="#7c6af7" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <rect x="16" y="32" width="8" height="6" rx="2" fill="#7c6af7" fillOpacity="0.4" />
      <rect x="28" y="32" width="8" height="6" rx="2" fill="#7c6af7" fillOpacity="0.2" />
      <rect x="40" y="32" width="8" height="6" rx="2" fill="#7c6af7" fillOpacity="0.2" />
      <rect x="16" y="42" width="8" height="6" rx="2" fill="#7c6af7" fillOpacity="0.4" />
      <rect x="28" y="42" width="8" height="6" rx="2" fill="#7c6af7" fillOpacity="0.2" />
    </svg>
  )
}

export function Insight({ user }: InsightPageProps) {
  const { insight, loading, generating, generateInsight } = useInsight(user.id)
  const { getCheckins } = useCheckin(user.id)
  const [weekCheckins, setWeekCheckins] = useState<Checkin[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getCheckins(7).then(setWeekCheckins)
  }, [])

  const hasEnough = weekCheckins.length >= 3
  const generatedToday = insight
    ? new Date(insight.generated_at).toDateString() === new Date().toDateString()
    : false

  async function handleGenerate() {
    setError('')
    const { error } = await generateInsight()
    if (error) setError(error)
  }

  function formatGeneratedAt(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const badgeVariant = weekCheckins.length >= 7 ? 'success' : weekCheckins.length >= 3 ? 'warning' : 'primary'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Insight semanal</h1>
        <Badge variant={badgeVariant}>
          {weekCheckins.length >= 7 && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline mr-1">
              <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {weekCheckins.length}/7 dias
        </Badge>
      </div>

      {!hasEnough && (
        <Card className="text-center py-8 space-y-4">
          <div className="flex justify-center">
            <CalendarIllustration />
          </div>
          <div>
            <p className="text-white font-medium mb-1">Poucos dados esta semana</p>
            <p className="text-white/50 text-sm">
              Faça pelo menos <span className="text-primary font-medium">3 check-ins</span> esta semana para receber seu insight personalizado.
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-3">
              {weekCheckins.length} de 7 check-ins registrados
            </p>
            <div className="flex justify-center gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < weekCheckins.length ? 'bg-purple-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {hasEnough && (
        <>
          <button
            onClick={handleGenerate}
            disabled={generatedToday || generating}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base text-white transition-all duration-150 bg-gradient-to-r from-purple-600 to-purple-500 hover:brightness-110 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>
                  Analisando sua semana
                  <span className="inline-flex ml-0.5">
                    <span className="animate-[bounce_1s_ease-in-out_0s_infinite]">.</span>
                    <span className="animate-[bounce_1s_ease-in-out_0.2s_infinite]">.</span>
                    <span className="animate-[bounce_1s_ease-in-out_0.4s_infinite]">.</span>
                  </span>
                </span>
              </>
            ) : generatedToday ? (
              'Insight gerado hoje ✓'
            ) : (
              <>
                <span className="text-lg leading-none">✦</span>
                Gerar insight da semana
              </>
            )}
          </button>

          {error && (
            <p className="text-danger text-sm bg-danger/10 rounded-xl px-4 py-3">{error}</p>
          )}
        </>
      )}

      {generating && (
        <Card className="text-center py-8">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">
            Analisando sua semana
            <span className="inline-flex ml-0.5">
              <span className="animate-[bounce_1s_ease-in-out_0s_infinite]">.</span>
              <span className="animate-[bounce_1s_ease-in-out_0.2s_infinite]">.</span>
              <span className="animate-[bounce_1s_ease-in-out_0.4s_infinite]">.</span>
            </span>
          </p>
          <p className="text-white/50 text-sm mt-1">A IA está processando seus dados de bem-estar.</p>
        </Card>
      )}

      {insight && !generating && (
        <Card className="overflow-hidden p-0">
          <div className="h-1 bg-gradient-to-r from-purple-600 to-blue-500" />
          <div className="p-4 space-y-4">
            <div className="relative">
              <span className="absolute -top-1 -left-1 text-6xl text-purple-500 opacity-20 font-serif leading-none select-none">"</span>
              <div className="pt-6 space-y-3">
                {insight.content.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-gray-200 text-sm leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Gerado em {formatGeneratedAt(insight.generated_at)}
              </div>
              {!generatedToday && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="text-white/30 hover:text-white/60 border border-white/10 text-xs"
                >
                  Regenerar
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {!insight && !generating && hasEnough && (
        <Card className="text-center py-8 space-y-4">
          <div className="flex justify-center">
            <WaveIllustration />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Sua semana em palavras</p>
            <p className="text-white/50 text-sm mt-1">
              A IA vai analisar seus {weekCheckins.length} check-ins e identificar padrões no seu bem-estar
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
