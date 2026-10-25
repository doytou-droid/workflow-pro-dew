import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { AuthContext } from './authContext'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [, setVersion] = useState(0)

  useEffect(() => {
    let unsubscribeProfile = null

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile()
        unsubscribeProfile = null
      }

      setUser(firebaseUser)
      setProfile(null)

      if (!firebaseUser) {
        setProfileLoading(false)
        setAuthReady(true)
        return
      }

      setProfileLoading(true)
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (snap) => {
          setProfile(snap.exists() ? snap.data() : null)
          setProfileLoading(false)
        },
        () => {
          setProfile(null)
          setProfileLoading(false)
        },
      )
      setAuthReady(true)
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeProfile) unsubscribeProfile()
    }
  }, [])

  // โหลดสถานะผู้ใช้ใหม่ (ใช้หลังกดยืนยันอีเมลแล้ว)
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return
    await auth.currentUser.reload()
    await auth.currentUser.getIdToken(true)
    setVersion((v) => v + 1)
  }, [])

  const value = {
    user,
    profile,
    role: profile?.role ?? null,
    authReady,
    profileLoading,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}