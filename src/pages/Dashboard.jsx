import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, CheckCircle2, Loader, AlertTriangle, Zap } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { isOverdue, todayStr } from '../utils/date'
import { STATUSES, PRIORITIES } from '../utils/taskConfig'
import { filterTasks, getFilterSummary } from '../utils/filterUtils'
import ChartCanvas from '../components/ChartCanvas'
import GlobalFilters from '../components/GlobalFilters'
import Alert from '../components/Alert'

function Kpi({ label, value, sub, icon: Icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:border-brand-500 transition-all shadow-sm hover:shadow"
    >
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
        <span>{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`mt-2 text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-slate-400">{sub} (คลิกเพื่อดูรายการ)</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="h-64 relative">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const { tasks, loading, error } = useTasks()
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: 'ALL',
    thaiYear: 'ALL',
    budgetYear: 'ALL',
    assignee: 'ALL',
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
  })

  const assignees = useMemo(() => Array.from(new Set(tasks.map((t) => t.assignee || 'ไม่ระบุ'))), [tasks])
  const categories = useMemo(() => Array.from(new Set(tasks.map((t) => t.category || 'ทั่วไป'))), [tasks])
  const thaiYears = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => {
      if (t.dueDate) set.add(Number(t.dueDate.split('-')[0]) + 543)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [tasks])
  const budgetYears = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => {
      if (t.dueDate) {
        const [y, m] = t.dueDate.split('-')[0], [_, mm] = t.dueDate.split('-').map(Number)
        set.add(mm >= 10 ? Number(y) + 543 + 1 : Number(y) + 543)
      }
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [tasks])

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters])

  const stats = useMemo(() => {
    const total = filteredTasks.length
    const done = filteredTasks.filter((t) => t.status === 'เสร็จสิ้น').length
    const inProgress = filteredTasks.filter((t) => t.status === 'กำลังดำเนินการ' || t.status === 'รอตรวจทาน').length
    const overdue = filteredTasks.filter(isOverdue).length
    const urgent = filteredTasks.filter(
      (t) => (t.priority === 'สูง' || t.priority === 'เร่งด่วน') && t.status !== 'เสร็จสิ้น',
    ).length
    const dueToday = filteredTasks.filter((t) => t.dueDate === todayStr() && t.status !== 'เสร็จสิ้น')

    const byStatus = STATUSES.map((s) => filteredTasks.filter((t) => t.status === s).length)
    const byPriority = PRIORITIES.map((p) => filteredTasks.filter((t) => t.priority === p).length)

    const catMap = {}
    filteredTasks.forEach((t) => {
      const c = t.category || 'ทั่วไป'
      catMap[c] = (catMap[c] || 0) + 1
    })

    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return {
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        count: filteredTasks.filter((t) => t.dueDate === str && t.status !== 'เสร็จสิ้น').length,
      }
    })

    return { total, done, inProgress, overdue, urgent, dueToday, byStatus, byPriority, catMap, days }
  }, [filteredTasks])

  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0

  let focusTitle = 'ภาระงานตามเงื่อนไขอยู่ในเกณฑ์ปกติ'
  let focusDesc = 'ไม่มีงานเกินกำหนดหรือครบกำหนดในเงื่อนไขนี้'
  if (stats.overdue > 0) {
    focusTitle = `มีงานเกินกำหนดส่ง ${stats.overdue} รายการ`
    focusDesc = 'ควรเร่งเคลียร์งานที่เกินกำหนด หรืออัปเดตสถานะให้เป็นปัจจุบัน'
  } else if (stats.dueToday.length > 0) {
    focusTitle = `วันนี้มีกำหนดส่ง ${stats.dueToday.length} งาน`
    focusDesc = `เช่น "${stats.dueToday[0].title}"`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">แดชบอร์ด</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">สรุปสถานะและความคืบหน้าตามเงื่อนไขตัวกรอง</p>
      </div>

      <GlobalFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
        assignees={assignees}
        thaiYears={thaiYears}
        budgetYears={budgetYears}
      />

      <div className="text-xs text-brand-600 dark:text-brand-400 font-medium px-1">
        เงื่อนไขปัจจุบัน: {getFilterSummary(filters)} (แสดงผล {filteredTasks.length} จาก {tasks.length} งาน)
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="text-center text-slate-400 py-10">กำลังโหลด...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Kpi label="งานที่กรองได้" value={stats.total} sub="ทั้งหมด" icon={Layers} color="text-brand-600" onClick={() => navigate('/tasks')} />
            <Kpi label="เสร็จสิ้น" value={`${pct}%`} sub={`${stats.done} งาน`} icon={CheckCircle2} color="text-emerald-600" onClick={() => navigate('/tasks?status=เสร็จสิ้น')} />
            <Kpi label="กำลังดำเนินการ" value={stats.inProgress} sub="รอดำเนินการ" icon={Loader} color="text-amber-600" onClick={() => navigate('/tasks?status=กำลังดำเนินการ')} />
            <Kpi label="เกินกำหนด" value={stats.overdue} sub="ต้องเร่งแก้ไข" icon={AlertTriangle} color="text-rose-600" onClick={() => navigate('/tasks?overdue=true')} />
            <div className="col-span-2 lg:col-span-1">
              <Kpi label="งานเร่งด่วน" value={stats.urgent} sub="สูง/เร่งด่วน" icon={Zap} color="text-purple-600" onClick={() => navigate('/tasks?priority=เร่งด่วน')} />
            </div>
          </div>

          <div className="rounded-2xl bg-brand-600 text-white p-5 sm:p-6 shadow-sm">
            <div className="text-xs font-medium opacity-80">คำแนะนำประจำวันตามฟิลเตอร์</div>
            <div className="mt-1 text-lg sm:text-xl font-bold">{focusTitle}</div>
            <div className="mt-1 text-sm opacity-90">{focusDesc}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="สัดส่วนสถานะงาน (ตามฟิลเตอร์)">
              <ChartCanvas
                type="doughnut"
                data={{
                  labels: STATUSES,
                  datasets: [{ data: stats.byStatus, backgroundColor: ['#94a3b8', '#3b82f6', '#a855f7', '#10b981'], borderWidth: 0 }],
                }}
                options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }}
              />
            </ChartCard>

            <ChartCard title="จำนวนงานแยกตามหมวดหมู่ (ตามฟิลเตอร์)">
              <ChartCanvas
                type="bar"
                data={{
                  labels: Object.keys(stats.catMap),
                  datasets: [{ label: 'จำนวนงาน', data: Object.values(stats.catMap), backgroundColor: '#6366f1', borderRadius: 8 }],
                }}
                options={{ plugins: { legend: { display: false } }, scales: { y: { ticks: { stepSize: 1 }, beginAtZero: true } } }}
              />
            </ChartCard>

            <ChartCard title="งานที่ครบกำหนด 7 วันข้างหน้า (ตามฟิลเตอร์)">
              <ChartCanvas
                type="line"
                data={{
                  labels: stats.days.map((d) => d.label),
                  datasets: [{
                    label: 'จำนวนงาน',
                    data: stats.days.map((d) => d.count),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    fill: true,
                    tension: 0.35,
                  }],
                }}
                options={{ plugins: { legend: { display: false } }, scales: { y: { ticks: { stepSize: 1 }, beginAtZero: true } } }}
              />
            </ChartCard>

            <ChartCard title="สัดส่วนระดับความสำคัญ (ตามฟิลเตอร์)">
              <ChartCanvas
                type="bar"
                data={{
                  labels: PRIORITIES,
                  datasets: [{ data: stats.byPriority, backgroundColor: ['#94a3b8', '#f59e0b', '#f97316', '#ef4444'], borderRadius: 8 }],
                }}
                options={{ indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { stepSize: 1 }, beginAtZero: true } } }}
              />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}