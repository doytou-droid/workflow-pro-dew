import { useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { calcProgress, priorityStyle } from '../utils/taskConfig'
import { formatThaiDate, isOverdue, todayStr } from '../utils/date'
import Alert from '../components/Alert'

const DAY = 86400000

function startOf(t) {
  const created = t.createdAt?.toDate ? todayStr(t.createdAt.toDate()) : t.dueDate
  return created <= t.dueDate ? created : t.dueDate
}

export default function Timeline() {
  const { tasks, loading, error } = useTasks()

  const { rows, min, span } = useMemo(() => {
    const rows = tasks.map((t) => ({ t, s: new Date(startOf(t)).getTime(), e: new Date(t.dueDate).getTime() }))
    if (rows.length === 0) return { rows, min: 0, span: 1 }
    const min = Math.min(...rows.map((r) => r.s), new Date(todayStr()).getTime())
    const max = Math.max(...rows.map((r) => r.e), new Date(todayStr()).getTime())
    return { rows, min, span: Math.max((max - min) / DAY + 1, 1) }
  }, [tasks])

  const todayPos = ((new Date(todayStr()).getTime() - min) / DAY / span) * 100

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ไทม์ไลน์</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">ช่วงเวลาของแต่ละงาน ตั้งแต่วันสร้างถึงวันกำหนดส่ง (เส้นฟ้าคือวันนี้)</p>
      </div>
      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="text-center text-slate-400 py-10">กำลังโหลด...</div>
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-400">ยังไม่มีงาน</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          {rows.map(({ t, s, e }) => {
            const left = ((s - min) / DAY / span) * 100
            const width = Math.max(((e - s) / DAY + 1) / span * 100, 2)
            const done = t.status === 'เสร็จสิ้น'
            const color = done ? 'bg-emerald-500' : isOverdue(t) ? 'bg-rose-500' : 'bg-brand-600'
            return (
              <div key={t.id} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
                  <span className="font-semibold">{t.title}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-2">
                    ส่ง {formatThaiDate(t.dueDate)}
                    <span className={`px-2 py-0.5 rounded ${priorityStyle[t.priority]}`}>{t.priority}</span>
                  </span>
                </div>
                <div className="relative h-5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="absolute top-0 bottom-0 w-0.5 bg-brand-500 z-10" style={{ left: `${todayPos}%` }} />
                  <div className={`absolute top-0 bottom-0 rounded-full ${color} opacity-90`} style={{ left: `${left}%`, width: `${width}%` }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-white">{calcProgress(t)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}