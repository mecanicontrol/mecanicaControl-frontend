import { useState } from 'react'

const DIAS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Calendario({ fechaSeleccionada, onSeleccionar }) {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())

  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const primerDia = new Date(anio, mes, 1).getDay()
  const offset = primerDia === 0 ? 6 : primerDia - 1

  const dias = []
  for (let i = 0; i < offset; i++) dias.push(null)
  for (let i = 1; i <= diasEnMes; i++) dias.push(i)

  const esHoy = (dia) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()

  const esSeleccionado = (dia) => {
    if (!fechaSeleccionada || !dia) return false
    const f = new Date(fechaSeleccionada)
    return dia === f.getDate() && mes === f.getMonth() && anio === f.getFullYear()
  }

  const esPasado = (dia) => {
    if (!dia) return false
    return new Date(anio, mes, dia) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  }

  const anteriorMes = () => mes === 0 ? (setMes(11), setAnio(anio - 1)) : setMes(mes - 1)
  const siguienteMes = () => mes === 11 ? (setMes(0), setAnio(anio + 1)) : setMes(mes + 1)

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wide">
          {MESES[mes]} {anio}
        </h3>
        <div className="flex gap-1">
          <button onClick={anteriorMes} className="px-2 py-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100">‹</button>
          <button onClick={siguienteMes} className="px-2 py-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DIAS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-bold py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {dias.map((dia, i) => (
          <button
            key={i}
            onClick={() => dia && !esPasado(dia) && onSeleccionar(new Date(anio, mes, dia))}
            disabled={!dia || esPasado(dia)}
            className={`relative h-9 w-full rounded text-sm font-medium transition-colors
              ${!dia ? '' :
                esSeleccionado(dia) ? 'bg-orange-500 text-white font-bold' :
                esHoy(dia) ? 'border-2 border-orange-400 text-gray-800' :
                esPasado(dia) ? 'text-gray-300 cursor-not-allowed' :
                'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {dia}
            {esHoy(dia) && !esSeleccionado(dia) && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500 rounded-full" /> Seleccionado</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 border border-orange-400 rounded-full" /> Hoy</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-gray-200 rounded-full" /> Ocupado</span>
      </div>
    </div>
  )
}
