import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BarraProgreso from '../../components/agendamiento/BarraProgreso'
import PasoFechaHora from '../../components/agendamiento/PasoFechaHora'
import ResumenAgendamiento from '../../components/agendamiento/ResumenAgendamiento'
import { crearAgendamiento } from '../../services/agendamientoService'

export default function Agendamiento() {
    const { state } = useLocation()
    const navigate = useNavigate()

    const vehiculo = state?.vehiculo ?? {}

    const servicios = state?.servicios ?? (
        state?.servicio
            ? [
                {
                    id: state.servicioId,
                    nombre: state.servicio,
                    descripcion: state.descripcion,
                    precioBase: state.precio
                }
            ]
            : []
    )

    const [paso, setPaso] = useState(1)
    const [fecha, setFecha] = useState(null)
    const [hora, setHora] = useState(null)
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        if (!servicios.length) {
            navigate('/servicios', { replace: true })
        }
    }, [servicios, navigate])

    const validarSesion = () => {
        const token = localStorage.getItem('token')

        if (!token) {
            alert('Debes iniciar sesión o registrarte antes de agendar un servicio.')
            navigate('/login')
            return false
        }

        return true
    }

    const avanzarPaso2 = () => {
        if (!validarSesion()) return
        setPaso(2)
    }

    const confirmarAgendamiento = async () => {
        if (!validarSesion()) return

        try {
            setCargando(true)

            const payload = {
                vehiculoId: vehiculo?.id || null,
                servicioIds: servicios.map(s => s.id),
                fecha,
                hora
            }

            await crearAgendamiento(payload)

            setPaso(3)
        } catch (error) {
            console.error('Error al crear agendamiento:', error)
            alert('Error al crear el agendamiento')
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                <BarraProgreso paso={paso} />

                <div className="grid grid-cols-10 gap-6 pb-12">

                    <div className="col-span-7">

                        {paso === 1 && (
                            <PasoFechaHora
                                fecha={fecha}
                                onFecha={setFecha}
                                hora={hora}
                                onHora={setHora}
                                onContinuar={avanzarPaso2}
                                servicios={servicios}
                            />
                        )}

                        {paso === 2 && (
                            <div className="bg-white rounded-2xl shadow p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Confirmar Agendamiento
                                </h2>

                                <p className="text-gray-600 mb-6">
                                    Revisa los datos del resumen y confirma tu cita.
                                </p>

                                <button
                                    onClick={confirmarAgendamiento}
                                    disabled={cargando}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
                                >
                                    {cargando ? 'Confirmando...' : 'Confirmar Agendamiento'}
                                </button>
                            </div>
                        )}

                        {paso === 3 && (
                            <div className="bg-white rounded-2xl shadow p-8 text-center">
                                <h2 className="text-3xl font-bold text-green-600 mb-4">
                                    ¡Agendamiento creado!
                                </h2>

                                <p className="text-gray-600">
                                    Tu cita fue registrada correctamente.
                                </p>
                            </div>
                        )}

                    </div>

                    <div className="col-span-3">
                        <ResumenAgendamiento
                            vehiculo={vehiculo}
                            servicios={servicios}
                            fecha={fecha}
                            hora={hora}
                        />
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    )
}