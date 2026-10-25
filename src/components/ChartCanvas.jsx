import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    )
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

export default function ChartCanvas({ type, data, options }) {
  const canvasRef = useRef(null)
  const dark = useIsDark()
  const key = JSON.stringify({ type, data, options })

  useEffect(() => {
    Chart.defaults.color = dark ? '#cbd5e1' : '#475569'
    Chart.defaults.borderColor = dark ? '#334155' : '#e2e8f0'
    Chart.defaults.font.family = 'Prompt, sans-serif'

    const chart = new Chart(canvasRef.current, {
      type,
      data,
      options: { responsive: true, maintainAspectRatio: false, ...options },
    })
    return () => chart.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, dark])

  return <canvas ref={canvasRef} />
}