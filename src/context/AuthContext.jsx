import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const datos = localStorage.getItem('usuario')
    if (token && datos) {
      try { setUsuario(JSON.parse(datos)) } catch { setUsuario(null) }
    }
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
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
