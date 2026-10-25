import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { createTask, updateTask, deleteTask } from '../firebase/tasks'
import { canCreate, canModify } from '../utils/taskAccess'
import { priorityStyle, calcProgress } from '../utils/taskConfig'
import { formatThaiDate, isOverdue } from '../utils/date'
import { filterTasks } from '../utils/filterUtils'
import { getAvatarUrl } from '../utils/avatar'
import TaskModal from '../components/TaskModal'
import GlobalFilters from '../components/GlobalFilters'
import Alert from '../components/Alert'

export default function Tasks() {
  const { user, profile, role } = useAuth()
  const { tasks, loading, error } = useTasks()
  const [searchParams, setSearchParams] = useSearchParams()

  const now = new Date()
  const currentMonth = String(now.getMonth() + 1)
  const currentThaiYear = String(now.getFullYear() + 543)

  const [search, setSearch] = useState(() => searchParams.get('search') || '')

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: searchParams.get('month') || currentMonth,
    thaiYear: searchParams.get('thaiYear') || currentThaiYear,
    budgetYear: 'ALL',
    assignee: 'ALL',
    status: searchParams.get('status') || 'ALL',
    priority: searchParams.get('priority') || 'ALL',
    category: 'ALL',
  })

  useEffect(() => {
    const st = searchParams.get('status')
    const pr = searchParams.get('priority')
    const ov = searchParams.get('overdue')
    const sr = searchParams.get('search')
    
    if (sr) setSearch(sr)

    setFilters((f) => ({
      ...f,
      status: st || f.status,
      priority: pr || f.priority,
      ...(ov ? { month: 'ALL', thaiYear: 'ALL' } : {})
    }))
  }, [searchParams])

  const assignees = useMemo(() => Array.from(new Set(tasks.map((t) => t.assignee || 'ไม่ระบุ'))), [tasks])
  const categories = useMemo(() => Array.from(new Set(tasks.map((t) => t.category || 'ทั่วไป'))), [tasks])
  const thaiYears = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => {
      if (t.dueDate) set.add(Number(t.dueDate.split('-')[0]) + 543)
    })
    set.add(Number(currentThaiYear))
    return Array.from(set).sort((a, b) => b - a)
  }, [tasks, currentThaiYear])
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

  const list = useMemo(() => {
    let result = filterTasks(tasks, filters)
    if (searchParams.get('overdue') === 'true') {
      result = result.filter(isOverdue)
    }
    const s = search.trim().toLowerCase()
    if (s) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.assignee || '').toLowerCase().includes(s) ||
          (t.category || '').toLowerCase().includes(s),
      )
    }
    return result
  }, [tasks, filters, search, searchParams])

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

      <GlobalFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
        assignees={assignees}
        thaiYears={thaiYears}
        budgetYears={budgetYears}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่องาน ผู้รับผิดชอบ หมวดหมู่"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>
        {(searchParams.get('status') || searchParams.get('priority') || searchParams.get('overdue') || searchParams.get('search')) && (
          <button
            onClick={() => { setSearch(''); setSearchParams({}); }}
            className="px-4 py-2.5 text-sm bg-slate-200 dark:bg-slate-700 rounded-xl font-medium"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>

      <Alert type="error">{error || actionError}</Alert>

      {loading ? (
        <div className="text-center text-slate-400 py-10">กำลังโหลดงาน...</div>
      ) : list.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-400">
          ไม่พบรายการงานตามเงื่อนไข
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
                  const done = t.status === 'เสร็จสิ้น'
                  return (
                    <tr key={t.id} className={done ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}>
                      <td className="p-3">
                        <div className="font-semibold">{t.title}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{t.category || 'ทั่วไป'}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <img src={getAvatarUrl(t.assignee, t.assigneePhoto)} alt={t.assignee} className="w-4 h-4 rounded-full object-cover bg-slate-100" />
                            {t.assignee || 'ไม่ระบุ'}
                          </span>
                        </div>
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
                            {['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น'].map((s) => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="text-xs">{t.status}</span>
                        )}
                      </td>
                      <td className="p-3 w-32">
                        <div className={`text-[11px] ${done ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>{calcProgress(t)}%</div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div className={`h-full ${done ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${calcProgress(t)}%` }} />
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
              const done = t.status === 'เสร็จสิ้น'
              return (
                <div key={t.id} className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-4 space-y-2 ${done ? 'border-emerald-500' : overdue ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${priorityStyle[t.priority]}`}>{t.priority}</span>
                    <span className="text-xs text-slate-500">{t.status}</span>
                  </div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{t.category || 'ทั่วไป'}</span>
                    <span>•</span>
                    <img src={getAvatarUrl(t.assignee, t.assigneePhoto)} alt={t.assignee} className="w-4 h-4 rounded-full object-cover bg-slate-100" />
                    <span>{t.assignee || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full ${done ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${calcProgress(t)}%` }} />
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