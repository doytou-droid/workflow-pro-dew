import { useState, useEffect } from 'react'
import { getAvatarUrl } from '../utils/avatar'

export default function Avatar({ name, photoURL, className = 'w-8 h-8 rounded-full object-cover bg-slate-100 border border-slate-200' }) {
  const [imgSrc, setImgSrc] = useState(() => getAvatarUrl(name, photoURL))

  // อัปเดตสถานะถ้ารูปต้นฉบับหรือชื่อเปลี่ยน
  useEffect(() => {
    setImgSrc(getAvatarUrl(name, photoURL))
  }, [name, photoURL])

  return (
    <img
      src={imgSrc}
      alt={name || 'User'}
      onError={() => {
        // หากลิงก์รูปจริงโหลดไม่ขึ้น ให้สลับเป็นรูปไดโนเสาร์ทันที
        const fallback = `https://api.dicebear.com/7.x/dinosaur/svg?seed=${encodeURIComponent(name || 'user')}`
        if (imgSrc !== fallback) {
          setImgSrc(fallback)
        }
      }}
      className={className}
    />
  )
}