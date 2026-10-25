const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

// วันที่ในรูป YYYY-MM-DD ตามเวลาเครื่อง (ไม่ใช้ UTC)
export function todayStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatThaiDate(dateStr) {
  if (!dateStr) return '-'
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${thaiMonths[m - 1]} ${y + 543}`
}

export function dueDateTime(task) {
  return new Date(`${task.dueDate}T${task.dueTime || '23:59'}`)
}

export function isOverdue(task) {
  if (task.status === 'เสร็จสิ้น') return false
  return dueDateTime(task) < new Date()
}