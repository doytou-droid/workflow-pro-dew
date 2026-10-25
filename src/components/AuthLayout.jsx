export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            W
          </div>
          <span className="text-2xl font-bold text-slate-900">WorkFlow Pro</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6 space-y-4">{children}</div>
        </div>

        {footer && <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </div>
  )
}