import BarraProgreso from '../../components/agendamiento/BarraProgreso'
import Calendario from '../../components/agendamiento/Calendario'
import PasoConfirmacion from '../../components/agendamiento/PasoConfirmacion'
import PasoCuenta from '../../components/agendamiento/PasoCuenta'
import PasoExito from '../../components/agendamiento/PasoExito'
import Navbar from '../../components/Navbar'

export default function Agendamiento(){
    return (

        <div>
            <Navbar />    
            <div className='bg-gray-100 min-h-screen"'>
                <BarraProgreso />
            </div>
        </div>
    )
}