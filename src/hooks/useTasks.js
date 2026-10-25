import { useEffect, useState } from 'react'
import { subscribeTasks } from '../firebase/tasks'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = subscribeTasks(
      (list) => {
        setTasks(list)
        setLoading(false)
      },
      () => {
        setError('โหลดข้อมูลงานไม่สำเร็จ (ตรวจสอบ Security Rules)')
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { tasks, loading, error }
}