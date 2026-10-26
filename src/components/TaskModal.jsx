import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { todayStr } from '../utils/date'
import Alert from './Alert'
import ThaiDateInput from './ThaiDateInput'
import TimeInput24 from './TimeInput24'

const inputCls =
  'w-full px-3.5 py-2.5 text-base bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500'

export default function TaskModal({ task, onSave, onClose }) {
  const [config, setConfig] = useState({
    statuses: ['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น'],
    priorities: ['ต่ำ', 'ปานกลาง', 'สูง', 'เร่งด่วน'],
    categories: ['ทั่วไป', 'พัฒนาเว็บ', 'ออกแบบ', 'เอกสาร'],
    assignees: [ 'ปณิธิ คูตระกูล'],
  })

  // โหลดตัวเลือกจาก Firestore
  useEffect(() => {
    getDoc(doc(db, 'settings', 'dropdowns')).then((snap) => {
      if (snap.exists()) setConfig((c) => ({ ...c, ...snap.data() }))
    }).catch(() => {})
  }, [])

  // จัดการสถานะ Custom (ถ้าเลือก "อื่นๆ..." ให้เปิดช่องพิมพ์เอง)
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'ยังไม่เริ่ม',
    priority: task?.priority || 'ปานกลาง',
    category: task?.category || 'ทั่วไป',
    assignee: task?.assignee || 'ไม่ระบุ',
    dueDate: task?.dueDate || todayStr(),
    dueTime: task?.dueTime || '18:00',
  })

  const [customCategory, setCustomCategory] = useState('')
  const [customAssignee, setCustomAssignee] = useState('')
  const [isOtherCategory, setIsOtherCategory] = useState(false)
  const [isOtherAssignee, setIsOtherAssignee] = useState(false)

  const [subtasks, setSubtasks] = useState(task?.subtasks || [])
  const [subInput, setSubInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function handleCategoryChange(e) {
    const val = e.target.value
    if (val === '__OTHER__') {
      setIsOtherCategory(true)
      setForm((f) => ({ ...f, category: '' }))
    } else {
      setIsOtherCategory(false)
      setForm((f) => ({ ...f, category: val }))
    }
  }

  function handleAssigneeChange(e) {
    const val = e.target.value
    if (val === '__OTHER__') {
      setIsOtherAssignee(true)
      setForm((f) => ({ ...f, assignee: '' }))
    } else {
      setIsOtherAssignee(false)
      setForm((f) => ({ ...f, assignee: val }))
    }
  }

  function addSub() {
    const t = subInput.trim()
    if (!t) return
    setSubtasks((s) => [...s, { id: crypto.randomUUID(), title: t, completed: false }])
    setSubInput('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('กรุณากรอกชื่องาน')
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        category: isOtherCategory ? (customCategory.trim() || 'ทั่วไป') : (form.category || 'ทั่วไป'),
        assignee: isOtherAssignee ? (customAssignee.trim() || 'ไม่ระบุ') : (form.assignee || 'ไม่ระบุ'),
        subtasks,
      })
      onClose()
    } catch {
      setError('บันทึกไม่สำเร็จ อาจไม่มีสิทธิ์หรืออินเทอร์เน็ตมีปัญหา')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-800 w-full sm:max-w-2xl max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold">{task ? 'แก้ไขงาน' : 'สร้างงานใหม่'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500" aria-label="ปิด">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <Alert type="error">{error}</Alert>

          <div>
            <label className="block text-sm font-medium mb-1">ชื่องาน *</label>
            <input className={inputCls} value={form.title} onChange={set('title')} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">รายละเอียด</label>
            <textarea className={inputCls} rows={3} value={form.description} onChange={set('description')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">สถานะ</label>
              <select className={inputCls} value={form.status} onChange={set('status')}>
                {config.statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ความสำคัญ</label>
              <select className={inputCls} value={form.priority} onChange={set('priority')}>
                {config.priorities.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* หมวดหมู่ (Dropdown + อื่นๆ) */}
            <div>
              <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
              {!isOtherCategory ? (
                <select className={inputCls} value={form.category} onChange={handleCategoryChange}>
                  {config.categories.map((c) => <option key={c}>{c}</option>)}
                  <option value="__OTHER__">+ เพิ่มอื่นๆ (พิมพ์เอง)...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input className={inputCls} value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="พิมพ์หมวดหมู่ใหม่..." autoFocus />
                  <button type="button" onClick={() => setIsOtherCategory(false)} className="px-3 rounded-xl bg-slate-200 dark:bg-slate-600 text-xs font-semibold">กลับ</button>
                </div>
              )}
            </div>

            {/* ผู้รับผิดชอบ (Dropdown + อื่นๆ) */}
            <div>
              <label className="block text-sm font-medium mb-1">ผู้รับผิดชอบ</label>
              {!isOtherAssignee ? (
                <select className={inputCls} value={form.assignee} onChange={handleAssigneeChange}>
                  {config.assignees.map((a) => <option key={a}>{a}</option>)}
                  <option value="__OTHER__">+ เพิ่มอื่นๆ (พิมพ์เอง)...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input className={inputCls} value={customAssignee} onChange={(e) => setCustomAssignee(e.target.value)} placeholder="พิมพ์ชื่อผู้รับผิดชอบใหม่..." autoFocus />
                  <button type="button" onClick={() => setIsOtherAssignee(false)} className="px-3 rounded-xl bg-slate-200 dark:bg-slate-600 text-xs font-semibold">กลับ</button>
                </div>
              )}
            </div>

            <div>
  <label className="block text-sm font-medium mb-1">วันที่ส่ง (วัน/เดือน/ปี พ.ศ.) *</label>
  <ThaiDateInput className={inputCls} value={form.dueDate} onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))} />
</div>
<div>
  <label className="block text-sm font-medium mb-1">เวลาที่ส่ง (24 ชม.)</label>
  <TimeInput24 className={inputCls} value={form.dueTime} onChange={(v) => setForm((f) => ({ ...f, dueTime: v }))} />
</div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2">
            <label className="block text-sm font-medium">รายการย่อย</label>
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSub() } }}
                placeholder="พิมพ์แล้วกดเพิ่ม"
              />
              <button type="button" onClick={addSub} className="px-4 rounded-xl bg-slate-200 dark:bg-slate-600 text-sm font-semibold whitespace-nowrap">
                + เพิ่ม
              </button>
            </div>
            <ul className="space-y-1.5">
              {subtasks.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                  <label className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={s.completed}
                      onChange={() => setSubtasks((list) => list.map((x) => x.id === s.id ? { ...x, completed: !x.completed } : x))}
                    />
                    <span className="truncate">{s.title}</span>
                  </label>
                  <button type="button" onClick={() => setSubtasks((list) => list.filter((x) => x.id !== s.id))} className="text-rose-500 p-1" aria-label="ลบรายการย่อย">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-medium">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-60">
              {saving ? 'กำลังบันทึก...' : 'บันทึกงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}