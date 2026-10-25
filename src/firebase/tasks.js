import {
  addDoc, updateDoc, deleteDoc, doc, collection, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const col = collection(db, 'tasks')

export function subscribeTasks(onData, onError) {
  const q = query(col, orderBy('dueDate', 'asc'))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export function createTask(data, user, profile) {
  return addDoc(col, {
    ...data,
    ownerUid: user.uid,
    ownerName: profile.displayName,
    createdAt: serverTimestamp(),
  })
}

export function updateTask(id, data) {
  return updateDoc(doc(db, 'tasks', id), data)
}

export function deleteTask(id) {
  return deleteDoc(doc(db, 'tasks', id))
}