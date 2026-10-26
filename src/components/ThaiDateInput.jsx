const pad = (n) => String(n).padStart(2, '0')
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export default function ThaiDateInput({ value, onChange, className }) {
  const now = new Date()
  const [y, m, d] = (value || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`)
    .split('-').map(Number)

  const years = []
  for (let i = Math.min(y, now.getFullYear()) - 2; i <= Math.max(y, now.getFullYear()) + 5; i++) years.push(i)

  function update(ny, nm, nd) {
    const maxDay = new Date(ny, nm, 0).getDate()
    onChange(`${ny}-${pad(nm)}-${pad(Math.min(nd, maxDay))}`)
  }

  return (
    <div className="flex gap-2">
      <select className={className} value={d} onChange={(e) => update(y, m, Number(e.target.value))}>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <select className={className} value={m} onChange={(e) => update(y, Number(e.target.value), d)}>
        {MONTHS.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
      </select>
      <select className={className} value={y} onChange={(e) => update(Number(e.target.value), m, d)}>
        {years.map((x) => <option key={x} value={x}>{x + 543}</option>)}
      </select>
    </div>
  )
}