import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { updateTask } from '../firebase/tasks'
import { canModify } from '../utils/taskAccess'
import { todayStr } from '../utils/date'
import CalendarDayModal from '../components/CalendarDayModal'
import Alert from '../components/Alert'

const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const bar = {
  ยังไม่เริ่ม: 'border-slate-400',
  กำลังดำเนินการ: 'border-blue-500',
  รอตรวจทาน: 'border-purple-500',
  เสร็จสิ้น: 'border-emerald-500',
}

export default function Calendar() {
  const { user, role } = useAuth()
  const { tasks, error } = useTasks()
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(null) // เก็บวันที่เลือก เช่น 25
  const [actionError, setActionError] = useState('')

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const today = todayStr()
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]

  const dateOf = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const tasksOf = (d) => tasks.filter((t) => t.dueDate === dateOf(d))
  const selTasks = selectedDay ? tasksOf(selectedDay) : []
  const dateTitleStr = selectedDay ? `${selectedDay} ${MONTHS[month]} ${year + 543}` : ''

  // ฟังก์ชันติ๊กรายการย่อยใน Modal
  async function handleToggleSubtask(task, subId) {
    if (!canModify(task, role, user.uid)) {
      setActionError('คุณไม่มีสิทธิ์แก้ไขงานนี้')
      return
    }
    const updatedSubs = task.subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    try {
      await updateTask(task.id, { subtasks: updatedSubs })
    } catch {
      setActionError('อัปเดตรายการย่อยไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ปฏิทิน</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" aria-label="เดือนก่อน">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold min-w-36 text-center">{MONTHS[month]} {year + 543}</span>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" aria-label="เดือนถัดไป">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Alert type="error">{error || actionError}</Alert>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 pb-2">
          {DAYS.map((d, i) => <div key={d} className={i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : ''}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />
            const list = tasksOf(d)
            const isToday = dateOf(d) === today
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`min-h-16 sm:min-h-24 p-1 sm:p-2 rounded-xl border text-left align-top transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                  selectedDay === d ? 'ring-2 ring-brand-500 bg-brand-50/50 dark:bg-slate-700/30' : ''
                } ${isToday ? 'border-brand-500 font-bold' : 'border-slate-100 dark:border-slate-700'}`}
              >
                <div className={`text-xs ${isToday ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{d}</div>
                <div className="hidden sm:block mt-1 space-y-1">
                  {list.slice(0, 2).map((t) => (
                    <div key={t.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border-l-2 shadow-xs ${bar[t.status]}`}>
                      {t.title}
                    </div>
                  ))}
                  {list.length > 2 && <div className="text-[10px] text-slate-400 font-medium">+{list.length - 2} งาน</div>}
                </div>
                {list.length > 0 && <div className="sm:hidden mt-1 w-2 h-2 rounded-full bg-brand-600 mx-auto" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal แสดงรายละเอียดงานประจำวัน */}
      {selectedDay && (
        <CalendarDayModal
          dateTitle={dateTitleStr}
          tasks={selTasks}
          onClose={() => setSelectedDay(null)}
          onToggleSubtask={handleToggleSubtask}
        />
      )}
    </div>
  )
}