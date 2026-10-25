import { useEffect, useState } from 'react'
import { Plus, Trash2, Shield, User, X } from 'lucide-react'
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { getAvatarUrl } from '../utils/avatar'
import Alert from '../components/Alert'

const inputCls = 'w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ฟอร์มสำหรับเพิ่ม/แก้ไขผู้ใช้
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'staff',
    photoURL: '',
  })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list = []
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
      setUsers(list)
      setLoading(false)
    }, () => {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // แปลงรูปเป็น Base64
  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((f) => ({ ...f, photoURL: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function handleOpenModal(u = null) {
    if (u) {
      setEditUser(u)
      setForm({
        name: u.name || '',
        email: u.email || '',
        role: u.role || 'staff',
        photoURL: u.photoURL || '',
      })
    } else {
      setEditUser(null)
      setForm({ name: '', email: '', role: 'staff', photoURL: '' })
    }
    setModal(true)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim()) {
      setError('กรุณากรอกชื่อและอีเมลให้ครบถ้วน')
      return
    }

    try {
      const id = editUser ? editUser.id : (form.email.toLowerCase().replace(/[^a-z0-9]/g, '_'))
      await setDoc(doc(db, 'users', id), {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        photoURL: form.photoURL || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true })

      setSuccess('บันทึกข้อมูลผู้ใช้สำเร็จ')
      setModal(false)
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    }
  }

  async function handleDelete(u) {
    if (!confirm(`ต้องการลบผู้ใช้ "${u.name}" ใช่หรือไม่?`)) return
    try {
      await deleteDoc(doc(db, 'users', u.id))
      setSuccess('ลบผู้ใช้สำเร็จ')
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('ลบผู้ใช้ไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการผู้ใช้และสิทธิ์</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">กำหนดสิทธิ์การใช้งานและรูปโปรไฟล์ของผู้ใช้งานในระบบ</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <Alert type="error">{error}</Alert>
      {success && <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{success}</div>}

      {loading ? (
        <div className="text-center py-10 text-slate-400">กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3.5">ผู้ใช้งาน</th>
                <th className="p-3.5">อีเมล</th>
                <th className="p-3.5">สิทธิ์การใช้งาน</th>
                <th className="p-3.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={getAvatarUrl(u.name, u.photoURL)}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover bg-slate-100 border border-slate-200"
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      u.role === 'staff' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      <Shield className="w-3.5 h-3.5" />
                      {u.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : u.role === 'staff' ? 'เจ้าหน้าที่ (Staff)' : 'ผู้เยี่ยมชม (Viewer)'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button onClick={() => handleOpenModal(u)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 mr-2">
                      แก้ไข
                    </button>
                    <button onClick={() => handleDelete(u)} className="p-1.5 text-slate-400 hover:text-rose-600" aria-label="ลบผู้ใช้">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไขผู้ใช้ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
              <button onClick={() => setModal(false)} className="p-2 text-slate-500" aria-label="ปิด">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล *</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="เช่น ปณิธิ คูตระกูล" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">อีเมล *</label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="example@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สิทธิ์การใช้งาน</label>
                <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  <option value="staff">เจ้าหน้าที่ (Staff)</option>
                  <option value="viewer">ผู้เยี่ยมชม (Viewer)</option>
                </select>
              </div>

              {/* ช่องอัปโหลดรูปโปรไฟล์ */}
              <div>
                <label className="block text-sm font-medium mb-1">รูปโปรไฟล์ (หากไม่เลือกจะใช้รูปไดโนเสาร์อัตโนมัติ)</label>
                <div className="flex items-center gap-3 mt-1">
                  <img
                    src={getAvatarUrl(form.name, form.photoURL)}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-300 shrink-0"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-medium">
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}