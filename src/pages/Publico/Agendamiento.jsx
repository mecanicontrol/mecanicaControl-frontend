import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar              from '../../components/Navbar'
import Footer              from '../../components/Footer'
import BarraProgreso       from '../../components/agendamiento/BarraProgreso'
import PasoFechaHora       from '../../components/agendamiento/PasoFechaHora'
import ResumenAgendamiento from '../../components/agendamiento/ResumenAgendamiento'

export default function Agendamiento() {
    const { state }  = useLocation()
    const navigate   = useNavigate()
    const vehiculo   = state?.vehiculo  ?? {}
    const servicios  = state?.servicios ?? []

    const [paso, setPaso]   = useState(1)
    const [fecha, setFecha] = useState(null)
    const [hora, setHora]   = useState(null)

    useEffect(() => {
        if (!state?.servicios?.length) {
        navigate('/cotizador', { replace: true })
        }
    }, [state?.servicios?.length, navigate])

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
                    onContinuar={() => setPaso(2)}
                    servicios={servicios}
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
