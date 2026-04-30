import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MARCAS = ['Toyota', 'Hyundai', 'Chevrolet', 'Kia', 'Nissan', 'Ford', 'Mazda', 'Honda', 'Otro']

const SERVICIOS = [
  'Mantención 5.000 km',
  'Mantención 10.000 km',
  'Diagnóstico computarizado',
  'Cambio de frenos',
  'Alineación y balanceo',
  'Cambio de batería',
  'Revisión suspensión',
]

export default function HeroSection() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ marca: '', modelo: '', servicio: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/cotizador?${new URLSearchParams(form).toString()}`)
  }

  return (
    <section className="bg-gray-800 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        <div>
          <h1 className="text-4xl font-bold mb-4">
            Tu vehículo en manos expertas
          </h1>
          <p className="text-gray-300 mb-6">
            Mantenimiento y reparación automotriz con garantía incluida. Atendemos todas las marcas.
          </p>
          <div className="flex gap-3">
            <a href="/agendar" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold">
              Agendar ahora
            </a>
            <a href="/servicios" className="border border-white px-6 py-2 rounded hover:bg-white hover:text-gray-900">
              Ver servicios
            </a>
          </div>

          <div className="flex gap-8 mt-10 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-400">+15</div>
              <div className="text-xs text-gray-400">Años de experiencia</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">+500</div>
              <div className="text-xs text-gray-400">Clientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">100%</div>
              <div className="text-xs text-gray-400">Garantía</div>
            </div>
          </div>
        </div>

        <div className="bg-white text-gray-800 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Cotizador rápido</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <select
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar</option>
                  {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={form.modelo}
                  onChange={handleChange}
                  placeholder="Ej. Rav4"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Servicio</label>
              <select
                name="servicio"
                value={form.servicio}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Seleccionar servicio</option>
                {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded"
            >
              Obtener estimación
            </button>
            <p className="text-xs text-gray-400 text-center">* Precio puede variar según diagnóstico</p>
          </form>
        </div>

      </div>
    </section>
  )
}
