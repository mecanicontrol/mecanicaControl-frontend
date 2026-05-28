import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { obtenerMiPerfil as getMiPerfil, actualizarPerfil as updatePerfil, cambiarPassword } from '../../services/usuarioService'
import { User, Mail, Phone, MapPin, FileText, Shield, Save, Lock, Eye, EyeOff, CheckCircle, Camera } from 'lucide-react'

const ROL_LABEL = { ADMIN: 'Administrador', CLIENTE: 'Cliente', TECNICO: 'Técnico' }

const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600'
const labelClass = 'block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5'

export default function PerfilUsuario() {
  const { usuario } = useAuth()
  const bannerInputRef = useRef(null)

  // ── foto de portada
  const [fotoBanner, setFotoBanner] = useState(() => localStorage.getItem('fotoBannerPerfil') || null)

  // ── datos de cuenta (desde el backend)
  const [cuenta, setCuenta] = useState(null)
  const [cargando, setCargando] = useState(true)

  // ── sección perfil (editable)
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [perfil, setPerfil] = useState({ telefono: '', direccion: '', rut: '' })
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [okPerfil, setOkPerfil] = useState(false)
  const [errorPerfil, setErrorPerfil] = useState('')

  // ── sección contraseña
  const [pass, setPass] = useState({ passwordActual: '', passwordNuevo: '', confirmar: '' })
  const [verActual, setVerActual] = useState(false)
  const [verNuevo, setVerNuevo] = useState(false)
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [okPass, setOkPass] = useState(false)
  const [errorPass, setErrorPass] = useState('')

  // ── cambiar foto de portada
  const handleCambiarBanner = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target.result
      localStorage.setItem('fotoBannerPerfil', base64)
      setFotoBanner(base64)
      window.dispatchEvent(new Event('bannerPerfilActualizado'))
    }
    reader.readAsDataURL(file)
  }

  // ── carga inicial
  useEffect(() => {
    getMiPerfil()
      .then(({ data }) => setCuenta(data))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  // ── guardar perfil
  const handleGuardarPerfil = async () => {
    setGuardandoPerfil(true)
    setErrorPerfil('')
    try {
      await updatePerfil({
        telefono: perfil.telefono || null,
        direccion: perfil.direccion || null,
        rut: perfil.rut || null,
        fotoUrl: null,
      })
      setOkPerfil(true)
      setEditandoPerfil(false)
      setTimeout(() => setOkPerfil(false), 3000)
    } catch (e) {
      setErrorPerfil(e.response?.data?.message ?? 'Error al guardar. Intenta de nuevo.')
    } finally {
      setGuardandoPerfil(false)
    }
  }

  // ── cambiar contraseña
  const handleCambiarPassword = async () => {
    setErrorPass('')
    if (pass.passwordNuevo !== pass.confirmar) {
      setErrorPass('Las contraseñas nuevas no coinciden.')
      return
    }
    if (pass.passwordNuevo.length < 8) {
      setErrorPass('La nueva contraseña debe tener mínimo 8 caracteres.')
      return
    }
    setGuardandoPass(true)
    try {
      await cambiarPassword({
        passwordActual: pass.passwordActual,
        passwordNuevo:  pass.passwordNuevo,
      })
      setOkPass(true)
      setPass({ passwordActual: '', passwordNuevo: '', confirmar: '' })
      setTimeout(() => setOkPass(false), 3000)
    } catch (e) {
      setErrorPass(
        e.response?.status === 400
          ? 'La contraseña actual es incorrecta.'
          : e.response?.data?.message ?? 'Error al cambiar la contraseña.'
      )
    } finally {
      setGuardandoPass(false)
    }
  }

  if (cargando) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const nombre = cuenta?.nombre ?? usuario?.nombre ?? '—'
  const apellido = cuenta?.apellido ?? ''
  const email  = cuenta?.email  ?? usuario?.email ?? '—'
  const rol    = cuenta?.rol    ?? usuario?.rol   ?? '—'

  return (
    <div className="space-y-6">

      {/* ── CABECERA ─────────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Banner / portada */}
        <div
          className="relative h-32 bg-cover bg-center"
          style={fotoBanner
            ? { backgroundImage: `url(${fotoBanner})` }
            : { background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #f97316 150%)' }
          }
        >
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 text-white text-xs font-bold backdrop-blur-sm transition-colors"
          >
            <Camera size={13} />
            Cambiar portada
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCambiarBanner}
          />
        </div>

        {/* Avatar + nombre */}
        <div className="px-6 pb-5 flex items-end gap-4 -mt-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-black text-white ring-4 ring-gray-900">
            {nombre?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="pb-1">
            <h2 className="text-xl font-black text-white">{nombre} {apellido}</h2>
            <p className="text-gray-400 text-sm">{email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 text-xs font-black uppercase rounded-full bg-orange-500/20 text-orange-400 tracking-wider">
              {ROL_LABEL[rol] ?? rol}
            </span>
          </div>
        </div>
      </div>

      {/* ── DATOS DE CUENTA (solo lectura) ───────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5 pb-3 border-b border-gray-800">
          Datos de la cuenta
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: User,   label: 'Nombre',  valor: `${nombre} ${apellido}`.trim() },
            { icon: Mail,   label: 'Correo',  valor: email },
            { icon: Shield, label: 'Rol',     valor: ROL_LABEL[rol] ?? rol },
          ].map(({ icon: Icon, label, valor }) => (
            <div key={label} className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
              <Icon size={16} className="text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{valor || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DATOS DEL PERFIL (editables) ─────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-800">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Datos del perfil</p>
          {!editandoPerfil && (
            <button
              onClick={() => setEditandoPerfil(true)}
              className="text-xs text-orange-500 hover:text-orange-400 font-black uppercase tracking-wider transition-colors"
            >
              Editar
            </button>
          )}
        </div>

        {editandoPerfil ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  value={perfil.telefono}
                  onChange={e => setPerfil({ ...perfil, telefono: e.target.value })}
                  placeholder="+56 9 1234 5678"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Dirección</label>
                <input
                  type="text"
                  value={perfil.direccion}
                  onChange={e => setPerfil({ ...perfil, direccion: e.target.value })}
                  placeholder="Av. Siempre Viva 742"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>RUT</label>
                <input
                  type="text"
                  value={perfil.rut}
                  onChange={e => setPerfil({ ...perfil, rut: e.target.value })}
                  placeholder="12.345.678-9"
                  className={inputClass}
                />
              </div>
            </div>

            {errorPerfil && (
              <p className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {errorPerfil}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setEditandoPerfil(false); setErrorPerfil('') }}
                className="px-5 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarPerfil}
                disabled={guardandoPerfil}
                className="flex items-center gap-2 px-5 py-2 text-sm font-black bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors uppercase tracking-wider"
              >
                <Save size={14} />
                {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Phone,    label: 'Teléfono',  valor: perfil.telefono },
              { icon: MapPin,   label: 'Dirección', valor: perfil.direccion },
              { icon: FileText, label: 'RUT',       valor: perfil.rut },
            ].map(({ icon: Icon, label, valor }) => (
              <div key={label} className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                <Icon size={16} className="text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{valor || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {okPerfil && (
          <div className="flex items-center gap-2 mt-4 text-green-400 text-sm font-semibold">
            <CheckCircle size={16} /> Perfil actualizado correctamente.
          </div>
        )}
      </div>

      {/* ── CAMBIAR CONTRASEÑA ───────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5 pb-3 border-b border-gray-800">
          Cambiar contraseña
        </p>

        <div className="space-y-4 max-w-md">

          {/* contraseña actual */}
          <div>
            <label className={labelClass}>Contraseña actual</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 gap-2 focus-within:border-orange-500 transition-colors">
              <Lock size={14} className="text-gray-500 flex-shrink-0" />
              <input
                type={verActual ? 'text' : 'password'}
                value={pass.passwordActual}
                onChange={e => setPass({ ...pass, passwordActual: e.target.value })}
                placeholder="••••••••"
                className="bg-transparent outline-none text-sm text-white w-full placeholder-gray-600"
              />
              <button type="button" onClick={() => setVerActual(!verActual)} className="text-gray-500 hover:text-gray-300">
                {verActual ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* nueva contraseña */}
          <div>
            <label className={labelClass}>Nueva contraseña</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 gap-2 focus-within:border-orange-500 transition-colors">
              <Lock size={14} className="text-gray-500 flex-shrink-0" />
              <input
                type={verNuevo ? 'text' : 'password'}
                value={pass.passwordNuevo}
                onChange={e => setPass({ ...pass, passwordNuevo: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                className="bg-transparent outline-none text-sm text-white w-full placeholder-gray-600"
              />
              <button type="button" onClick={() => setVerNuevo(!verNuevo)} className="text-gray-500 hover:text-gray-300">
                {verNuevo ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* confirmar */}
          <div>
            <label className={labelClass}>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={pass.confirmar}
              onChange={e => setPass({ ...pass, confirmar: e.target.value })}
              placeholder="••••••••"
              className={`${inputClass} ${
                pass.confirmar && pass.passwordNuevo !== pass.confirmar
                  ? 'border-red-500'
                  : pass.confirmar && pass.passwordNuevo === pass.confirmar
                    ? 'border-green-500'
                    : ''
              }`}
            />
            {pass.confirmar && pass.passwordNuevo !== pass.confirmar && (
              <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
            )}
            {pass.confirmar && pass.passwordNuevo === pass.confirmar && (
              <p className="text-green-400 text-xs mt-1">✓ Las contraseñas coinciden</p>
            )}
          </div>

          {errorPass && (
            <p className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {errorPass}
            </p>
          )}

          <button
            onClick={handleCambiarPassword}
            disabled={guardandoPass || !pass.passwordActual || !pass.passwordNuevo || pass.passwordNuevo !== pass.confirmar}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-black bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors uppercase tracking-wider"
          >
            <Lock size={14} />
            {guardandoPass ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>

          {okPass && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
              <CheckCircle size={16} /> Contraseña actualizada correctamente.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}