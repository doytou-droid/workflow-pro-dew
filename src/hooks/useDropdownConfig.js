import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export const DEFAULT_CONFIG = {
  statuses: ['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น'],
  priorities: ['ต่ำ', 'ปานกลาง', 'สูง', 'เร่งด่วน'],
  categories: ['ทั่วไป', 'พัฒนาเว็บ', 'ออกแบบ', 'เอกสาร'],
  assignees: ['ปณิธิ คูตระกูล'],
}

export function useDropdownConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'dropdowns'),
      (snap) => {
        if (snap.exists()) setConfig({ ...DEFAULT_CONFIG, ...snap.data() })
      },
      (err) => console.error(err)
    )
    return () => unsub()
  }, [])

  return config
}