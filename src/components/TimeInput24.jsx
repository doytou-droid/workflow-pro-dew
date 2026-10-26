const pad = (n) => String(n).padStart(2, '0')
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i))
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5))

export default function TimeInput24({ value, onChange, className }) {
  const [h = '18', m = '00'] = (value || '18:00').split(':')
  const minutes = MINUTES.includes(m) ? MINUTES : [...MINUTES, m].sort()
  return (
    <div className="flex items-center gap-2">
      <select className={className} value={h} onChange={(e) => onChange(`${e.target.value}:${m}`)}>
        {HOURS.map((x) => <option key={x}>{x}</option>)}
      </select>
      <span className="font-bold">:</span>
      <select className={className} value={m} onChange={(e) => onChange(`${h}:${e.target.value}`)}>
        {minutes.map((x) => <option key={x}>{x}</option>)}
      </select>
      <span className="text-sm text-slate-400">น.</span>
    </div>
  )
}