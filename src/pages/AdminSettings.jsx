import { useEffect, useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import Alert from '../components/Alert'

const docRef = doc(db, 'settings', 'dropdowns')
const DEFAULT_CONFIG = {
  statuses: ['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น'],
  priorities: ['ต่ำ', 'ปานกลาง', 'สูง', 'เร่งด่วน'],
  categories: ['ทั่วไป', 'พัฒนาเว็บ', 'ออกแบบ', 'เอกสาร', 'ประชุม', 'การตลาด'],
  assignees: ['ปณิธิ คูตระกูล'],
}

const inputCls = 'flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl'

export default function AdminSettings() {
  const [config, setConfig] = useState(null)
  const [inputs, setInputs] = useState({ status: '', priority: '', category: '', assignee: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(docRef)
        if (!snap.exists()) {
          await setDoc(docRef, DEFAULT_CONFIG)
        }
      } catch (err) {
        console.error(err)
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
    } catch (err) {
      console.error(err)
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
    } catch (err) {
      console.error(err)
      setError('ลบไม่สำเร็จ')
    }
  }

  async function handleReorder(key, next) {
    setError('')
    try {
      await setDoc(docRef, { ...config, [key]: next })
      setSuccess('จัดลำดับสำเร็จ')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error(err)
      setError('จัดลำดับไม่สำเร็จ')
    }
  }

  if (!config) return <div className="text-center py-10 text-slate-400">กำลังโหลด...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ตั้งค่าตัวเลือก Dropdown</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">จัดการ เพิ่ม ลบ และลากสลับลำดับ ตัวเลือกสถานะ ความสำคัญ หมวดหมู่ และผู้รับผิดชอบของระบบ</p>
      </div>

      <Alert type="error">{error}</Alert>
      {success && <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="สถานะงาน" items={config.statuses || []} onDelete={(item) => handleDelete('statuses', item)} onReorder={(next) => handleReorder('statuses', next)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.status} onChange={(e) => setInputs({ ...inputs, status: e.target.value })} placeholder="เพิ่มสถานะใหม่..." />
            <button onClick={() => handleAdd('statuses', 'status')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>

        <Section title="ระดับความสำคัญ" items={config.priorities || []} onDelete={(item) => handleDelete('priorities', item)} onReorder={(next) => handleReorder('priorities', next)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.priority} onChange={(e) => setInputs({ ...inputs, priority: e.target.value })} placeholder="เพิ่มระดับความสำคัญ..." />
            <button onClick={() => handleAdd('priorities', 'priority')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>

        <Section title="หมวดหมู่" items={config.categories || []} onDelete={(item) => handleDelete('categories', item)} onReorder={(next) => handleReorder('categories', next)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.category} onChange={(e) => setInputs({ ...inputs, category: e.target.value })} placeholder="เพิ่มหมวดหมู่ใหม่..." />
            <button onClick={() => handleAdd('categories', 'category')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>

        <Section title="ผู้รับผิดชอบ" items={config.assignees || []} onDelete={(item) => handleDelete('assignees', item)} onReorder={(next) => handleReorder('assignees', next)}>
          <div className="flex gap-2 mt-3">
            <input className={inputCls} value={inputs.assignee} onChange={(e) => setInputs({ ...inputs, assignee: e.target.value })} placeholder="เพิ่มชื่อผู้รับผิดชอบ..." />
            <button onClick={() => handleAdd('assignees', 'assignee')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /></button>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, items, onDelete, onReorder, children }) {
  const [dragIdx, setDragIdx] = useState(null)

  function drop(to) {
    if (dragIdx === null || dragIdx === to) return
    const next = [...items]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(to, 0, moved)
    setDragIdx(null)
    onReorder(next)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-base">{title}</h3>
          <span className="text-[11px] text-slate-400">ลากเพื่อสลับตำแหน่ง</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {items.map((item, i) => (
            <span
              key={item}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(i)}
              onDragEnd={() => setDragIdx(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm cursor-grab active:cursor-grabbing select-none ${
                dragIdx === i ? 'opacity-40' : ''
              }`}
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-400" />
              {item}
              <button onClick={() => onDelete(item)} className="text-slate-400 hover:text-rose-500 ml-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
            </span>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}