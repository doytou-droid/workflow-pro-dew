import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { subscribeUsers, updateUserRole, updateUserStatus } from '../firebase/users'
import { roleLabels } from '../utils/permissions'
import Alert from '../components/Alert'

const selectCls =
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl disabled:opacity-50'

export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    return subscribeUsers(
      (list) => {
        setUsers(list.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '', 'th')))
        setLoading(false)
      },
      () => {
        setError('โหลดรายชื่อผู้ใช้ไม่สำเร็จ')
        setLoading(false)
      },
    )
  }, [])

  async function run(fn) {
    setError('')
    try {
      await fn()
    } catch {
      setError('บันทึกไม่สำเร็จ อาจไม่มีสิทธิ์หรืออินเทอร์เน็ตมีปัญหา')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการผู้ใช้</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ผู้สมัครใหม่จะเป็นผู้ดูทั่วไปก่อน เลื่อนสิทธิ์ได้ที่นี่ (ไม่สามารถแก้ไขบัญชีของตัวเองได้)
        </p>
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="text-center text-slate-400 py-10">กำลังโหลด...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {users.map((u) => {
            const isMe = u.uid === user.uid
            return (
              <div key={u.uid} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {u.displayName} {isMe && <span className="text-xs text-brand-600">(คุณ)</span>}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{u.email}</div>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      u.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {u.status === 'active' ? 'ใช้งานอยู่' : 'ระงับ'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">สิทธิ์</label>
                    <select
                      className={selectCls}
                      disabled={isMe}
                      value={u.role}
                      onChange={(e) => run(() => updateUserRole(u.uid, e.target.value))}
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">สถานะบัญชี</label>
                    <select
                      className={selectCls}
                      disabled={isMe}
                      value={u.status}
                      onChange={(e) => run(() => updateUserStatus(u.uid, e.target.value))}
                    >
                      <option value="active">ใช้งานอยู่</option>
                      <option value="suspended">ระงับ</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}