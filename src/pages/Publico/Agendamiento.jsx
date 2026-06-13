import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BarraProgreso from '../../components/agendamiento/BarraProgreso'
import PasoFechaHora from '../../components/agendamiento/PasoFechaHora'
import PasoCuenta from '../../components/agendamiento/PasoCuenta'
import PasoConfirmacion from '../../components/agendamiento/PasoConfirmacion'
import ResumenAgendamiento from '../../components/agendamiento/ResumenAgendamiento'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'

export default function Agendamiento() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { usuario } = useAuth()

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
    const [estadoTaller, setEstadoTaller] = useState(null)

    useEffect(() => {
        if (!servicios.length) {
            navigate('/servicios', { replace: true })
        }
    }, [servicios, navigate])

    useEffect(() => {
        api.get('/api/taller/estado')
            .then(({ data }) => setEstadoTaller(data))
            .catch(() => {})
    }, [])

    const avanzarDesdeFechaHora = () => {
        if (usuario) {
            setPaso(3)
        } else {
            alert('Debes iniciar sesión o registrarte antes de agendar un servicio.')
            setPaso(2)
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                <BarraProgreso paso={paso} />

                {estadoTaller?.tallerLleno && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-500 font-black text-base">!</span>
                            </div>
                            <div>
                                <p className="font-black text-red-700 text-sm">Taller al máximo de capacidad</p>
                                <p className="text-red-500 text-xs mt-0.5">
                                    Actualmente hay {estadoTaller.vehiculosEnTaller} de {estadoTaller.capacidadMaxima} vehículos en reparación.
                                    {estadoTaller.proximaDisponibilidad
                                        ? ` Próxima disponibilidad estimada: ${new Date(estadoTaller.proximaDisponibilidad + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}.`
                                        : ' Por ahora no es posible agendar nuevas recepciones.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {estadoTaller && !estadoTaller.tallerLleno && estadoTaller.disponibles <= 3 && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-yellow-600 font-black text-base">!</span>
                        </div>
                        <p className="text-yellow-700 text-sm">
                            <span className="font-black">Disponibilidad limitada:</span> quedan solo {estadoTaller.disponibles} cupo{estadoTaller.disponibles !== 1 ? 's' : ''} en el taller. Agenda pronto para asegurar tu lugar.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-10 gap-6 pb-12">
                    <div className="col-span-7">
                        {paso === 1 && (
                            <PasoFechaHora
                                fecha={fecha}
                                onFecha={setFecha}
                                hora={hora}
                                onHora={setHora}
                                onContinuar={avanzarDesdeFechaHora}
                                servicios={servicios}
                            />
                        )}

                        {paso === 2 && (
                            <PasoCuenta
                                onVolver={() => setPaso(1)}
                                onContinuar={() => setPaso(3)}
                                vehiculo={vehiculo}
                            />
                        )}

                        {paso === 3 && (
                            <PasoConfirmacion
                                vehiculo={vehiculo}
                                servicios={servicios}
                                fecha={fecha}
                                hora={hora}
                                onVolver={() => setPaso(usuario ? 1 : 2)}
                            />
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