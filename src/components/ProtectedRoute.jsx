import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createUserProfile, logoutUser } from '../firebase/auth'
import { getAuthErrorMessage } from '../utils/authErrors'
import LoadingScreen from './LoadingScreen'
import AuthLayout from './AuthLayout'
import Alert from './Alert'
import Button from './Button'

export default function ProtectedRoute({ children }) {
  const { user, profile, authReady, profileLoading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!authReady || profileLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />

  async function retryProfile() {
    setBusy(true)
    setError('')
    try {
      await createUserProfile(user, user.displayName)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (!profile) {
    return (
      <AuthLayout title="ไม่พบข้อมูลโปรไฟล์" subtitle="บัญชีนี้ยังไม่มีข้อมูลในระบบ กดปุ่มด้านล่างเพื่อสร้างใหม่">
        <Alert type="error">{error}</Alert>
        <Button type="button" onClick={retryProfile} loading={busy}>
          สร้างโปรไฟล์
        </Button>
        <Button type="button" variant="secondary" onClick={logoutUser}>
          ออกจากระบบ
        </Button>
      </AuthLayout>
    )
  }

  if (profile.status !== 'active') {
    return (
      <AuthLayout title="บัญชีถูกระงับ" subtitle="กรุณาติดต่อผู้ดูแลระบบ">
        <Button type="button" variant="secondary" onClick={logoutUser}>
          ออกจากระบบ
        </Button>
      </AuthLayout>
    )
  }

  return children
}