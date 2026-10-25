import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import Alert from '../components/Alert'
import LoadingScreen from '../components/LoadingScreen'
import { auth } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { resendVerification, logoutUser } from '../firebase/auth'
import { getAuthErrorMessage } from '../utils/authErrors'

export default function VerifyEmail() {
  const { user, authReady, refreshUser } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(30)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  if (!authReady) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.emailVerified) return <Navigate to="/" replace />

  async function handleResend() {
    setError('')
    setMessage('')
    try {
      await resendVerification()
      setMessage('ส่งอีเมลยืนยันอีกครั้งแล้ว กรุณาตรวจสอบกล่องจดหมาย (รวมถึงจดหมายขยะ)')
      setCooldown(60)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
  }

  async function handleCheck() {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      await refreshUser()
      if (!auth.currentUser?.emailVerified) {
        setError('ยังไม่พบการยืนยัน กรุณากดลิงก์ในอีเมลก่อน แล้วลองอีกครั้ง')
      }
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="ยืนยันอีเมลของคุณ"
      subtitle={`เราส่งลิงก์ยืนยันไปที่ ${user.email} กรุณากดลิงก์ในอีเมล แล้วกลับมากดปุ่มด้านล่าง`}
    >
      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>
      <Button type="button" onClick={handleCheck} loading={busy}>
        ฉันยืนยันอีเมลแล้ว
      </Button>
      <Button type="button" variant="secondary" onClick={handleResend} disabled={cooldown > 0}>
        {cooldown > 0 ? `ส่งอีเมลอีกครั้ง (รอ ${cooldown} วินาที)` : 'ส่งอีเมลยืนยันอีกครั้ง'}
      </Button>
      <Button type="button" variant="secondary" onClick={logoutUser}>
        ออกจากระบบ
      </Button>
    </AuthLayout>
  )
}