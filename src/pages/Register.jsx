import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { auth } from '../firebase/config'
import { registerUser } from '../firebase/auth'
import { getAuthErrorMessage } from '../utils/authErrors'

export default function Register() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (displayName.trim().length < 2) {
      setError('กรุณากรอกชื่อ-นามสกุล')
      return
    }
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }
    if (password !== confirm) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      })
      navigate('/verify-email', { replace: true })
    } catch (err) {
      // ถ้าบัญชีถูกสร้างแล้วแต่ขั้นหลังพลาด ให้ไปหน้ายืนยันอีเมล (ส่งอีเมลซ้ำได้ที่นั่น)
      if (auth.currentUser) {
        navigate('/verify-email', { replace: true })
        return
      }
      setError(getAuthErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="สมัครสมาชิก"
      subtitle="ใช้อีเมลจริง เพราะระบบจะส่งลิงก์ยืนยันไปให้"
      footer={
        <>
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type="error">{error}</Alert>
        <FormField
          id="displayName"
          label="ชื่อ-นามสกุล"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <FormField
          id="email"
          label="อีเมล"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          id="password"
          label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormField
          id="confirm"
          label="ยืนยันรหัสผ่าน"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          สมัครสมาชิก
        </Button>
      </form>
    </AuthLayout>
  )
}