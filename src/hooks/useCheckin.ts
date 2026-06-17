import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getTodayString, getDaysAgoString } from '../lib/utils'
import type { Checkin } from '../types'

interface SaveCheckinData {
  mood: number
  energy: number
  sleep_hours: number
  physical: string[]
  note: string
}

interface UseCheckinReturn {
  todayCheckin: Checkin | null
  loading: boolean
  saveCheckin: (data: SaveCheckinData) => Promise<{ error: string | null }>
  getCheckins: (days: number) => Promise<Checkin[]>
}

export function useCheckin(userId: string | undefined): UseCheckinReturn {
  const [todayCheckin, setTodayCheckin] = useState<Checkin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchTodayCheckin() {
      const today = getTodayString()
      const { data } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      setTodayCheckin(data ?? null)
      setLoading(false)
    }

    fetchTodayCheckin()
  }, [userId])

  async function saveCheckin(data: SaveCheckinData): Promise<{ error: string | null }> {
    if (!userId) return { error: 'Usuário não autenticado' }

    const today = getTodayString()
    const payload = { ...data, user_id: userId, date: today }

    const { data: saved, error } = await supabase
      .from('checkins')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select()
      .single()

    if (error) return { error: error.message }

    setTodayCheckin(saved)
    return { error: null }
  }

  async function getCheckins(days: number): Promise<Checkin[]> {
    if (!userId) return []

    const fromDate = getDaysAgoString(days)
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .order('date', { ascending: true })

    if (error) return []
    return data ?? []
  }

  return { todayCheckin, loading, saveCheckin, getCheckins }
}
