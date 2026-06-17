import type { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  user: User | null
  onSignOut: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const navigate = useNavigate()
  const name: string = (user?.user_metadata?.name as string) ?? user?.email ?? ''
  const initial = name.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur border-b border-white/5">
      <div className="max-w-app mx-auto px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
          <span className="relative flex items-center justify-center w-4 h-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
            <span className="relative text-base font-bold text-primary">●</span>
          </span>
          <span className="text-xl font-bold text-white tracking-tight">DayPulse</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-purple-500 flex items-center justify-center">
            <span className="text-primary text-sm font-semibold">{initial || '?'}</span>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
