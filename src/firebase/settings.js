import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from './config'

const docRef = doc(db, 'settings', 'dropdowns')

const DEFAULT_CONFIG = {
  statuses: ['ยังไม่เริ่ม', 'กำลังดำเนินการ', 'รอตรวจทาน', 'เสร็จสิ้น'],
  priorities: ['ต่ำ', 'ปานกลาง', 'สูง', 'เร่งด่วน'],
  categories: ['ทั่วไป', 'พัฒนาเว็บ', 'ออกแบบ', 'เอกสาร', 'ประชุม', 'การตลาด'],
  assignees: ['กิตติพงษ์ โค้ดเดอร์', 'ปณิธิ คูตระกูล', 'สมชาย ใจดี', 'สมหญิง รักงาน'],
}

// โหลดค่าเริ่มต้นถ้ายังไม่มีในระบบ
export async function initSettings() {
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    await setDoc(docRef, DEFAULT_CONFIG)
  }
}

export function subscribeSettings(onData) {
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      onData(snap.data())
    } else {
      onData(DEFAULT_CONFIG)
    }
  })
}

export function updateSettings(data) {
  return setDoc(docRef, data, { merge: true })
}