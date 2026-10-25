export function getAvatarUrl(name, photoURL) {
  if (
    photoURL &&
    typeof photoURL === 'string' &&
    photoURL.trim() !== '' &&
    photoURL !== 'undefined' &&
    photoURL !== 'null' &&
    !photoURL.includes('undefined')
  ) {
    return photoURL
  }
  const seed = encodeURIComponent(name || 'user')
  // ใช้สไตล์ bottts (หุ่นยนต์น่ารัก) หรือ adventurer ที่รองรับแน่นอน 100%
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
}