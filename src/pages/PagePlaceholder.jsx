export default function PagePlaceholder({ title, note }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{note || 'หน้านี้จะสร้างในขั้นถัดไป'}</p>
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400">
        ยังไม่มีเนื้อหา
      </div>
    </div>
  )
}