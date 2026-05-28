import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { obtenerDashboard } from '../../services/adminService'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Calendar, Users, Wrench, Clock, TrendingUp, Loader2 } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(fechaStr) {
  if (!fechaStr) return '—'
  return new Date(fechaStr).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

const ESTADO_BADGE = {
  PENDIENTE:  'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  CONFIRMADO: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  COMPLETADO: 'bg-green-500/15 text-green-400 border border-green-500/30',
  CANCELADO:  'bg-red-500/15 text-red-400 border border-red-500/30',
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-400">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-black mt-0.5 ${color}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Opciones base Chart.js ────────────────────────────────────────────────────
const CHART_OPTS_BASE = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#9CA3AF', font: { size: 12, weight: 'bold' } } },
    tooltip: {
      backgroundColor: '#111827',
      borderColor: '#374151',
      borderWidth: 1,
      titleColor: '#F9FAFB',
      bodyColor: '#9CA3AF',
    },
  },
}

export default function Reportes() {
  const [data, setData]       = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    obtenerDashboard()
      .then(({ data: d }) => setData(d))
      .catch(() => setError('No se pudo cargar la información'))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-3 text-gray-500 py-20 justify-center">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Cargando reportes...</span>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <p className="text-red-400 text-sm py-12 text-center">{error}</p>
      </AdminLayout>
    )
  }

  // ── Datos para gráficos ───────────────────────────────────────────────────
  const estadosLabels = Object.keys(data.agendamientosPorEstado || {})
  const estadosValues = Object.values(data.agendamientosPorEstado || {})
  const COLORES_ESTADO = ['#F97316', '#3B82F6', '#22C55E', '#EF4444', '#A855F7', '#6B7280']

  const donutData = {
    labels: estadosLabels,
    datasets: [{
      data: estadosValues,
      backgroundColor: COLORES_ESTADO.slice(0, estadosLabels.length),
      borderColor: '#111827',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }

  const servicios = data.serviciosMasSolicitados || []
  const barData = {
    labels: servicios.map(s => s.nombre),
    datasets: [{
      label: 'Agendamientos',
      data: servicios.map(s => s.conteo),
      backgroundColor: '#F97316',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }
  const barOpts = {
    ...CHART_OPTS_BASE,
    indexAxis: 'y',
    plugins: {
      ...CHART_OPTS_BASE.plugins,
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#6B7280', stepSize: 1 },
        grid:  { color: '#1F2937' },
      },
      y: {
        ticks: { color: '#D1D5DB', font: { size: 12 } },
        grid:  { display: false },
      },
    },
  }

  const totalAgendamientos = estadosValues.reduce((a, b) => a + b, 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Reportes</h2>
          <p className="text-gray-500 text-sm mt-0.5">Indicadores y métricas del taller</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Calendar size={20} />}
            label="Agendamientos hoy"
            value={data.agendamientosHoy}
            sub="Citas programadas para hoy"
            color="text-orange-400"
          />
          <KpiCard
            icon={<Clock size={20} />}
            label="Pendientes"
            value={data.agendamientosPendientes}
            sub="Esperando confirmación"
            color="text-yellow-400"
          />
          <KpiCard
            icon={<Wrench size={20} />}
            label="Técnicos disponibles"
            value={data.tecnicosDisponibles}
            sub="Activos en el sistema"
            color="text-green-400"
          />
          <KpiCard
            icon={<Users size={20} />}
            label="Total clientes"
            value={data.totalClientes}
            sub="Registrados en el sistema"
            color="text-blue-400"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Donut — estados */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Agendamientos por estado</p>
                <p className="text-2xl font-black text-white mt-0.5">{totalAgendamientos} <span className="text-sm text-gray-500 font-normal">total</span></p>
              </div>
              <TrendingUp size={18} className="text-orange-400" />
            </div>
            {estadosLabels.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-40 h-40 flex-shrink-0">
                  <Doughnut data={donutData} options={{ ...CHART_OPTS_BASE, cutout: '65%' }} />
                </div>
                <div className="flex-1 space-y-2">
                  {estadosLabels.map((est, i) => (
                    <div key={est} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORES_ESTADO[i] }} />
                        <span className="text-xs text-gray-400">{est}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-white">{estadosValues[i]}</span>
                        <span className="text-xs text-gray-600 ml-1">
                          ({totalAgendamientos > 0 ? Math.round((estadosValues[i] / totalAgendamientos) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">Sin datos disponibles</p>
            )}
          </div>

          {/* Barras — servicios más solicitados */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">
              Servicios más solicitados
            </p>
            {servicios.length > 0 ? (
              <Bar data={barData} options={barOpts} />
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Tabla — próximos agendamientos de hoy */}
        {data.proximosHoy?.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Próximos hoy</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  {['Cliente', 'Servicio', 'Patente', 'Hora', 'Estado'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {data.proximosHoy.map(ag => (
                  <tr key={ag.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{ag.clienteNombre || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 max-w-[160px] truncate">{ag.servicioNombre}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{ag.vehiculoPatente}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{fmt(ag.fechaInicio)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ESTADO_BADGE[ag.estado] || 'bg-gray-700 text-gray-400'}`}>
                        {ag.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla — últimos agendamientos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Últimos agendamientos</p>
          </div>
          {data.ultimosAgendamientos?.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  {['Cliente', 'Servicio', 'Patente', 'Fecha', 'Estado'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {data.ultimosAgendamientos.map(ag => (
                  <tr key={ag.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{ag.clienteNombre || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 max-w-[160px] truncate">{ag.servicioNombre}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{ag.vehiculoPatente}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{fmt(ag.fechaInicio)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ESTADO_BADGE[ag.estado] || 'bg-gray-700 text-gray-400'}`}>
                        {ag.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-sm text-center py-10">Sin agendamientos recientes</p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}