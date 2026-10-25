import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RoleRoute({ roles, children }) {
  const { role } = useAuth()
  if (!roles.includes(role)) return <Navigate to="/" replace />
  return children
}
