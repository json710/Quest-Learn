import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '../components/Button.jsx'
import { BrandMark, Icon } from '../components/Icon.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { useAuth } from '../hooks/useAuth.js'

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: 'home', end: true },
  { to: '/student/courses', label: 'Browse courses', icon: 'compass' },
  { to: '/student/enrolled', label: 'My courses', icon: 'book' },
  { to: '/student/quizzes', label: 'Quizzes', icon: 'quiz' },
  { to: '/student/badges', label: 'Badges', icon: 'badge' },
  { to: '/student/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { to: '/student/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/student/submissions', label: 'My submissions', icon: 'clipboard' },
  { to: '/profile', label: 'Profile settings', icon: 'settings' },
]

const instructorLinks = [
  { to: '/instructor', label: 'Dashboard', icon: 'home', end: true },
  { to: '/instructor/courses', label: 'My courses', icon: 'layers' },
  { to: '/instructor/quizzes', label: 'Quizzes', icon: 'quiz' },
  { to: '/instructor/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/profile', label: 'Profile settings', icon: 'settings' },
]

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'home', end: true },
  { to: '/admin/users', label: 'User management', icon: 'users' },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const links = user.role === 'ADMIN'
    ? adminLinks
    : user.role === 'INSTRUCTOR'
      ? instructorLinks
      : studentLinks
  const levelProgress = Math.min(100, Math.max(0, (user.xp ?? 0) % 100))

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <NavLink to={links[0].to} className="flex items-center gap-2.5">
            <BrandMark className="h-9 w-9" />
            <span className="text-lg font-black tracking-tight text-slate-950">Quest<span className="text-violet-600">Learn</span></span>
          </NavLink>
          <Button aria-expanded={menuOpen} aria-label="Toggle navigation" variant="ghost" className="h-10 w-10 px-0" onClick={() => setMenuOpen((open) => !open)}>
            <Icon name="menu" />
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg sm:px-6">
            <nav className="space-y-1">
              {links.map((link) => <NavItem key={link.to} {...link} onClick={() => setMenuOpen(false)} />)}
            </nav>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <UserIdentity user={user} />
              <Button variant="secondary" onClick={handleLogout}>Log out</Button>
            </div>
          </div>
        )}
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200/80 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center px-6">
          <NavLink to={links[0].to} className="flex items-center gap-3">
            <BrandMark />
            <span className="text-xl font-black tracking-tight text-slate-950">Quest<span className="text-violet-600">Learn</span></span>
          </NavLink>
        </div>
        <div className="px-4 pt-4">
          <p className="px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <nav className="mt-3 space-y-1.5">
            {links.map((link) => <NavItem key={link.to} {...link} />)}
          </nav>
        </div>
        <div className="mt-auto space-y-4 p-4">
          {user.role === 'STUDENT' && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide text-violet-700">Level {user.level ?? 1}</span>
                <span className="text-xs font-bold text-violet-600">{user.xp ?? 0} XP</span>
              </div>
              <ProgressBar className="mt-3" value={levelProgress} />
              <p className="mt-2 text-xs text-violet-700/75">Keep learning to grow your XP.</p>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            <UserIdentity user={user} />
            <Button variant="ghost" className="mt-3 w-full justify-start text-slate-500" onClick={handleLogout}>
              <Icon name="logout" className="h-4 w-4" /> Log out
            </Button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-12"><Outlet /></div>
      </main>
    </div>
  )
}

function NavItem({ to, label, icon, end, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition ${isActive ? 'bg-violet-600 text-white shadow-sm shadow-violet-200' : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'}`}>
      <Icon name={icon} className="h-5 w-5 shrink-0" /><span>{label}</span>
    </NavLink>
  )
}

function UserIdentity({ user }) {
  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">{initials}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{user.role.toLowerCase()}</p>
      </div>
    </div>
  )
}
