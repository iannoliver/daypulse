export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function getMoodEmoji(mood: number): string {
  const emojis: Record<number, string> = {
    1: '😞',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
  }
  return emojis[mood] ?? '😐'
}

export function getMoodColor(mood: number): string {
  if (mood <= 2) return '#f87171'
  if (mood === 3) return '#facc15'
  return '#4ade80'
}

export function getMoodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: 'Muito mal',
    2: 'Mal',
    3: 'Neutro',
    4: 'Bem',
    5: 'Ótimo',
  }
  return labels[mood] ?? 'Neutro'
}

export function getEnergyLabel(energy: number): string {
  if (energy <= 1) return 'Sem energia'
  if (energy === 2) return 'Pouca energia'
  if (energy === 3) return 'Energia moderada'
  if (energy === 4) return 'Bastante energia'
  return 'Cheio de energia'
}

export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${year}-${month}-${d}`
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function getDaysAgoString(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}
