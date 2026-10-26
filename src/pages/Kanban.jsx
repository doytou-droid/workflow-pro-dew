import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { useDropdownConfig } from '../hooks/useDropdownConfig'
import { createTask, updateTask, deleteTask } from '../firebase/tasks'
import { canCreate, canModify } from '../utils/taskAccess'
import { priorityStyle, calcProgress } from '../utils/taskConfig'
import { formatThaiDate, isOverdue } from '../utils/date'
import { filterTasks } from '../utils/filterUtils'
import { getAvatarUrl } from '../utils/avatar'
import TaskModal from '../components/TaskModal'
import TaskDetailModal from '../components/TaskDetailModal'
import GlobalFilters from '../components/GlobalFilters'
import Alert from '../components/Alert'

export default function Kanban() {
  const { user, profile, role } = useAuth()
  const { tasks, loading, error } = useTasks()
  const config = useDropdownConfig()
  const STATUSES = config.statuses || ['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น']

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: 'ALL',
    thaiYear: 'ALL',
    budgetYear: 'ALL',
    assignee: 'ALL',
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
  })

  const assignees = useMemo(() => Array.from(new Set(tasks.map((t) => t.assignee || 'ไม่ระบุ'))), [tasks])
  const categories = useMemo(() => Array.from(new Set(tasks.map((t) => t.category || 'ทั่วไป'))), [tasks])
  const thaiYears = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => {
      if (t.dueDate) set.add(Number(t.dueDate.split('-')[0]) + 543)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [tasks])
  const budgetYears = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => {
      if (t.dueDate) {
        const [y, m] = t.dueDate.split('-').map(Number)
        set.add(m >= 10 ? y + 543 + 1 : y + 543)
      }
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [tasks])

  const [modal, setModal] = useState(null)
  const [actionError, setActionError] = useState('')
  const [draggingId, setDraggingId] = useState(null)
  const [viewTask, setViewTask] = useState(null)


  const filtered = useMemo(() => filterTasks(tasks, filters), [tasks, filters])

  async function handleSave(data) {
    if (modal === 'new') await createTask(data, user, profile)
    else await updateTask(modal.id, data)
  }

  async function handleDelete(task) {
    if (!confirm(`ลบงาน "${task.title}" ใช่หรือไม่?`)) return
    setActionError('')
    try {
      await deleteTask(task.id)
    } catch {
      setActionError('ลบไม่สำเร็จ อาจไม่มีสิทธิ์')
    }
  }

  async function moveStatus(task, nextStatus) {
    if (task.status === nextStatus) return
    setActionError('')
    try {
      await updateTask(task.id, { status: nextStatus })
    } catch {
      setActionError('ย้ายสถานะไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kanban Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">บอร์ดแสดงสถานะงานแบบคอลัมน์ ลากวางเพื่อเปลี่ยนสถานะได้</p>
        </div>
        {canCreate(role) && (
          <button
            onClick={() => setModal('new')}
            className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> สร้างงานใหม่
          </button>
        )}
      </div>

      <GlobalFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
        assignees={assignees}
        thaiYears={thaiYears}
        budgetYears={budgetYears}
      />

      <Alert type="error">{error || actionError}</Alert>

      {loading ? (
        <div className="text-center text-slate-400 py-10">กำลังโหลดบอร์ด...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {STATUSES.map((status) => {
            const list = filtered.filter((t) => t.status === status)
            return (
              <div
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggingId) return
                  const taskToMove = tasks.find((t) => t.id === draggingId)
                  if (taskToMove) {
                    const editable = canModify(taskToMove, role, user.uid, profile)
                    if (editable) moveStatus(taskToMove, status)
                  }
                  setDraggingId(null)
                }}
                className="bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700 min-h-[200px]"
              >
                <div className="flex items-center justify-between px-2 mb-3">
                  <span className="font-bold text-sm">{status}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-700 shadow-xs">
                    {list.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {list.map((t) => {
                    const editable = canModify(t, role, user.uid, profile)
                    const overdue = isOverdue(t)
                    const done = t.status === 'เสร็จสิ้น'
                    return (
                      <div

  key={t.id}

  draggable={editable}

  onDragStart={() => setDraggingId(t.id)}

  onDragEnd={() => setDraggingId(null)}

  onClick={() => setViewTask(t)} // <-- เพิ่มตรงนี้เพื่อให้คลิกเปิดดูรายละเอียดได้

  className={`bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-xs space-y-2.5 transition-opacity cursor-pointer ${

    editable ? 'active:cursor-grabbing' : ''
                        } ${draggingId === t.id ? 'opacity-40' : 'opacity-100'} ${
                          done ? 'border-emerald-500' : overdue ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${priorityStyle[t.priority] || 'bg-slate-100 text-slate-600'}`}>
                            {t.priority}
                          </span>
                          {editable && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setModal(t)} className="p-1 text-slate-400 hover:text-brand-600" aria-label="แก้ไข">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(t)} className="p-1 text-slate-400 hover:text-rose-600" aria-label="ลบ">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="font-semibold text-sm">{t.title}</div>
                        <div className="text-xs text-slate-400">{t.category || 'ทั่วไป'}</div>

                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div className={`h-full ${done ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${calcProgress(t)}%` }} />
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700 text-xs">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <img src={getAvatarUrl(t.assignee, t.assigneePhoto)} alt={t.assignee} className="w-8 h-8 rounded-full object-cover bg-slate-100" />
                            <span className="truncate max-w-40 text-sm font-medium">{t.assignee || 'ไม่ระบุ'}</span>
                          </div>

                          <span className={overdue ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
                            {formatThaiDate(t.dueDate)}
                          </span>
                        </div>

                        {editable && (
                          <select
                            value={t.status}
                            onChange={(e) => moveStatus(t, e.target.value)}
                            aria-label="เปลี่ยนสถานะงาน"
                            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium mt-1"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>ย้ายไป: {s}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })}
                  {list.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      ไม่มีงาน (ลากการ์ดมาวางได้)
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
            {viewTask && (
        <TaskDetailModal
          task={viewTask}
          onClose={() => setViewTask(null)}
          onToggleSubtask={async (task, subId) => {
            const updatedSubtasks = task.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
            await updateTask(task.id, { subtasks: updatedSubtasks })
            setViewTask(prev => ({ ...prev, subtasks: updatedSubtasks }))
          }}
        />
      )}
    </div>
  )
}