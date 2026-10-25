import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

// สร้างโปรไฟล์ใน Firestore: คนแรกของระบบ = admin, คนถัดไป = viewer
export async function createUserProfile(user, displayName) {
  const userRef = doc(db, 'users', user.uid)
  const initRef = doc(db, 'system', 'init')

  const base = {
    uid: user.uid,
    email: user.email,
    displayName: displayName || user.email,
    status: 'active',
    createdAt: serverTimestamp(),
  }

  const initSnap = await getDoc(initRef)

  if (!initSnap.exists()) {
    try {
      const batch = writeBatch(db)
      batch.set(initRef, { adminUid: user.uid, createdAt: serverTimestamp() })
      batch.set(userRef, { ...base, role: 'admin' })
      await batch.commit()
      return 'admin'
    } catch {
      // มีคนอื่นเป็นแอดมินไปก่อนแล้ว ให้ตกลงมาเป็น viewer
    }
  }

  await setDoc(userRef, { ...base, role: 'viewer' })
  return 'viewer'
}

export async function registerUser({ displayName, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  await createUserProfile(cred.user, displayName)
  await sendEmailVerification(cred.user)
  return cred.user
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function logoutUser() {
  return signOut(auth)
}

export function resendVerification() {
  if (!auth.currentUser) throw new Error('ยังไม่ได้ล็อกอิน')
  return sendEmailVerification(auth.currentUser)
}

export function sendResetEmail(email) {
  return sendPasswordResetEmail(auth, email)
}