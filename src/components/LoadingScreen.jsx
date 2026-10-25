export default function LoadingScreen({ text = 'กำลังโหลด...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500">
      {text}
    </div>
  )
}
