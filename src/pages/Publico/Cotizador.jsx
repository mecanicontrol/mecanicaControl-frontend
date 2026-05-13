import { useState, useEffect } from 'react'
import DiagnosticoIA from '../../components/cotizador/DiagnosticoIA'
import ResumenServicios from '../../components/cotizador/ResumenServicios'
import ResumenCotizacion from '../../components/cotizador/ResumenCotizacion'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import HeroCotizador from '../../components/cotizador/HeroCotizador'
import { diagnosticarVehiculo } from '../../services/diagnosticoService'
import { obtenerServicios } from '../../services/serviciosCatalogoService'
import { useLocation } from "react-router-dom";

export default function Cotizador() {
  const { state } = useLocation()

  const [modo, setModo]                               = useState('manual')
  const [vehiculo, setVehiculo]                       = useState(
    state?.vehiculo ?? { marcaId: '', marca: '', modeloId: '', modelo: '', anio: '', kilometraje: '', patente: '' }
  )
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [descripcionFallo, setDescripcionFallo]       = useState('')
  const [resultado, setResultado]                     = useState(null)
  const [cargando, setCargando]                       = useState(false)
  const [error, setError]                             = useState(null)
  const [catalogoServicios, setCatalogoServicios]     = useState([])

  useEffect(() => {
    obtenerServicios()
      .then(({ data }) => setCatalogoServicios(data))
      .catch(() => {})
  }, [])

  const handleAnalizar = async () => {

    setCargando(true)
    setError(null)

    try {

      const { data } = await diagnosticarVehiculo({
        descripcionFallo,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: Number(vehiculo.anio),
        kilometraje: Number(vehiculo.kilometraje),
      })

      setResultado(data)

    } catch (e) {

      setError(e.message)

    } finally {

      setCargando(false)

    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">

      <Navbar />

      <HeroCotizador
        modo={modo}
        setModo={setModo}
      />

      <div className="grid grid-cols-10 gap-6 px-6 py-8 bg-gray-100">

        {/* COLUMNA IZQUIERDA */}
        <div className="col-span-7">

          {modo === 'manual' && (
            <ResumenServicios
              vehiculo={vehiculo}
              setVehiculo={setVehiculo}
              servicios={catalogoServicios}
              serviciosSeleccionados={serviciosSeleccionados}
              setServiciosSeleccionados={setServiciosSeleccionados}
            />
          )}

          {modo === 'ia' && (
            <DiagnosticoIA
              vehiculo={vehiculo}
              setVehiculo={setVehiculo}
              descripcionFallo={descripcionFallo}
              setDescripcionFallo={setDescripcionFallo}
              onAnalizar={handleAnalizar}
              cargando={cargando}
              resultado={resultado}
              error={error}
            />
          )}

        </div>

        {/* COLUMNA DERECHA */}
        <div className="col-span-3">

          <ResumenCotizacion
            vehiculo={vehiculo}
            serviciosSeleccionados={
              modo === 'manual'
                ? serviciosSeleccionados
                : resultado?.serviciosRecomendados?.map(s => {

                    const match = catalogoServicios.find(c =>
                      c.nombre?.toLowerCase().includes(s.nombre?.toLowerCase()) ||
                      s.nombre?.toLowerCase().includes(c.nombre?.toLowerCase())
                    )

                    return {
                      id: match?.id ?? catalogoServicios[0]?.id ?? null,
                      nombre: s.nombre,
                      precioBase: s.precioBase,
                    }

                  }) ?? []
            }
          />

        </div>

      </div>

      <Footer />

    </div>
  )
}