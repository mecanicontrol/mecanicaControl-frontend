import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { CalendarDays, Users, Wrench, Clock } from 'lucide-react'
import { obtenerDashboard } from '../../services/adminService'
import AdminLayout from '../../components/admin/AdminLayout'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const ESTADO_COLOR = {
  PENDIENTE:  'bg-yellow-500/20 text-yellow-400',
  CONFIRMADO: 'bg-blue-500/20 text-blue-400',
  EN_PROCESO: 'bg-orange-500/20 text-orange-400',
  COMPLETADO: 'bg-green-500/20 text-green-400',
  CANCELADO:  'bg-red-500/20 text-red-400',
}

function KpiCard({ icon: Icon, label, value, color = 'text-orange-500' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-3xl font-black text-white mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }) {
  const cls = ESTADO_COLOR[estado] ?? 'bg-gray-700 text-gray-300'
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{estado}</span>
  )
}

function formatFecha(str) {
  if (!str) return '—'
  const d = new Date(str.includes('Z') || str.includes('+') ? str : str + 'Z')
  if (isNaN(d.getTime())) return str
  return d.toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Dashboard() {
  const [datos, setDatos]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    obtenerDashboard()
      .then(({ data }) => setDatos(data))
      .catch(() => setError('No se pudo cargar el dashboard.'))
      .finally(() => setCargando(false))
  }, [])

  const barData = datos ? {
    labels: Object.keys(datos.agendamientosPorEstado),
    datasets: [{
      label: 'Agendamientos',
      data: Object.values(datos.agendamientosPorEstado),
      backgroundColor: ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null

  const donutData = datos?.serviciosMasSolicitados?.length ? {
    labels: datos.serviciosMasSolicitados.map(s => s.nombre),
    datasets: [{
      data: datos.serviciosMasSolicitados.map(s => s.conteo),
      backgroundColor: ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7'],
      borderWidth: 0,
    }],
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9ca3af', font: { size: 11 } } },
    },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
      y: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
    },
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 }, padding: 12 } },
    },
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">Resumen operacional del taller</p>
        </div>

        {cargando && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-800 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {datos && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={CalendarDays} label="Agendamientos hoy"      value={datos.agendamientosHoy}       color="text-orange-500" />
              <KpiCard icon={Clock}        label="Agendamientos pendientes" value={datos.agendamientosPendientes} color="text-yellow-500" />
              <KpiCard icon={Wrench}       label="Técnicos disponibles"    value={datos.tecnicosDisponibles}    color="text-green-500"  />
              <KpiCard icon={Users}        label="Total clientes"          value={datos.totalClientes}          color="text-blue-500"   />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Bar chart — agendamientos por estado */}
              <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-4">Agendamientos por estado</p>
                {barData ? (
                  <div className="h-52">
                    <Bar data={barData} options={chartOptions} />
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm text-center py-10">Sin datos</p>
                )}
              </div>

              {/* Donut — servicios más solicitados */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-4">Top servicios solicitados</p>
                {donutData ? (
                  <div className="h-52">
                    <Doughnut data={donutData} options={donutOptions} />
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm text-center py-10">Sin datos</p>
                )}
              </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Últimos agendamientos */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-4">Últimos agendamientos</p>
                {datos.ultimosAgendamientos.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-6">Sin datos</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-600 uppercase border-b border-gray-800">
                        <th className="pb-2 font-bold">Cliente</th>
                        <th className="pb-2 font-bold">Servicio</th>
                        <th className="pb-2 font-bold">Patente</th>
                        <th className="pb-2 font-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {datos.ultimosAgendamientos.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="py-2.5 text-gray-300 font-medium">{a.clienteNombre || '—'}</td>
                          <td className="py-2.5 text-gray-400 text-xs">{a.servicioNombre}</td>
                          <td className="py-2.5 text-gray-400 font-mono text-xs">{a.vehiculoPatente}</td>
                          <td className="py-2.5"><EstadoBadge estado={a.estado} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Próximos hoy */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-4">Próximos hoy</p>
                {datos.proximosHoy.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-6">No hay agendamientos próximos hoy</p>
                ) : (
                  <div className="space-y-2">
                    {datos.proximosHoy.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                        <div className="w-1 self-stretch rounded-full bg-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{a.clienteNombre || 'Sin cliente'}</p>
                          <p className="text-xs text-gray-400 truncate">{a.servicioNombre} · {a.vehiculoPatente}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-orange-400 font-bold">{formatFecha(a.fechaInicio).split(',')[1]?.trim() ?? '—'}</p>
                          <EstadoBadge estado={a.estado} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
