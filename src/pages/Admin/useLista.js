import { useState, useEffect } from 'react'

export default function useLista(fnCargar) {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const cargar = async () => {
    setCargando(true)
    try { const { data } = await fnCargar(); setDatos(Array.isArray(data) ? data : []) }
    catch { setDatos([]) }
    finally { setCargando(false) }
  }
  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return { datos, setDatos, cargando, recargar: cargar }
}
