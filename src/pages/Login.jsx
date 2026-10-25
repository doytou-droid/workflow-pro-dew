import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { loginUser } from '../firebase/auth'
import { getAuthErrorMessage } from '../utils/authErrors'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginUser(email.trim(), password)
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="เข้าสู่ระบบ"
      subtitle="กรอกอีเมลและรหัสผ่านเพื่อใช้งาน"
      footer={
        <>
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            สมัครสมาชิก
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type="error">{error}</Alert>
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
          label="รหัสผ่าน"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <Button type="submit" loading={loading}>
          เข้าสู่ระบบ
        </Button>
      </form>
    </AuthLayout>
  )
}