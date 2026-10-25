const styles = {
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-brand-50 text-brand-700 border-brand-100',
}

export default function Alert({ type = 'info', children }) {
  if (!children) return null
  return (
    <div role="alert" className={`border rounded-xl px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  )
}