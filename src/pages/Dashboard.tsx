import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useCheckin } from '../hooks/useCheckin'
import { Card } from '../components/ui/Card'
import { getMoodEmoji, formatDateShort, average } from '../lib/utils'
import type { Checkin } from '../types'

interface DashboardProps {
  user: User
}

interface ChartPoint {
  date: string
  mood: number
  energy: number
  sleep: number
}

export function Dashboard({ user }: DashboardProps) {
  const { getCheckins } = useCheckin(user.id)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCheckins(14).then((data) => {
      setCheckins(data)
      setLoading(false)
    })
  }, [])

  const chartData: ChartPoint[] = checkins.map((c) => ({
    date: formatDateShort(c.date),
    mood: c.mood,
    energy: c.energy,
    sleep: c.sleep_hours,
  }))

  const week = checkins.slice(-7)
  const avgMood = average(week.map((c) => c.mood))
  const avgEnergy = average(week.map((c) => c.energy))
  const avgSleep = average(week.map((c) => c.sleep_hours))

  const tooltipStyle = {
    backgroundColor: '#1a1a24',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (checkins.length < 2) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Your patterns</h1>
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-white font-medium mb-1">Not enough data yet</p>
          <p className="text-white/50 text-sm">Keep doing check-ins to see your patterns.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Your patterns</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm" className="text-center">
          <p className="text-2xl mb-0.5">{getMoodEmoji(Math.round(avgMood))}</p>
          <p className="text-lg font-bold text-white">{avgMood}</p>
          <p className="text-xs text-white/50">Mood</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-primary mb-0.5">{avgEnergy}</p>
          <p className="text-lg font-bold text-white">/5</p>
          <p className="text-xs text-white/50">Energy</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-success mb-0.5">{avgSleep}h</p>
          <p className="text-xs text-white/50 mt-1">Avg. sleep</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-white mb-4">Mood & energy (14 days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
            <Line type="monotone" dataKey="mood" name="Mood" stroke="#7c6af7" strokeWidth={2} dot={{ fill: '#7c6af7', r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="energy" name="Energy" stroke="#4ade80" strokeWidth={2} dot={{ fill: '#4ade80', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="font-semibold text-white mb-4">Sleep hours (14 days)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="sleep" name="Sleep (h)" fill="#facc15" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
