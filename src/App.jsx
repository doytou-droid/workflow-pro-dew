import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import AdminUsers from './pages/AdminUsers'
import PagePlaceholder from './pages/PagePlaceholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/kanban" element={<PagePlaceholder title="Kanban" />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<PagePlaceholder title="ปฏิทิน" />} />
          <Route path="/timeline" element={<PagePlaceholder title="ไทม์ไลน์" />} />
          <Route path="/reports" element={<PagePlaceholder title="รายงาน" />} />
          <Route
  path="/admin/users"
  element={<RoleRoute roles={['admin']}><AdminUsers /></RoleRoute>}
/>

          <Route
            path="/admin/settings"
            element={<RoleRoute roles={['admin']}><PagePlaceholder title="ตั้งค่าระบบ" /></RoleRoute>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}