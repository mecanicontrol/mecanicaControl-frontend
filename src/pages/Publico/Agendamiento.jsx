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

    useEffect(() => {
        if (!servicios.length) {
            navigate('/servicios', { replace: true })
        }
    }, [servicios, navigate])

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