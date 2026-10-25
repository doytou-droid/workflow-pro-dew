import { Menu, Moon, Sun, LogOut } from 'lucide-react'
import { roleLabels } from '../utils/permissions'

export default function Header({ profile, dark, onToggleTheme, onOpenMenu, onLogout }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={onOpenMenu}
        className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300"
        aria-label="เปิดเมนู"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right leading-tight">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-35 sm:max-w-none truncate">
            {profile.displayName}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {roleLabels[profile.role] || profile.role}
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          aria-label="สลับโหมดสว่าง/มืด"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={onLogout}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          aria-label="ออกจากระบบ"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}