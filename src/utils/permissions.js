import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  CalendarDays,
  GanttChart,
  FileText,
  Users,
  Settings,
} from 'lucide-react'

export const roleLabels = {
  admin: 'ผู้ดูแลระบบ',
  staff: 'เจ้าหน้าที่',
  viewer: 'ผู้ดูทั่วไป',
}

// roles = สิทธิ์ที่มองเห็นเมนูนี้
export const menus = [
  { path: '/', label: 'แดชบอร์ด', icon: LayoutDashboard, roles: ['admin', 'staff', 'viewer'] },
  { path: '/kanban', label: 'Kanban', icon: Kanban, roles: ['admin', 'staff', 'viewer'] },
  { path: '/tasks', label: 'รายการงาน', icon: ListTodo, roles: ['admin', 'staff', 'viewer'] },
  { path: '/calendar', label: 'ปฏิทิน', icon: CalendarDays, roles: ['admin', 'staff', 'viewer'] },
  { path: '/timeline', label: 'ไทม์ไลน์', icon: GanttChart, roles: ['admin', 'staff', 'viewer'] },
  { path: '/reports', label: 'รายงาน', icon: FileText, roles: ['admin', 'staff', 'viewer'] },
  { path: '/admin/users', label: 'จัดการผู้ใช้', icon: Users, roles: ['admin'] },
  { path: '/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings, roles: ['admin'] },
]

export function menusForRole(role) {
  return menus.filter((m) => m.roles.includes(role))
}