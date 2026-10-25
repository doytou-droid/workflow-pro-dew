import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { logoutUser } from '../firebase/auth'

const roleLabels = {
  admin: 'ผู้ดูแลระบบ (Admin)',
  staff: 'เจ้าหน้าที่',
  viewer: 'ผู้ดูทั่วไป',
}

export default function Home() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await logoutUser()
  }

  return (
    <AuthLayout title="เข้าสู่ระบบสำเร็จ" subtitle="หน้านี้เป็นหน้าชั่วคราว (หน้าหลักจริงจะทำในขั้นถัดไป)">
      <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
        <p>
          <span className="text-slate-500">ชื่อ:</span> {profile.displayName}
        </p>
        <p>
          <span className="text-slate-500">อีเมล:</span> {user.email}
        </p>
        <p>
          <span className="text-slate-500">สิทธิ์:</span> {roleLabels[profile.role] || profile.role}
        </p>
      </div>
      <Button type="button" variant="secondary" onClick={handleLogout} loading={loading}>
        ออกจากระบบ
      </Button>
    </AuthLayout>
  )
}