import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { obtenerServicios } from '../services/serviciosCatalogoService'
import { obtenerMarcas, obtenerModelos } from '../services/marcasService'
import {
  Wrench, ShieldCheck, Clock, Star, Phone, MapPin,
  CheckCircle, ArrowRight, CalendarCheck, Zap, Award,
} from 'lucide-react'

/* ─── imágenes de respaldo rotativas (el backend no almacena imágenes) */
const IMGS = [
  'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=600&auto=format&fit=crop',
  'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&auto=format&fit=crop',
]

const RAZONES = [
  {
    icon: Award,
    titulo: '+15 años de experiencia',
    desc: 'Técnicos certificados con experiencia en todas las marcas del mercado chileno.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Garantía en todos los trabajos',
    desc: 'Cada servicio tiene garantía escrita. Usamos repuestos originales o de primera línea.',
  },
  {
    icon: Clock,
    titulo: 'Entrega en el tiempo acordado',
    desc: 'Cumplimos los plazos prometidos. Si no, te avisamos antes con tiempo de sobra.',
  },
  {
    icon: Zap,
    titulo: 'Diagnóstico gratuito',
    desc: 'Traes tu auto, lo revisamos y te damos un presupuesto sin costo y sin compromiso.',
  },
]

const TESTIMONIOS = [
  {
    nombre: 'Ricardo Valdés',
    estrellas: 5,
    texto: 'La transparencia en el presupuesto fue lo que más me gustó. Me enviaron fotos de las piezas desgastadas antes de cambiarlas. Muy profesionales.',
  },
  {
    nombre: 'Camila Soto',
    estrellas: 5,
    texto: 'Excelente servicio de post-venta. Tuve un pequeño ruido después del cambio de frenos y lo solucionaron de inmediato sin costo extra.',
  },
  {
    nombre: 'Andrés Mendoza',
    estrellas: 5,
    texto: 'El mejor taller de Santiago. Uso su sistema de agendamiento en línea y siempre me confirman exactamente en qué etapa está mi camioneta.',
  },
]


/* ─── HOME ───────────────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate()

  // cotizador rápido
  const [marcaId, setMarcaId]   = useState('')
  const [modeloId, setModeloId] = useState('')
  const [marcas, setMarcas]     = useState([])
  const [modelos, setModelos]   = useState([])

  // servicios del home
  const [servicios, setServicios]               = useState([])
  const [cargandoServicios, setCargandoServicios] = useState(true)

  useEffect(() => {
    obtenerMarcas().then(({ data }) => setMarcas(data)).catch(() => {})
    obtenerServicios()
      .then(({ data }) => setServicios(data))
      .catch(() => {})
      .finally(() => setCargandoServicios(false))
  }, [])

  useEffect(() => {
    if (!marcaId) { setModelos([]); setModeloId(''); return }
    obtenerModelos(marcaId).then(({ data }) => setModelos(data)).catch(() => setModelos([]))
  }, [marcaId])

  const handleMarca = (e) => {
    setMarcaId(e.target.value)
    setModeloId('')
  }

  return (
    <div className="bg-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1600&auto=format&fit=crop&q=90')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">

          {/* texto */}
          <div>
            <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-6 h-px bg-orange-400" />
              Ingeniería automotriz de precisión
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              TU VEHÍCULO<br />
              EN <span className="text-orange-500">MANOS</span><br />
              EXPERTAS
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
              Mantenimiento preventivo y correctivo con los más altos
              estándares de calidad. Tecnología de diagnóstico avanzada
              para un rendimiento impecable.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/agendar"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black px-7 py-3.5 rounded-lg transition-colors uppercase tracking-wider text-sm"
              >
                <CalendarCheck size={16} /> Agendar ahora
              </Link>
              <Link
                to="/servicios"
                className="flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-bold px-7 py-3.5 rounded-lg transition-colors text-sm"
              >
                Ver servicios <ArrowRight size={15} />
              </Link>
            </div>

            {/* stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { val: '+15', label: 'Años de experiencia' },
                { val: '+2.000', label: 'Clientes atendidos' },
                { val: '100%', label: 'Garantía en trabajos' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-orange-500">{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* cotizador rápido */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-gray-900 font-black text-xl uppercase mb-1 tracking-wide">Cotizador rápido</h2>
            <p className="text-gray-400 text-xs mb-6">Ingresa los datos y recibe una estimación al instante</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Marca</label>
                  <select
                    value={marcaId}
                    onChange={handleMarca}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400"
                  >
                    <option value="">Selecciona</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Modelo</label>
                  <select
                    value={modeloId}
                    onChange={e => setModeloId(e.target.value)}
                    disabled={!marcaId || modelos.length === 0}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{marcaId && modelos.length === 0 ? 'Cargando...' : 'Selecciona'}</option>
                    {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  const marcaObj  = marcas.find(m => m.id === marcaId)
                  const modeloObj = modelos.find(m => m.id === modeloId)
                  navigate('/cotizador', {
                    state: {
                      vehiculo: {
                        marcaId:  marcaId  || '',
                        marca:    marcaObj?.nombre  || '',
                        modeloId: modeloId || '',
                        modelo:   modeloObj?.nombre || '',
                        anio: '', kilometraje: '', patente: '',
                      }
                    }
                  })
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-lg uppercase tracking-wider text-sm transition-colors"
              >
                Obtener estimación
              </button>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">o</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <button
                onClick={() => navigate('/cotizador')}
                className="w-full border-2 border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-500 font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={15} /> Diagnóstico con Inteligencia Artificial
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              * El precio final puede variar según diagnóstico en taller
            </p>
          </div>

        </div>
      </section>

      {/* ── BANDA DE MARCAS ───────────────────────────────────────── */}
      <section className="bg-gray-900 py-5 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mr-4">Atendemos todas las marcas:</span>
            {['Toyota','Hyundai','Nissan','Ford','Chevrolet','Kia','Mazda','Honda','Mitsubishi'].map(m => (
              <span key={m} className="text-gray-400 text-sm font-bold">{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS DESTACADOS ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="text-orange-500 text-xs font-black uppercase tracking-widest">Especialidades</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
                Nuestros servicios
              </h2>
            </div>
            <Link
              to="/servicios"
              className="hidden md:flex items-center gap-1.5 text-orange-500 font-black text-sm hover:underline uppercase tracking-wider"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {cargandoServicios ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 rounded w-1/2 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : servicios.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No hay servicios disponibles en este momento.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.slice(0, 6).map((s, i) => (
                <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={IMGS[i % IMGS.length]}
                      alt={s.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {s.categoria && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase">
                        {s.categoria}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-gray-900 text-base mb-2 uppercase">{s.nombre}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{s.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-gray-900">
                        ${s.precioBase?.toLocaleString('es-CL')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/cotizador')}
                          className="text-xs border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Cotizar
                        </button>
                        <button
                          onClick={() => navigate('/agendar')}
                          className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Agendar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/servicios" className="inline-flex items-center gap-2 text-orange-500 font-black text-sm uppercase tracking-wider">
              Ver todos los servicios <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* imagen */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&auto=format&fit=crop"
              alt="Taller mecánico"
              className="rounded-2xl w-full h-[460px] object-cover"
            />
            {/* badge flotante */}
            <div className="absolute -bottom-6 -right-6 bg-orange-500 rounded-2xl p-6 text-center shadow-xl">
              <p className="text-white font-black text-4xl">+15</p>
              <p className="text-orange-200 text-xs font-bold uppercase tracking-wider">Años de<br />excelencia</p>
            </div>
          </div>

          {/* texto */}
          <div>
            <span className="text-orange-500 text-xs font-black uppercase tracking-widest">El sello de calidad</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-3 mb-8">
              Por qué elegir<br />MecánicaHub
            </h2>
            <div className="space-y-6">
              {RAZONES.map(({ icon: Icon, titulo, desc }) => (
                <div key={titulo} className="flex gap-4">
                  <div className="w-11 h-11 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm mb-1">{titulo}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/agendar"
              className="inline-flex items-center gap-2 mt-10 bg-orange-500 hover:bg-orange-600 text-white font-black px-7 py-3.5 rounded-xl uppercase tracking-wider text-sm transition-colors"
            >
              Agendar una hora <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROCESO ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-xs font-black uppercase tracking-widest">Cómo funciona</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3">
              Agenda en 3 pasos simples
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', icon: CalendarCheck, title: 'Elige tu servicio', desc: 'Selecciona el servicio que necesitas o usa nuestro cotizador con IA para que te recomendemos según tus síntomas.' },
              { num: '2', icon: Clock, title: 'Reserva tu hora', desc: 'Elige el día y la hora que mejor te acomode. Disponibilidad en tiempo real, sin llamadas.' },
              { num: '3', icon: CheckCircle, title: 'Trae tu vehículo', desc: 'Llega al taller en el horario reservado. Te avisamos cuando esté listo y te enviamos el informe.' },
            ].map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200">
                  <Icon size={28} className="text-white" />
                </div>
                <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-black mx-auto -mt-2 mb-4 relative z-10">
                  {num}
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-xs font-black uppercase tracking-widest">Experiencias</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIOS.map(({ nombre, estrellas, texto }) => (
              <div key={nombre} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: estrellas }).map((_, i) => (
                    <Star key={i} size={15} className="text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{texto}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-500 font-black">{nombre[0]}</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-gray-800">{nombre}</p>
                    <p className="text-xs text-gray-400">Cliente verificado</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + CONTACTO ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
              ¿Tu auto te está dando problemas?<br />
              <span className="text-orange-500">Tráenoslo hoy.</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Diagnóstico gratuito sin compromiso. Te damos un presupuesto detallado
              antes de hacer cualquier trabajo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/agendar"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black px-7 py-3.5 rounded-xl transition-colors uppercase text-sm tracking-wider"
              >
                <CalendarCheck size={16} /> Agendar ahora
              </Link>
              <Link
                to="/cotizador"
                className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
              >
                Cotizar servicio
              </Link>
            </div>
          </div>

          {/* info de contacto */}
          <div className="bg-gray-800 rounded-2xl p-8 space-y-5 border border-gray-700">
            <h3 className="text-white font-black text-lg uppercase">¿Dónde encontrarnos?</h3>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Dirección</p>
                <p className="text-gray-400 text-sm mt-0.5">Av. Santa Rosa 1234, Santiago Centro</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Teléfono</p>
                <p className="text-gray-400 text-sm mt-0.5">+56 2 2345 6789</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Horarios</p>
                <p className="text-gray-400 text-sm mt-0.5">Lunes a Viernes: 8:30 – 18:30</p>
                <p className="text-gray-400 text-sm">Sábados: 9:00 – 14:00</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wrench size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Atendemos todas las marcas</p>
                <p className="text-gray-400 text-sm mt-0.5">Toyota, Hyundai, Kia, Nissan, Ford y más</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}