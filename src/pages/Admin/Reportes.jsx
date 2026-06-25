import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  obtenerReporteDashboard,
  obtenerReporteIngresos,
  obtenerReporteServicios,
  obtenerReporteTecnicos,
} from '../../services/adminService'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import {
  Calendar, Users, Wrench, TrendingUp, Loader2,
  Download, ChevronDown, DollarSign, Star, UserCheck,
} from 'lucide-react'
import * as XLSX from 'xlsx'

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  PointElement, LineElement, Filler,
)

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtPeso(n) {
  if (n == null) return '$0'
  return '$' + Number(n).toLocaleString('es-CL')
}
function labelMes(periodo) {
  if (!periodo) return ''
  const [y, m] = periodo.split('-')
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${meses[parseInt(m, 10) - 1]} ${y}`
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color = 'text-white', small }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">{label}</p>
        <p className={`font-black mt-0.5 truncate ${color} ${small ? 'text-xl' : 'text-3xl'}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ── Chart base opts ───────────────────────────────────────────────────────────
const BASE = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#9CA3AF', font: { size: 12, weight: 'bold' } } },
    tooltip: {
      backgroundColor: '#111827', borderColor: '#374151', borderWidth: 1,
      titleColor: '#F9FAFB', bodyColor: '#9CA3AF',
    },
  },
}

// ── Selector de rango ─────────────────────────────────────────────────────────
const RANGOS = [
  { label: 'Últimos 6 meses', meses: 6 },
  { label: 'Últimos 12 meses', meses: 12 },
  { label: 'Este año', meses: 0 },
]

function rangoFechas(meses) {
  const hoy = new Date()
  if (meses === 0) {
    return {
      desde: `${hoy.getFullYear()}-01-01`,
      hasta: `${hoy.getFullYear()}-12-31`,
    }
  }
  const desde = new Date(hoy)
  desde.setMonth(desde.getMonth() - (meses - 1))
  desde.setDate(1)
  return {
    desde: desde.toISOString().slice(0, 10),
    hasta: hoy.toISOString().slice(0, 10),
  }
}

// ── Excel export ──────────────────────────────────────────────────────────────
function exportarExcel({ kpis, ingresos, servicios, tecnicos, periodo }) {
  const wb = XLSX.utils.book_new()

  // Hoja 1: Resumen KPIs
  const wsKpi = XLSX.utils.aoa_to_sheet([
    ['Indicador', 'Valor'],
    ['OTs Activas', kpis.otActivas],
    ['OTs Completadas este mes', kpis.otCompletadasMes],
    ['Ingresos este mes', kpis.ingresosMes],
    ['Ingresos totales', kpis.ingresosTotal],
    ['Clientes totales', kpis.clientesTotales],
    ['Clientes nuevos este mes', kpis.clientesNuevosMes],
    ['Técnicos disponibles', kpis.tecnicosDisponibles],
    ['Servicio estrella', `${kpis.servicioTopNombre} (${kpis.servicioTopCount} veces)`],
  ])
  XLSX.utils.book_append_sheet(wb, wsKpi, 'KPIs')

  // Hoja 2: Ingresos por período
  const wsIng = XLSX.utils.aoa_to_sheet([
    ['Período', 'Ingresos ($)', 'OTs Completadas'],
    ...ingresos.map(r => [labelMes(r.periodo), r.totalIngresos, r.cantidadOT]),
  ])
  XLSX.utils.book_append_sheet(wb, wsIng, 'Ingresos')

  // Hoja 3: Servicios
  const wsSvc = XLSX.utils.aoa_to_sheet([
    ['Servicio', 'Solicitudes', 'Ingreso Generado ($)'],
    ...servicios.map(s => [s.nombreServicio, s.cantidadSolicitudes, s.ingresoGenerado]),
  ])
  XLSX.utils.book_append_sheet(wb, wsSvc, 'Servicios')

  // Hoja 4: Técnicos
  const wsTec = XLSX.utils.aoa_to_sheet([
    ['Técnico', 'OTs Completadas', 'OTs Activas', 'Ingreso Generado ($)'],
    ...tecnicos.map(t => [t.nombreTecnico, t.otCompletadas, t.otActivas, t.ingresoGenerado]),
  ])
  XLSX.utils.book_append_sheet(wb, wsTec, 'Técnicos')

  const fecha = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `reporte-taller-${periodo}-${fecha}.xlsx`)
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Reportes() {
  const [kpis,      setKpis]      = useState(null)
  const [ingresos,  setIngresos]  = useState([])
  const [servicios, setServicios] = useState([])
  const [tecnicos,  setTecnicos]  = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const [rangoIdx,  setRangoIdx]  = useState(1)
  const [showRango, setShowRango] = useState(false)
  const [exportando, setExportando] = useState(false)

  const cargarDatos = useCallback((idx) => {
    setCargando(true)
    setError(null)
    const { desde, hasta } = rangoFechas(RANGOS[idx].meses)
    const params = { desde, hasta }

    Promise.all([
      obtenerReporteDashboard(),
      obtenerReporteIngresos(params),
      obtenerReporteServicios(params),
      obtenerReporteTecnicos(),
    ])
      .then(([r1, r2, r3, r4]) => {
        setKpis(r1.data)
        setIngresos(r2.data)
        setServicios(r3.data)
        setTecnicos(r4.data)
      })
      .catch(() => setError('No se pudo cargar la información'))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargarDatos(rangoIdx) }, [rangoIdx, cargarDatos])

  const handleExportar = () => {
    setExportando(true)
    try {
      exportarExcel({
        kpis, ingresos, servicios, tecnicos,
        periodo: RANGOS[rangoIdx].label.toLowerCase().replace(/ /g, '-'),
      })
    } finally {
      setExportando(false)
    }
  }

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

  // ── Gráfico de ingresos (línea) ───────────────────────────────────────────
  const ingresosLineData = {
    labels: ingresos.map(r => labelMes(r.periodo)),
    datasets: [{
      label: 'Ingresos ($)',
      data: ingresos.map(r => r.totalIngresos ?? 0),
      borderColor: '#F97316',
      backgroundColor: 'rgba(249,115,22,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#F97316',
      pointRadius: 4,
    }],
  }
  const ingresosLineOpts = {
    ...BASE,
    plugins: { ...BASE.plugins, legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6B7280' }, grid: { color: '#1F2937' } },
      y: {
        ticks: { color: '#6B7280', callback: v => '$' + Number(v).toLocaleString('es-CL') },
        grid: { color: '#1F2937' },
      },
    },
  }

  // ── Gráfico OTs por mes (barras) ──────────────────────────────────────────
  const otBarData = {
    labels: ingresos.map(r => labelMes(r.periodo)),
    datasets: [{
      label: 'OTs completadas',
      data: ingresos.map(r => r.cantidadOT),
      backgroundColor: '#F97316',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }
  const otBarOpts = {
    ...BASE,
    plugins: { ...BASE.plugins, legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6B7280' }, grid: { color: '#1F2937' } },
      y: { ticks: { color: '#6B7280', stepSize: 1 }, grid: { color: '#1F2937' } },
    },
  }

  // ── Gráfico servicios (barras horizontales) ───────────────────────────────
  const top7 = servicios.slice(0, 7)
  const svcBarData = {
    labels: top7.map(s => s.nombreServicio),
    datasets: [{
      label: 'Solicitudes',
      data: top7.map(s => s.cantidadSolicitudes),
      backgroundColor: '#F97316',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }
  const svcBarOpts = {
    ...BASE, indexAxis: 'y',
    plugins: { ...BASE.plugins, legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6B7280', stepSize: 1 }, grid: { color: '#1F2937' } },
      y: { ticks: { color: '#D1D5DB', font: { size: 12 } }, grid: { display: false } },
    },
  }

  // ── Gráfico dona — servicios por ingreso ──────────────────────────────────
  const COLORES = ['#F97316','#3B82F6','#22C55E','#EF4444','#A855F7','#EAB308','#6B7280']
  const top5Svc = servicios.slice(0, 5)
  const donutData = {
    labels: top5Svc.map(s => s.nombreServicio),
    datasets: [{
      data: top5Svc.map(s => s.ingresoGenerado ?? 0),
      backgroundColor: COLORES.slice(0, top5Svc.length),
      borderColor: '#111827',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }
  const totalIngreso = top5Svc.reduce((a, s) => a + (s.ingresoGenerado ?? 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Reportes</h2>
            <p className="text-gray-500 text-sm mt-0.5">Indicadores y métricas del taller</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Selector de rango */}
            <div className="relative">
              <button
                onClick={() => setShowRango(!showRango)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-colors"
              >
                {RANGOS[rangoIdx].label}
                <ChevronDown size={14} />
              </button>
              {showRango && (
                <div className="absolute right-0 mt-1 w-48 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden z-20 shadow-xl">
                  {RANGOS.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { setRangoIdx(i); setShowRango(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        i === rangoIdx ? 'text-orange-400 bg-orange-500/10' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Botón exportar Excel */}
            <button
              onClick={handleExportar}
              disabled={exportando}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-colors"
            >
              <Download size={15} />
              {exportando ? 'Generando...' : 'Exportar Excel'}
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<TrendingUp size={20} />}
            label="Ingresos este mes"
            value={fmtPeso(kpis?.ingresosMes)}
            sub={`Total: ${fmtPeso(kpis?.ingresosTotal)}`}
            color="text-orange-400"
            small
          />
          <KpiCard
            icon={<Wrench size={20} />}
            label="OTs completadas (mes)"
            value={kpis?.otCompletadasMes}
            sub={`${kpis?.otActivas ?? 0} activas ahora`}
            color="text-green-400"
          />
          <KpiCard
            icon={<Users size={20} />}
            label="Clientes totales"
            value={kpis?.clientesTotales}
            sub={`+${kpis?.clientesNuevosMes ?? 0} nuevos este mes`}
            color="text-blue-400"
          />
          <KpiCard
            icon={<Star size={20} />}
            label="Servicio estrella"
            value={kpis?.servicioTopNombre}
            sub={`${kpis?.servicioTopCount ?? 0} solicitudes`}
            color="text-yellow-400"
            small
          />
        </div>

        {/* Gráficos: ingresos + OTs por mes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5">
              Ingresos por mes
            </p>
            {ingresos.length > 0
              ? <Line data={ingresosLineData} options={ingresosLineOpts} />
              : <p className="text-gray-600 text-sm text-center py-8">Sin datos disponibles</p>
            }
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5">
              OTs completadas por mes
            </p>
            {ingresos.length > 0
              ? <Bar data={otBarData} options={otBarOpts} />
              : <p className="text-gray-600 text-sm text-center py-8">Sin datos disponibles</p>
            }
          </div>
        </div>

        {/* Gráficos: servicios top + dona ingresos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5">
              Servicios más solicitados
            </p>
            {top7.length > 0
              ? <Bar data={svcBarData} options={svcBarOpts} />
              : <p className="text-gray-600 text-sm text-center py-8">Sin datos disponibles</p>
            }
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Ingresos por servicio</p>
                <p className="text-2xl font-black text-white mt-0.5">
                  {fmtPeso(totalIngreso)} <span className="text-sm text-gray-500 font-normal">top 5</span>
                </p>
              </div>
              <DollarSign size={18} className="text-orange-400" />
            </div>
            {top5Svc.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-36 h-36 flex-shrink-0">
                  <Doughnut data={donutData} options={{ ...BASE, cutout: '65%' }} />
                </div>
                <div className="flex-1 space-y-2">
                  {top5Svc.map((s, i) => (
                    <div key={s.nombreServicio} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORES[i] }} />
                        <span className="text-xs text-gray-400 truncate">{s.nombreServicio}</span>
                      </div>
                      <span className="text-xs font-black text-white ml-2 flex-shrink-0">
                        {fmtPeso(s.ingresoGenerado)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Tabla productividad técnicos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
            <UserCheck size={16} className="text-orange-400" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Productividad de técnicos</p>
          </div>
          {tecnicos.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  {['Técnico', 'OTs completadas', 'OTs activas', 'Ingreso generado'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {tecnicos.map((t, i) => (
                  <tr key={t.nombreTecnico} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Star size={12} className="text-yellow-400" />}
                        {t.nombreTecnico}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-black text-green-400">{t.otCompletadas}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-orange-400">{t.otActivas}</span>
                    </td>
                    <td className="px-5 py-3 font-bold text-white">{fmtPeso(t.ingresoGenerado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-sm text-center py-10">Sin datos de técnicos</p>
          )}
        </div>

        {/* Tabla detalle servicios */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
            <Wrench size={16} className="text-orange-400" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Detalle de servicios — {RANGOS[rangoIdx].label}</p>
          </div>
          {servicios.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  {['Servicio', 'Solicitudes', 'Ingreso generado', 'Promedio por OT'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {servicios.map((s, i) => (
                  <tr key={s.nombreServicio} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-white font-medium flex items-center gap-2">
                      {i < 3 && (
                        <span className={`text-xs font-black ${i===0?'text-yellow-400':i===1?'text-gray-400':'text-orange-700'}`}>
                          #{i+1}
                        </span>
                      )}
                      {s.nombreServicio}
                    </td>
                    <td className="px-5 py-3 text-gray-300 font-bold">{s.cantidadSolicitudes}</td>
                    <td className="px-5 py-3 text-white font-bold">{fmtPeso(s.ingresoGenerado)}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {s.cantidadSolicitudes > 0
                        ? fmtPeso(Math.round((s.ingresoGenerado ?? 0) / s.cantidadSolicitudes))
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-sm text-center py-10">Sin datos de servicios</p>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}