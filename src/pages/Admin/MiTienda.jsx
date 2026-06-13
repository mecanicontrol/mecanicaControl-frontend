import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  Save, Store, MapPin, Phone, Mail, Clock, Share2,
  Link2, Globe, Image, Eye, EyeOff,
  AlignLeft, Palette, ExternalLink, Check, ChevronDown, ChevronUp
} from 'lucide-react'
import * as svc from '../../services/adminConfiguracionService'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const DEFAULTS = {
  identidad: {
    nombreTaller: '',
    slogan: '',
    logoUrl: '',
    descripcion: '',
  },
  contacto: {
    direccion: '',
    telefono: '',
    whatsapp: '',
    email: '',
    mapsUrl: '',
  },
  redes: {
    facebook: '',
    instagram: '',
    youtube: '',
    sitioWeb: '',
  },
  horario: {
    diasActivos: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    apertura: '08:00',
    cierre: '18:00',
  },
  apariencia: {
    heroTitulo: 'Bienvenido a nuestro taller',
    heroSubtitulo: 'Calidad y confianza para tu vehículo',
    heroImagenUrl: '',
    tiendasNombre: 'Tienda',
  },
  secciones: {
    mostrarTienda: true,
    mostrarCotizador: true,
    mostrarBlog: false,
    mostrarSeguimiento: true,
  },
}

const LS_KEY = 'mecani_mi_tienda'

function cargarDesdeLS() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? 'bg-orange-500' : 'bg-gray-600'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Section({ icon: Icon, titulo, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 border-b border-gray-700 flex items-center gap-3 hover:bg-gray-750 transition-colors"
      >
        <Icon size={18} className="text-orange-500 flex-shrink-0" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wide flex-1 text-left">{titulo}</h3>
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  )
}

function Campo({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs text-gray-400 font-semibold block mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
    </div>
  )
}

function Input({ icon: Icon, ...props }) {
  const base = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors'
  if (!Icon) return <input className={base} {...props} />
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input className={`${base} pl-9`} {...props} />
    </div>
  )
}

export default function MiTienda() {
  const [config, setConfig] = useState(DEFAULTS)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const local = cargarDesdeLS()
    if (local) {
      setConfig(prev => deepMerge(prev, local))
      setCargando(false)
      return
    }
    svc.obtenerConfiguracion()
      .then(({ data }) => {
        if (data?.miTienda) {
          setConfig(prev => deepMerge(prev, data.miTienda))
        } else if (data?.taller) {
          setConfig(prev => ({
            ...prev,
            identidad: { ...prev.identidad, nombreTaller: data.taller.nombre || '' },
            contacto: {
              ...prev.contacto,
              direccion: data.taller.direccion || '',
              telefono:  data.taller.telefono  || '',
              email:     data.taller.email     || '',
            },
            horario: {
              ...prev.horario,
              apertura: data.taller.horaApertura || '08:00',
              cierre:   data.taller.horaCierre   || '18:00',
            },
          }))
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  const set = (seccion, campo, valor) =>
    setConfig(prev => ({ ...prev, [seccion]: { ...prev[seccion], [campo]: valor } }))

  const toggleDia = (dia) => {
    const actual = config.horario.diasActivos
    const nuevo = actual.includes(dia) ? actual.filter(d => d !== dia) : [...actual, dia]
    set('horario', 'diasActivos', nuevo)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(config))
      const cfg = await svc.obtenerConfiguracion().then(r => r.data).catch(() => ({}))
      await svc.actualizarConfiguracion({
        ...cfg,
        miTienda: config,
        taller: {
          ...(cfg.taller || {}),
          nombre:       config.identidad.nombreTaller,
          direccion:    config.contacto.direccion,
          telefono:     config.contacto.telefono,
          email:        config.contacto.email,
          horaApertura: config.horario.apertura,
          horaCierre:   config.horario.cierre,
        },
      })
      setMensaje('Tienda actualizada correctamente')
      setTimeout(() => setMensaje(null), 4000)
    } catch {
      localStorage.setItem(LS_KEY, JSON.stringify(config))
      setMensaje('Guardado localmente (sin conexión al servidor)')
      setTimeout(() => setMensaje(null), 4000)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Mi Tienda</h2>
          <p className="text-gray-500 animate-pulse">Cargando configuración...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Mi Tienda</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Personaliza cómo aparece tu taller ante los clientes
            </p>
          </div>
          <a
            href="/tienda"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-orange-500 rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink size={14} />
            Ver tienda pública
          </a>
        </div>

        {mensaje && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30">
            <Check size={15} />
            {mensaje}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={guardar} className="space-y-4">

          {/* IDENTIDAD */}
          <Section icon={Store} titulo="Identidad del taller">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Nombre del taller" hint="Aparece en el encabezado y en el footer del sitio">
                <Input value={config.identidad.nombreTaller} onChange={e => set('identidad', 'nombreTaller', e.target.value)} placeholder="Ej: Taller AutoMaestro" />
              </Campo>
              <Campo label="Slogan" hint="Frase breve bajo el nombre">
                <Input value={config.identidad.slogan} onChange={e => set('identidad', 'slogan', e.target.value)} placeholder="Ej: Tu auto en las mejores manos" />
              </Campo>
              <Campo label="URL del logotipo" hint="Link directo a la imagen del logo (PNG/SVG recomendado)">
                <Input icon={Image} value={config.identidad.logoUrl} onChange={e => set('identidad', 'logoUrl', e.target.value)} placeholder="https://..." />
              </Campo>
              <Campo label="Descripción del taller" hint="Aparece en la sección Quiénes somos y en buscadores">
                <textarea
                  value={config.identidad.descripcion}
                  onChange={e => set('identidad', 'descripcion', e.target.value)}
                  rows={3}
                  placeholder="Breve descripción de tu taller..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </Campo>
            </div>
          </Section>

          {/* CONTACTO */}
          <Section icon={MapPin} titulo="Contacto y ubicación">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Dirección">
                <Input icon={MapPin} value={config.contacto.direccion} onChange={e => set('contacto', 'direccion', e.target.value)} placeholder="Av. Ejemplo 1234, Santiago" />
              </Campo>
              <Campo label="Teléfono">
                <Input icon={Phone} value={config.contacto.telefono} onChange={e => set('contacto', 'telefono', e.target.value)} placeholder="+56 2 1234 5678" />
              </Campo>
              <Campo label="WhatsApp" hint="Número con código de país, sin espacios ni guiones">
                <Input icon={Phone} value={config.contacto.whatsapp} onChange={e => set('contacto', 'whatsapp', e.target.value)} placeholder="56912345678" />
              </Campo>
              <Campo label="Email de contacto">
                <Input icon={Mail} value={config.contacto.email} onChange={e => set('contacto', 'email', e.target.value)} type="email" placeholder="contacto@mitaller.cl" />
              </Campo>
              <div className="md:col-span-2">
                <Campo label="URL de Google Maps embed" hint="Ir a Google Maps → Compartir → Insertar mapa → copiar solo la URL del iframe src">
                  <Input icon={Globe} value={config.contacto.mapsUrl} onChange={e => set('contacto', 'mapsUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
                </Campo>
              </div>
            </div>
          </Section>

          {/* HORARIO */}
          <Section icon={Clock} titulo="Horario de atención">
            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-3">Días de atención</p>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map(dia => {
                    const activo = config.horario.diasActivos.includes(dia)
                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => toggleDia(dia)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                          activo
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                        }`}
                      >
                        {dia.substring(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Hora de apertura">
                  <Input icon={Clock} type="time" value={config.horario.apertura} onChange={e => set('horario', 'apertura', e.target.value)} />
                </Campo>
                <Campo label="Hora de cierre">
                  <Input icon={Clock} type="time" value={config.horario.cierre} onChange={e => set('horario', 'cierre', e.target.value)} />
                </Campo>
              </div>
            </div>
          </Section>

          {/* REDES SOCIALES */}
          <Section icon={Share2} titulo="Redes sociales" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Instagram">
                <Input icon={Link2} value={config.redes.instagram} onChange={e => set('redes', 'instagram', e.target.value)} placeholder="https://instagram.com/mitaller" />
              </Campo>
              <Campo label="Facebook">
                <Input icon={Link2} value={config.redes.facebook} onChange={e => set('redes', 'facebook', e.target.value)} placeholder="https://facebook.com/mitaller" />
              </Campo>
              <Campo label="YouTube">
                <Input icon={Link2} value={config.redes.youtube} onChange={e => set('redes', 'youtube', e.target.value)} placeholder="https://youtube.com/@mitaller" />
              </Campo>
              <Campo label="Sitio web propio">
                <Input icon={Globe} value={config.redes.sitioWeb} onChange={e => set('redes', 'sitioWeb', e.target.value)} placeholder="https://www.mitaller.cl" />
              </Campo>
            </div>
          </Section>

          {/* APARIENCIA */}
          <Section icon={Palette} titulo="Apariencia de la tienda en línea" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Título principal (hero)" hint="Texto grande que aparece en el banner de la tienda">
                <Input icon={AlignLeft} value={config.apariencia.heroTitulo} onChange={e => set('apariencia', 'heroTitulo', e.target.value)} placeholder="Bienvenido a nuestro taller" />
              </Campo>
              <Campo label="Subtítulo del hero">
                <Input icon={AlignLeft} value={config.apariencia.heroSubtitulo} onChange={e => set('apariencia', 'heroSubtitulo', e.target.value)} placeholder="Calidad y confianza para tu vehículo" />
              </Campo>
              <Campo label="Nombre de la sección Tienda" hint="Cómo aparece en el menú de navegación">
                <Input value={config.apariencia.tiendasNombre} onChange={e => set('apariencia', 'tiendasNombre', e.target.value)} placeholder="Tienda" />
              </Campo>
              <Campo label="URL imagen de fondo del hero" hint="Imagen de alta resolución, mínimo 1600px de ancho">
                <Input icon={Image} value={config.apariencia.heroImagenUrl} onChange={e => set('apariencia', 'heroImagenUrl', e.target.value)} placeholder="https://..." />
              </Campo>
            </div>
          </Section>

          {/* VISIBILIDAD */}
          <Section icon={Eye} titulo="Visibilidad de secciones públicas">
            <div className="space-y-4">
              {[
                { key: 'mostrarTienda',       label: 'Tienda en línea',         desc: 'Muestra la sección de productos en el sitio público' },
                { key: 'mostrarCotizador',    label: 'Cotizador',               desc: 'Los clientes pueden solicitar cotizaciones en línea' },
                { key: 'mostrarSeguimiento',  label: 'Seguimiento de OT',       desc: 'Los clientes pueden rastrear su vehículo con el código de OT' },
                { key: 'mostrarBlog',         label: 'Blog / Noticias',         desc: 'Sección de artículos y novedades del taller' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm text-white font-medium">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    value={config.secciones[key]}
                    onChange={v => set('secciones', key, v)}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* GUARDAR */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Save size={16} />
              {guardando ? 'Guardando...' : 'Guardar configuración de tienda'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  )
}

function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}