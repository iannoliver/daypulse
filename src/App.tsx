import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { Auth } from './pages/Auth'
import { Checkin } from './pages/Checkin'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { Insight } from './pages/Insight'

function AppLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />
  }

  if (user && location.pathname === '/auth') {
    return <Navigate to="/" replace />
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header user={user} onSignOut={signOut} />
      <main className="max-w-app mx-auto px-4 pt-5 pb-24">
        <Routes>
          <Route path="/" element={<Checkin user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/history" element={<History user={user} />} />
          <Route path="/insight" element={<Insight user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

function AuthRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />
  return <Auth />
}
