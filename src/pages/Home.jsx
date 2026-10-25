import { useAuth } from '../hooks/useAuth'
import { roleLabels } from '../utils/permissions'

export default function Home() {
  const { user, profile } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">แดชบอร์ด</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ตัวอย่างชั่วคราว</p>
      <div className="mt-6 max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-sm space-y-1">
        <p>ชื่อ: {profile.displayName}</p>
        <p>อีเมล: {user.email}</p>
        <p>สิทธิ์: {roleLabels[profile.role] || profile.role}</p>
      </div>
    </div>
  )
}