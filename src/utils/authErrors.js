const messages = {
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้สมัครไปแล้ว',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/weak-password': 'รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 6 ตัวอักษร',
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/user-not-found': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/wrong-password': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/user-disabled': 'บัญชีนี้ถูกระงับการใช้งาน',
  'auth/too-many-requests': 'ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่',
  'auth/network-request-failed': 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ กรุณาตรวจสอบสัญญาณ',
  'permission-denied': 'ไม่มีสิทธิ์บันทึกข้อมูล (ตรวจสอบ Security Rules)',
}

export function getAuthErrorMessage(error) {
  return messages[error?.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}