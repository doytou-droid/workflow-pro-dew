export default function Button({ variant = 'primary', loading = false, children, ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-brand-600 hover:bg-brand-700 text-white'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full px-4 py-3 rounded-xl text-base font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${styles}`}
    >
      {loading ? 'กำลังดำเนินการ...' : children}
    </button>
  )
}