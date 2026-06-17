import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateWeeklyInsight } from '../lib/anthropic'
import { getWeekStart, getDaysAgoString } from '../lib/utils'
import type { Checkin, Insight } from '../types'

interface UseInsightReturn {
  insight: Insight | null
  loading: boolean
  generating: boolean
  generateInsight: () => Promise<{ error: string | null }>
}

export function useInsight(userId: string | undefined): UseInsightReturn {
  const [insight, setInsight] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchCurrentInsight() {
      const weekStart = getWeekStart()
      const { data } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .single()

      setInsight(data ?? null)
      setLoading(false)
    }

    fetchCurrentInsight()
  }, [userId])

  async function generateInsight(): Promise<{ error: string | null }> {
    if (!userId) return { error: 'User not authenticated' }

    setGenerating(true)

    try {
      const fromDate = getDaysAgoString(7)
      const { data: checkins, error: fetchError } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('date', fromDate)
        .order('date', { ascending: true })

      if (fetchError) {
        setGenerating(false)
        return { error: fetchError.message }
      }

      const weekCheckins = (checkins ?? []) as Checkin[]

      if (weekCheckins.length < 3) {
        setGenerating(false)
        return { error: 'Complete at least 3 check-ins this week to generate an insight.' }
      }

      const content = await generateWeeklyInsight(weekCheckins)
      const weekStart = getWeekStart()

      const payload = {
        user_id: userId,
        week_start: weekStart,
        content,
        generated_at: new Date().toISOString(),
      }

      const { data: saved, error: saveError } = await supabase
        .from('insights')
        .upsert(payload, { onConflict: 'user_id,week_start' })
        .select()
        .single()

      if (saveError) {
        setGenerating(false)
        return { error: saveError.message }
      }

      setInsight(saved)
      setGenerating(false)
      return { error: null }
    } catch (err) {
      setGenerating(false)
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return { insight, loading, generating, generateInsight }
}
