import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import Alert from '../components/Alert'

const docRef = doc(db, 'settings', 'dropdowns')
const DEFAULT_CONFIG = {
  statuses: ['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น'],
  priorities: ['ต่ำ', 'ปานกลาง', 'สูง', 'เร่งด่วน'],
  categories: ['ทั่วไป', 'พัฒนาเว็บ', 'ออกแบบ', 'เอกสาร', 'ประชุม', 'การตลาด'],
  assignees: ['กิตติพงษ์ โค้ดเดอร์', 'ปณิธิ คูตระกูล', 'สมชาย ใจดี', 'สมหญิง รักงาน'],
}

const inputCls = 'flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl'

export default function AdminSettings() {
  const [config, setConfig] = useState(null)
  const [inputs, setInputs] = useState({ status: '', priority: '', category: '', assignee: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // เช็กและสร้างค่าเริ่มต้นหากยังไม่มีบน Firestore
    async function load() {
      try {
        const snap = await getDoc(docRef)
        if (!snap.exists()) {
          await setDoc(docRef, DEFAULT_CONFIG)
        }
      } catch (err) {
        setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้')
      }
    }
    load()

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setConfig(snap.data())
      } else {
        setConfig(DEFAULT_CONFIG)
      }
    }, () => {
      setConfig(DEFAULT_CONFIG)
    })

    return () => unsub()
  }, [])

  async function handleAdd(key, valKey) {
    const val = inputs[valKey].trim()
    if (!val) return
    if (config[key].includes(val)) {
      setError('มีตัวเลือกนี้อยู่แล้ว')
      return
    }
    setError('')
    try {
      const updated = { ...config, [key]: [...config[key], val] }
      await setDoc(docRef, updated)
      setInputs((i) => ({ ...i, [valKey]: '' }))
      setSuccess('บันทึกสำเร็จ')
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('บันทึกไม่สำเร็จ')
    }
  }

  async function handleDelete(key, item) {
    if (!confirm(`ต้องการลบ "${item}" ใช่หรือไม่?`)) return
    try {
      const updated = { ...config, [key]: config[key].filter((x) => x !== item) }
      await setDoc(docRef, updated)
      setSuccess('ลบสำเร็จ')
      setTimeout(() => setSuccess(''), 2000)
    } catch {
      setError('ลบไม่สำเร็จ')
    }
  }

  if (!config) return <div className="text-center py-10 text-slate-400">กำลังโหลด...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ตั้งค่าตัวเลือก Dropdown</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">จัดการ เพิ่ม และลบ ตัวเลือกสถานะ ความสำคัญ หมวดหมู่ และผู้รับผิดชอบของระบบ</p>
      </div>

      <Alert type="error">{error}</Alert>
      {success && <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="สถานะงาน" items={config.statuses || []} onDelete={(item) => handleDelete('statuses', item)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.status} onChange={(e) => setInputs({ ...inputs, status: e.target.value })} placeholder="เพิ่มสถานะใหม่..." />
            <button onClick={() => handleAdd('statuses', 'status')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>

        <Section title="ระดับความสำคัญ" items={config.priorities || []} onDelete={(item) => handleDelete('priorities', item)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.priority} onChange={(e) => setInputs({ ...inputs, priority: e.target.value })} placeholder="เพิ่มระดับความสำคัญ..." />
            <button onClick={() => handleAdd('priorities', 'priority')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>

        <Section title="หมวดหมู่" items={config.categories || []} onDelete={(item) => handleDelete('categories', item)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.category} onChange={(e) => setInputs({ ...inputs, category: e.target.value })} placeholder="เพิ่มหมวดหมู่ใหม่..." />
            <button onClick={() => handleAdd('categories', 'category')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>

        <Section title="ผู้รับผิดชอบ" items={config.assignees || []} onDelete={(item) => handleDelete('assignees', item)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.assignee} onChange={(e) => setInputs({ ...inputs, assignee: e.target.value })} placeholder="เพิ่มชื่อผู้รับผิดชอบ..." />
            <button onClick={() => handleAdd('assignees', 'assignee')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, items, onDelete, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-base mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
              {item}
              <button onClick={() => onDelete(item)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </span>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}