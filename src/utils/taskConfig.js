export const STATUSES = ['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น']
export const PRIORITIES = ['ต่ำ', 'ปานกลาง', 'สูง', 'เร่งด่วน']

export const priorityStyle = {
  เร่งด่วน: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  สูง: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  ปานกลาง: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ต่ำ: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

// ความคืบหน้า: ใช้สถานะเป็นฐาน แล้วให้รายการย่อยช่วยเพิ่ม
const BASE = { 'ยังไม่เริ่ม': 0, 'กำลังดำเนินการ': 25, 'รอตรวจทาน': 75, 'เสร็จสิ้น': 100 }

export function calcProgress(task) {
  if (task.status === 'เสร็จสิ้น') return 100
  const base = BASE[task.status] ?? 0
  const subs = task.subtasks || []
  if (subs.length === 0) return base
  const subPct = Math.round((subs.filter((s) => s.completed).length / subs.length) * 90)
  return Math.max(base, subPct)
}