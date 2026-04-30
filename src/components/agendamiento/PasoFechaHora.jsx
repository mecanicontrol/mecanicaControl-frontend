import Calendario from './Calendario'
import SelectorHorario from './SelectorHorario'

export default function PasoFechaHora({ fecha, onFecha, hora, onHora, onContinuar, servicios }) {
  const servicioId = servicios?.[0]?.id

  return (
    <div>
      <div className="border-l-4 border-orange-500 pl-4 mb-6">
        <h2 className="text-2xl font-black text-gray-800 uppercase">Selección de Horario</h2>
        <p className="text-gray-500 text-sm">Disponibilidad en tiempo real para taller sucursal central.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Calendario fechaSeleccionada={fecha} onSeleccionar={onFecha} />
        <SelectorHorario fecha={fecha} servicioId={servicioId} horaSeleccionada={hora} onSeleccionar={onHora} />
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-500 font-bold uppercase text-sm hover:text-gray-800 transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={onContinuar}
          disabled={!fecha || !hora}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black px-10 py-3 rounded-lg uppercase text-sm tracking-wider transition-colors"
        >
          Continuar al Paso 2 →
        </button>
      </div>
    </div>
  )
}
