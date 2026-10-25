import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { createTask, updateTask, deleteTask } from '../firebase/tasks'
import { canCreate, canModify } from '../utils/taskAccess'
import { STATUSES, PRIORITIES, priorityStyle, calcProgress } from '../utils/taskConfig'
import { formatThaiDate, isOverdue } from '../utils/date'
import TaskModal from '../components/TaskModal'
import Alert from '../components/Alert'

const selectCls =
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl'

export default function Tasks() {
  const { user, profile, role } = useAuth()
  const { tasks, loading, error } = useTasks()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [modal, setModal] = useState(null) // null | 'new' | task
  const [actionError, setActionError] = useState('')

  const list = useMemo(() => {
    const s = search.trim().toLowerCase()
    return tasks.filter((t) =>
      (status === 'ALL' || t.status === status) &&
      (priority === 'ALL' || t.priority === priority) &&
      (!s ||
        t.title.toLowerCase().includes(s) ||
        (t.assignee || '').toLowerCase().includes(s) ||
        (t.category || '').toLowerCase().includes(s)),
    )
  }, [tasks, search, status, priority])

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

  async function quickStatus(task, newStatus) {
    setActionError('')
    try {
      await updateTask(task.id, { status: newStatus })
    } catch {
      setActionError('เปลี่ยนสถานะไม่สำเร็จ อาจไม่มีสิทธิ์')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">รายการงาน</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {role === 'viewer' ? 'โหมดดูอย่างเดียว' : role === 'staff' ? 'แก้ไขได้เฉพาะงานของคุณ' : 'จัดการงานได้ทุกรายการ'}
          </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่องาน ผู้รับผิดชอบ"
            className={`${selectCls} pl-9`}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="ALL">ทุกสถานะ</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectCls}>
          <option value="ALL">ทุกระดับความสำคัญ</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <Alert type="error">{error || actionError}</Alert>

      {loading ? (
        <div className="text-center text-slate-400 py-10">กำลังโหลดงาน...</div>
      ) : list.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-400">
          ไม่พบรายการงาน
        </div>
      ) : (
        <>
          {/* คอม: ตาราง */}
          <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3">งาน</th>
                  <th className="p-3">ความสำคัญ</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3">ความคืบหน้า</th>
                  <th className="p-3">กำหนดส่ง</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {list.map((t) => {
                  const editable = canModify(t, role, user.uid)
                  const overdue = isOverdue(t)
                  return (
                    <tr key={t.id} className={t.status === 'เสร็จสิ้น' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}>
                      <td className="p-3">
                        <div className="font-semibold">{t.title}</div>
                        <div className="text-xs text-slate-400">{t.category} • {t.assignee}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${priorityStyle[t.priority]}`}>{t.priority}</span>
                      </td>
                      <td className="p-3">
                        {editable ? (
                          <select
                            value={t.status}
                            onChange={(e) => quickStatus(t, e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                          >
                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="text-xs">{t.status}</span>
                        )}
                      </td>
                      <td className="p-3 w-32">
                        <div className={`text-[11px] ${t.status === 'เสร็จสิ้น' ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>{calcProgress(t)}%</div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div className={`h-full ${t.status === 'เสร็จสิ้น' ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${calcProgress(t)}%` }} />
                        </div>
                      </td>
                      <td className={`p-3 whitespace-nowrap ${overdue ? 'text-rose-600 font-semibold' : ''}`}>
                        {formatThaiDate(t.dueDate)} {t.dueTime}
                        {overdue && <div className="text-[11px]">เกินกำหนด</div>}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {editable && (
                          <>
                            <button onClick={() => setModal(t)} className="p-2 text-slate-400 hover:text-brand-600" aria-label="แก้ไข">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(t)} className="p-2 text-slate-400 hover:text-rose-600" aria-label="ลบ">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* มือถือ: การ์ด */}
          <div className="md:hidden space-y-3">
            {list.map((t) => {
              const editable = canModify(t, role, user.uid)
              const overdue = isOverdue(t)
              return (
                <div key={t.id} className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-4 space-y-2 ${t.status === 'เสร็จสิ้น' ? 'border-emerald-500' : overdue ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${priorityStyle[t.priority]}`}>{t.priority}</span>
                    <span className="text-xs text-slate-500">{t.status}</span>
                  </div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.category} • {t.assignee}</div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full ${t.status === 'เสร็จสิ้น' ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${calcProgress(t)}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                      {formatThaiDate(t.dueDate)} {t.dueTime}{overdue ? ' (เกินกำหนด)' : ''}
                    </span>
                    {editable && (
                      <div>
                        <button onClick={() => setModal(t)} className="p-2 text-slate-500" aria-label="แก้ไข"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t)} className="p-2 text-rose-500" aria-label="ลบ"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}