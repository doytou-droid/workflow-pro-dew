import { useMemo, useState, useRef } from 'react'
import { Printer, FileSpreadsheet } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { formatThaiDate } from '../utils/date'
import { filterTasks, getFilterSummary } from '../utils/filterUtils'
import GlobalFilters from '../components/GlobalFilters'
import Alert from '../components/Alert'

const selectCls =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl'

export default function Reports() {
  const { tasks, loading, error } = useTasks()
  const [tab, setTab] = useState('tasks') // 'tasks' | 'dashboard'
  const [orientation, setOrientation] = useState('portrait') // 'portrait' | 'landscape'

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

  const printRef = useRef(null)

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
        const [y, m] = t.dueDate.split('-').map(Number)
        const bYear = m >= 10 ? y + 543 + 1 : y + 543
        set.add(bYear)
      }
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [tasks])

  const list = useMemo(() => filterTasks(tasks, filters), [tasks, filters])

  function handlePrint() {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '', 'width=900,height=700')
    win.document.write(`
      <html>
        <head>
          <title>รายงาน WorkFlow Pro</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4 ${orientation}; margin: 15mm; }
            body { font-family: 'Prompt', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="bg-white text-slate-800 p-6">
          ${content.innerHTML}
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
    }, 500)
  }

  function exportCSV() {
    if (list.length === 0) return
    const headers = ['ชื่องาน', 'หมวดหมู่', 'ความสำคัญ', 'สถานะ', 'ผู้รับผิดชอบ', 'กำหนดส่ง']
    const rows = list.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      `"${(t.assignee || '').replace(/"/g, '""')}"`,
      t.dueDate,
    ])
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${tab}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">รายงาน A4</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">กรองข้อมูลช่วงเวลาและเงื่อนไขเพื่อพิมพ์ PDF หรือ Export CSV</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
          >
            <Printer className="w-4 h-4" /> พิมพ์ / บันทึก PDF
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-xs font-medium mb-1">ประเภทรายงาน</label>
          <select value={tab} onChange={(e) => setTab(e.target.value)} className={selectCls}>
            <option value="tasks">รายงานรายการงาน</option>
            <option value="dashboard">รายงานสรุปภาพรวม</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">รูปแบบกระดาษ A4</label>
          <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className={selectCls}>
            <option value="portrait">แนวตั้ง (Portrait)</option>
            <option value="landscape">แนวนอน (Landscape)</option>
          </select>
        </div>
      </div>

      <GlobalFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
        assignees={assignees}
        thaiYears={thaiYears}
        budgetYears={budgetYears}
      />

      <Alert type="error">{error}</Alert>

      {/* ส่วนแสดงผลตัวอย่าง A4 */}
      <div className="bg-slate-200 dark:bg-slate-900 p-2 sm:p-6 rounded-2xl overflow-x-auto flex justify-center">
        <div ref={printRef} className="bg-white text-slate-800 w-[210mm] min-h-[297mm] p-8 sm:p-12 shadow-xl rounded-xl space-y-6">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h2 className="text-xl font-bold">WorkFlow Pro - รายงานระบบ</h2>
              <p className="text-xs text-slate-500 mt-1">เงื่อนไข: {getFilterSummary(filters)}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>วันที่พิมพ์: {formatThaiDate(new Date().toISOString().split('T')[0])}</p>
              <p>จำนวนที่แสดง: {list.length} จาก {tasks.length} งาน</p>
            </div>
          </div>

          {tab === 'tasks' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-2.5">ชื่องาน</th>
                    <th className="p-2.5">หมวดหมู่</th>
                    <th className="p-2.5">ความสำคัญ</th>
                    <th className="p-2.5">สถานะ</th>
                    <th className="p-2.5">ผู้รับผิดชอบ</th>
                    <th className="p-2.5">กำหนดส่ง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-6 text-slate-400">กำลังโหลด...</td></tr>
                  ) : list.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-slate-400">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</td></tr>
                  ) : (
                    list.map((t) => (
                      <tr key={t.id}>
                        <td className="p-2.5 font-semibold">{t.title}</td>
                        <td className="p-2.5">{t.category}</td>
                        <td className="p-2.5">{t.priority}</td>
                        <td className="p-2.5">{t.status}</td>
                        <td className="p-2.5">{t.assignee}</td>
                        <td className="p-2.5">{formatThaiDate(t.dueDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-sm border-b pb-2">สรุปภาพรวมตามเงื่อนไขที่เลือก</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <div className="text-xs text-slate-500">งานที่ตรงเงื่อนไข</div>
                  <div className="text-xl font-bold mt-1">{list.length}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <div className="text-xs text-slate-500">เสร็จสิ้น</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">{list.filter((t) => t.status === 'เสร็จสิ้น').length}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <div className="text-xs text-slate-500">กำลังดำเนินการ</div>
                  <div className="text-xl font-bold text-blue-600 mt-1">{list.filter((t) => t.status === 'กำลังดำเนินการ' || t.status === 'รอตรวจทาน').length}</div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-10 flex justify-between text-xs text-slate-400 border-t mt-auto">
            <span>WorkFlow Pro - ระบบบริหารจัดการงาน</span>
            <span>หน้า 1 จาก 1</span>
          </div>
        </div>
      </div>
    </div>
  )
}