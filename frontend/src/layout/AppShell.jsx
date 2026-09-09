import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Compass, BookOpen, MessageSquareText, FileQuestion, LayoutDashboard, LogOut, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/resources', label: 'Resources', icon: BookOpen },
  { to: '/app/roadmap', label: 'Roadmap', icon: Compass },
  { to: '/app/mentor', label: 'AI Mentor', icon: MessageSquareText },
  { to: '/app/practice', label: 'Practice', icon: FileQuestion },
  { to: '/app/progress', label: 'Progress', icon: Target },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <div className="font-heading text-lg font-bold tracking-tight text-ink">LearnWise AI</div>
            <div className="text-xs text-ink-faint">Your personalized learning workspace</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-ink">{user?.name || 'Learner'}</div>
              <div className="text-xs text-ink-faint">Premium workspace</div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:px-6">
        <aside className="rounded-3xl border border-line bg-card p-3 shadow-sm md:sticky md:top-24 md:h-fit">
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                    isActive ? 'bg-accent-soft font-medium text-accent' : 'text-ink-muted hover:bg-surface'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
