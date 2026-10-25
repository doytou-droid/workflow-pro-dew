import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initSettings } from './firebase/settings'
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Kanban from './pages/Kanban'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Timeline from './pages/Timeline'
import Reports from './pages/Reports'
import AdminUsers from './pages/AdminUsers'
import AdminSettings from './pages/AdminSettings'

export default function App() {
  // โหลดค่าเริ่มต้นตัวเลือก Dropdown ลงใน Firestore ทันทีเมื่อเปิดระบบ
  useEffect(() => {
    initSettings().catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/reports" element={<Reports />} />
          <Route
            path="/admin/users"
            element={<RoleRoute roles={['admin']}><AdminUsers /></RoleRoute>}
          />
          <Route
  path="/admin/settings"
  element={<RoleRoute roles={['admin']}><AdminSettings /></RoleRoute>}
/>

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}