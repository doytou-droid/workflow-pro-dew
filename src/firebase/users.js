import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from './config'

export function subscribeUsers(onData, onError) {
  return onSnapshot(
    collection(db, 'users'),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export function updateUserRole(uid, role) {
  return updateDoc(doc(db, 'users', uid), { role })
}

export function updateUserStatus(uid, status) {
  return updateDoc(doc(db, 'users', uid), { status })
}