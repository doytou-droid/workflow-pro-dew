import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { logoutUser } from '../firebase/auth'

export default function AppLayout() {
  const { profile } = useAuth()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <Sidebar role={profile.role} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          profile={profile}
          dark={dark}
          onToggleTheme={toggle}
          onOpenMenu={() => setMenuOpen(true)}
          onLogout={logoutUser}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}