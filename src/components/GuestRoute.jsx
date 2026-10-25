import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from './LoadingScreen'

export default function GuestRoute({ children }) {
  const { user, authReady } = useAuth()

  if (!authReady) return <LoadingScreen />
  if (user) return <Navigate to={user.emailVerified ? '/' : '/verify-email'} replace />
  return children
}