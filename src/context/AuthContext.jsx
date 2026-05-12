import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario]       = useState(null)
  const [authListo, setAuthListo]   = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const datos = localStorage.getItem('usuario')
    if (token && datos) {
      try { setUsuario(JSON.parse(datos)) } catch { setUsuario(null) }
    }
    setAuthListo(true)
  }, [])

  useEffect(() => {
    const handleForcedLogout = () => setUsuario(null)
    window.addEventListener('auth:logout', handleForcedLogout)
    return () => window.removeEventListener('auth:logout', handleForcedLogout)
  }, [])

  const login = (token, datos) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(datos))
    setUsuario(datos)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, authListo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
