import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

type Tab = 'signin' | 'signup'

export function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (tab === 'signin') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(translateError(error))
      } else {
        navigate('/')
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your name.')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, name)
      if (error) {
        setError(translateError(error))
      } else {
        navigate('/')
      }
    }

    setLoading(false)
  }

  function translateError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.'
    if (msg.includes('Email already registered')) return 'This email is already registered.'
    if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.'
    if (msg.includes('Unable to validate')) return 'Invalid email address.'
    return msg
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl text-primary font-bold">●</span>
            <span className="text-3xl font-bold text-white tracking-tight">DayPulse</span>
          </div>
          <p className="text-white/50 text-sm">Your daily wellness journal</p>
        </div>

        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  tab === t ? 'text-primary border-b-2 border-primary' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What's your name?"
                  autoComplete="name"
                  required
                  className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                required
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-danger text-sm bg-danger/10 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {tab === 'signin' ? 'Sign In' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
