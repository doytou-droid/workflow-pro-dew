import { X } from 'lucide-react'
import { formatThaiDate, isOverdue } from '../utils/date'
import { priorityStyle, calcProgress } from '../utils/taskConfig'
import { getAvatarUrl } from '../utils/avatar'

const bar = {
  ยังไม่เริ่ม: 'border-slate-300 dark:border-slate-600',
  กำลังดำเนินการ: 'border-blue-500',
  รอตรวจทาน: 'border-purple-500',
  เสร็จสิ้น: 'border-emerald-500',
}

export default function CalendarDayModal({ dateTitle, tasks, onClose, onToggleSubtask }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">รายการงานวันที่ {dateTitle}</h2>
            <p className="text-xs text-slate-500">มีงานทั้งหมด {tasks.length} รายการ</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl" aria-label="ปิด">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center text-slate-400 py-8">ไม่มีงานในวันนี้</div>
          ) : (
            tasks.map((t) => {
              const overdue = isOverdue(t)
              const progress = calcProgress(t)
              return (
                <div
                  key={t.id}
                  className={`bg-slate-50 dark:bg-slate-700/40 rounded-2xl border-l-4 ${bar[t.status] || 'border-slate-300'} p-4 space-y-3 border border-slate-200 dark:border-slate-700`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${priorityStyle[t.priority]}`}>
                      {t.priority}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      {t.category || 'ทั่วไป'} • {t.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{t.title}</h3>
                    {t.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{t.description}</p>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">ผู้รับผิดชอบ:</span>
                      <div className="flex items-center gap-2">
                        <img src={getAvatarUrl(t.assignee, t.assigneePhoto)} alt={t.assignee} className="w-6 h-6 rounded-full object-cover bg-slate-100" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t.assignee || 'ไม่ระบุ'}</span>
                      </div>
                    </div>
                    <div className={overdue ? 'text-rose-600 font-medium' : ''}>
                      <span className="text-slate-400 block">กำหนดส่ง:</span>
                      <span>{formatThaiDate(t.dueDate)} {t.dueTime || ''}</span>
                    </div>
                  </div>

                  {t.subtasks && t.subtasks.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-xs font-semibold text-slate-500 flex justify-between">
                        <span>รายการย่อย</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="space-y-1">
                        {t.subtasks.map((s) => (
                          <label
                            key={s.id}
                            className="flex items-center gap-2.5 text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={s.completed}
                              onChange={() => onToggleSubtask(t, s.id)}
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                            />
                            <span className={s.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}>
                              {s.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}