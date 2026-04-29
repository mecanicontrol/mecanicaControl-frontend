const PASOS = [
  { numero: 1, label: 'Agenda'    },
  { numero: 2, label: 'Confirmar' },
  { numero: 3, label: 'Pago'      },
]

export default function BarraProgreso({ paso = 1 }) {
  return (
    <div className="flex items-center justify-center py-8 px-6">
      {PASOS.map((p, i) => (
        <div key={p.numero} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded flex items-center justify-center font-black text-sm
              ${paso >= p.numero ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {p.numero}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider
              ${paso >= p.numero ? 'text-orange-500' : 'text-gray-400'}`}
            >
              {p.label}
            </span>
          </div>
          {i < PASOS.length - 1 && (
            <div className={`w-32 h-0.5 mx-2 mb-5 ${paso > p.numero ? 'bg-orange-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
