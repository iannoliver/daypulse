export interface Profile {
  id: string
  name: string
  created_at: string
}

export interface Checkin {
  id: string
  user_id: string
  date: string
  mood: number
  energy: number
  sleep_hours: number
  physical: string[]
  note: string
  created_at: string
}

export interface Insight {
  id: string
  user_id: string
  week_start: string
  content: string
  generated_at: string
}
