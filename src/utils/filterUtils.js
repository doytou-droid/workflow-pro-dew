import { todayStr } from './date'

// ปีงบประมาณไทย: 1 ต.ค. ปี พ.ศ. ก่อน ถึง 30 ก.ย. ปี พ.ศ. นั้น
export function filterTasks(tasks, { startDate, endDate, month, budgetYear, thaiYear, status, priority, category, assignee }) {
  return tasks.filter((t) => {
    // ฟิลเตอร์ผู้รับผิดชอบ
    if (assignee && assignee !== 'ALL' && t.assignee !== assignee) return false
    // ฟิลเตอร์สถานะ
    if (status && status !== 'ALL' && t.status !== status) return false
    // ฟิลเตอร์ความสำคัญ
    if (priority && priority !== 'ALL' && t.priority !== priority) return false
    // ฟิลเตอร์หมวดหมู่
    if (category && category !== 'ALL' && (t.category || 'ทั่วไป') !== category) return false

    const due = t.dueDate // 'YYYY-MM-DD'
    if (!due) return true

    const [y, m] = due.split('-').map(Number)
    const tYear = y + 543 // ปี พ.ศ.

    // ช่วงวันที่เริ่มต้น - สิ้นสุด
    if (startDate && due < startDate) return false
    if (endDate && due > endDate) return false

    // เดือน (1-12)
    if (month && month !== 'ALL' && m !== Number(month)) return false

    // ปี พ.ศ.
    if (thaiYear && thaiYear !== 'ALL' && tYear !== Number(thaiYear)) return false

    // ปีงบประมาณ (พ.ศ.)
    if (budgetYear && budgetYear !== 'ALL') {
      const bYear = Number(budgetYear)
      // ปีงบ bYear เริ่ม 1 ต.ค. (bYear - 1) ถึง 30 ก.ย. bYear
      const startBudget = `${bYear - 543 - 1}-10-01`
      const endBudget = `${bYear - 543}-09-30`
      if (due < startBudget || due > endBudget) return false
    }

    return true
  })
}

export function getFilterSummary({ startDate, endDate, month, budgetYear, thaiYear, assignee, status, priority, category }) {
  const parts = []
  if (startDate || endDate) parts.push(`ช่วงวันที่: ${startDate || 'ไม่จำกัด'} ถึง ${endDate || 'ไม่จำกัด'}`)
  if (month && month !== 'ALL') parts.push(`เดือน: ${month}`)
  if (thaiYear && thaiYear !== 'ALL') parts.push(`ปี พ.ศ.: ${thaiYear}`)
  if (budgetYear && budgetYear !== 'ALL') parts.push(`ปีงบประมาณ: ${budgetYear}`)
  if (assignee && assignee !== 'ALL') parts.push(`ผู้รับผิดชอบ: ${assignee}`)
  if (status && status !== 'ALL') parts.push(`สถานะ: ${status}`)
  if (priority && priority !== 'ALL') parts.push(`ความสำคัญ: ${priority}`)
  if (category && category !== 'ALL') parts.push(`หมวดหมู่: ${category}`)
  return parts.length > 0 ? parts.join(' | ') : 'แสดงข้อมูลทั้งหมด'
}