import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RutaProtegida({ rolesPermitidos, children }) {
  const { usuario, authListo } = useAuth()

  if (!authListo) return null   // esperar a que se lea el localStorage

  if (!usuario) return <Navigate to="/login" replace />

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol))
    return <Navigate to="/" replace />

  return children
}
