import { useDropdownConfig } from '../hooks/useDropdownConfig'

const selectCls =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl'

export default function GlobalFilters({ filters, onChange, categories, assignees, thaiYears, budgetYears }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value })
  const config = useDropdownConfig()

  const assigneeOptions = [...new Set([...(config.assignees || []), ...(assignees || [])])]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-sm">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ตัวกรองข้อมูลขั้นสูง (ลิ้งค์เชื่อมโยงทั้งระบบ)</div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium mb-1">ตั้งแต่วันที่</label>
          <input type="date" value={filters.startDate} onChange={set('startDate')} className={selectCls} />
        </div>
        <div>
          <label className="block text-[11px] font-medium mb-1">ถึงวันที่</label>
          <input type="date" value={filters.endDate} onChange={set('endDate')} className={selectCls} />
        </div>
        <div>
          <label className="block text-[11px] font-medium mb-1">เดือน</label>
          <select value={filters.month} onChange={set('month')} className={selectCls}>
            <option value="ALL">ทุกเดือน</option>
            {['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'].map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium mb-1">ปี พ.ศ.</label>
          <select value={filters.thaiYear} onChange={set('thaiYear')} className={selectCls}>
            <option value="ALL">ทุกปี พ.ศ.</option>
            {thaiYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium mb-1">ปีงบประมาณ</label>
          <select value={filters.budgetYear} onChange={set('budgetYear')} className={selectCls}>
            <option value="ALL">ทุกปีงบ</option>
            {budgetYears.map((by) => <option key={by} value={by}>ปีงบ {by}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium mb-1">ผู้รับผิดชอบ</label>
          <select value={filters.assignee} onChange={set('assignee')} className={selectCls}>
            <option value="ALL">ทุกคน</option>
            {assigneeOptions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium mb-1">สถานะ</label>
          <select value={filters.status} onChange={set('status')} className={selectCls}>
            <option value="ALL">ทุกสถานะ</option>
            {config.statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium mb-1">ความสำคัญ</label>
          <select value={filters.priority} onChange={set('priority')} className={selectCls}>
            <option value="ALL">ทุกความสำคัญ</option>
            {config.priorities.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}