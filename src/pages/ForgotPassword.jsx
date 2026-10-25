import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { sendResetEmail } from '../firebase/auth'
import { getAuthErrorMessage } from '../utils/authErrors'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSent(false)
    setLoading(true)
    try {
      await sendResetEmail(email.trim())
      setSent(true)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="ลืมรหัสผ่าน"
      subtitle="กรอกอีเมลที่สมัครไว้ เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้"
      footer={
        <Link to="/login" className="text-brand-600 font-semibold hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type="error">{error}</Alert>
        {sent && (
          <Alert type="success">
            หากอีเมลนี้มีในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว กรุณาตรวจสอบกล่องจดหมาย (รวมถึงจดหมายขยะ)
          </Alert>
        )}
        <FormField
          id="email"
          label="อีเมล"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </Button>
      </form>
    </AuthLayout>
  )
}