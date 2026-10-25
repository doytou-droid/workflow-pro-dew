import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertCircle, Clock } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { dueDateTime, isOverdue, formatThaiDate } from '../utils/date'

export default function NotificationBell() {
  const { tasks } = useTasks()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const now = new Date()
  const overdue = tasks.filter(isOverdue)
  const soon = tasks.filter((t) => {
    if (t.status === 'เสร็จสิ้น' || isOverdue(t)) return false
    const h = (dueDateTime(t) - now) / 3600000
    return h > 0 && h <= 24
  })
  const count = overdue.length + soon.length

  function handleClickItem(task, type) {
    setOpen(false)
    if (type === 'overdue') {
      navigate(`/tasks?overdue=true&search=${encodeURIComponent(task.title)}`)
    } else {
      navigate(`/tasks?search=${encodeURIComponent(task.title)}`)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200" aria-label="การแจ้งเตือน">
        <Bell className="w-5 h-5" />
        {count > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">{count}</span>}
      </button>
      {open && (
        <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-16 sm:top-auto sm:mt-2 sm:w-96 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-700">
          {count === 0 && <div className="p-6 text-center text-sm text-slate-400">ไม่มีการแจ้งเตือน</div>}
          
          {overdue.map((t) => (
            <div
              key={t.id}
              onClick={() => handleClickItem(t, 'overdue')}
              className="p-3 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-rose-600">เกินกำหนดส่ง</div>
                <div className="text-slate-800 dark:text-slate-100 font-medium">{t.title}</div>
                <div className="text-xs text-slate-400">{formatThaiDate(t.dueDate)} {t.dueTime}</div>
              </div>
            </div>
          ))}

          {soon.map((t) => (
            <div
              key={t.id}
              onClick={() => handleClickItem(t, 'soon')}
              className="p-3 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-amber-600">ใกล้ครบกำหนดใน 24 ชม.</div>
                <div className="text-slate-800 dark:text-slate-100 font-medium">{t.title}</div>
                <div className="text-xs text-slate-400">{formatThaiDate(t.dueDate)} {t.dueTime}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}