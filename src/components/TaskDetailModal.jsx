import { X } from 'lucide-react'
import { getAvatarUrl } from '../utils/avatar'
import { formatThaiDate } from '../utils/date'
import { priorityStyle, calcProgress } from '../utils/taskConfig'

export default function TaskDetailModal({ task, onClose, onToggleSubtask }) {
  if (!task) return null
  const progress = calcProgress(task)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">รายละเอียดงาน</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="ปิด">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${priorityStyle[task.priority] || 'bg-slate-100 text-slate-600'}`}>
              {task.priority}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{task.category || 'ทั่วไป'}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400">{task.status}</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-sm">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/40 p-3.5 rounded-xl">
            <div>
              <span className="block text-xs text-slate-400 mb-1">ผู้รับผิดชอบ</span>
              <div className="flex items-center gap-2">
                <img src={getAvatarUrl(task.assignee, task.assigneePhoto)} alt={task.assignee} className="w-6 h-6 rounded-full object-cover bg-slate-200" />
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{task.assignee || 'ไม่ระบุ'}</span>
              </div>
            </div>
            <div>
              <span className="block text-xs text-slate-400 mb-1">กำหนดส่ง</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatThaiDate(task.dueDate)} {task.dueTime ? `${task.dueTime} น.` : ''}
              </span>
            </div>
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>รายการย่อย</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <ul className="space-y-1.5 pt-1">
                {task.subtasks.map((sub) => (
                  <li key={sub.id} className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => onToggleSubtask && onToggleSubtask(task, sub.id)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`flex-1 ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {sub.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600">
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}