import { useEffect, useRef, useState } from "react";
import {
  obtenerMiPerfilTecnico,
  actualizarMiPerfil,
  toggleDisponibilidadTecnico,
  obtenerDashboardTecnico,
} from "../../services/tecnicoService";
import api from "../../api/axiosInstance";
import { supabase } from "../../lib/supabaseClient";
import {
  Camera, Loader2, Save, X, CheckCircle, ClipboardList,
  Clock, Wrench, Phone, MapPin, Lock, Eye, EyeOff, ShieldCheck
} from "lucide-react";

export default function PerfilTecnico() {
  const fileInputRef = useRef(null);

  const [cargando,      setCargando]      = useState(true);
  const [mensaje,       setMensaje]       = useState({ texto: "", tipo: "ok" });
  const [guardando,     setGuardando]     = useState(false);
  const [subiendoFoto,  setSubiendoFoto]  = useState(false);
  const [cambiandoPw,   setCambiandoPw]   = useState(false);
  const [verPw,         setVerPw]         = useState({ actual: false, nueva: false, conf: false });
  const [stats, setStats] = useState({ otActivas: 0, otCompletadas: 0, tiempoPromedio: 0 });

  const [perfil, setPerfil] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    direccion: "", nivel: "", disponible: true, foto: "",
  });
  const [perfilOriginal, setPerfilOriginal] = useState({});

  const [pw, setPw] = useState({ actual: "", nueva: "", conf: "" });

  const avisar = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "ok" }), 3500);
  };

  useEffect(() => {
    Promise.all([obtenerMiPerfilTecnico(), obtenerDashboardTecnico()])
      .then(([{ data: p }, { data: d }]) => {
        const datos = {
          nombre:     p.nombre    || "",
          apellido:   p.apellido  || "",
          email:      p.email     || "",
          telefono:   p.telefono  || "",
          direccion:  p.direccion || "",
          nivel:      p.nivel     || "",
          disponible: p.disponible ?? true,
          foto:       p.foto      || "",
        };
        setPerfil(datos);
        setPerfilOriginal(datos);
        setStats({ otActivas: d.otActivas, otCompletadas: d.otCompletadas, tiempoPromedio: d.tiempoPromedio });
      })
      .catch(() => avisar("Error al cargar el perfil", "error"))
      .finally(() => setCargando(false));
  }, []);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      await actualizarMiPerfil({ telefono: perfil.telefono, direccion: perfil.direccion, fotoUrl: perfil.foto });
      setPerfilOriginal(perfil);
      avisar("Perfil guardado correctamente");
    } catch {
      avisar("Error al guardar el perfil", "error");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarDisponibilidad = async () => {
    try {
      const { data } = await toggleDisponibilidadTecnico();
      setPerfil(p => ({ ...p, disponible: data.disponible }));
      setPerfilOriginal(p => ({ ...p, disponible: data.disponible }));
      avisar(data.disponible ? "Disponibilidad activada" : "Disponibilidad desactivada");
    } catch {
      avisar("Error al cambiar disponibilidad", "error");
    }
  };

  const cambiarFoto = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendoFoto(true);
    try {
      const ruta = `avatares/${Date.now()}-${archivo.name.replace(/\s/g, "_")}`;
      const { error } = await supabase.storage.from("ot-imagenes").upload(ruta, archivo, { upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("ot-imagenes").getPublicUrl(ruta);
      const nuevaFoto = urlData.publicUrl;
      await actualizarMiPerfil({ fotoUrl: nuevaFoto });
      setPerfil(p => ({ ...p, foto: nuevaFoto }));
      setPerfilOriginal(p => ({ ...p, foto: nuevaFoto }));
      avisar("Foto actualizada");
    } catch {
      avisar("Error al subir la foto", "error");
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  const cambiarPassword = async () => {
    if (!pw.actual || !pw.nueva)    return avisar("Completa todos los campos", "error");
    if (pw.nueva !== pw.conf)       return avisar("Las contraseñas no coinciden", "error");
    if (pw.nueva.length < 8)        return avisar("Mínimo 8 caracteres", "error");
    setCambiandoPw(true);
    try {
      await api.put("/api/usuarios/me/password", { passwordActual: pw.actual, passwordNuevo: pw.nueva });
      setPw({ actual: "", nueva: "", conf: "" });
      avisar("Contraseña actualizada correctamente");
    } catch (err) {
      avisar(err.response?.data?.message || "Error al cambiar la contraseña", "error");
    } finally {
      setCambiandoPw(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    );
  }

  const fotoPerfil = perfil.foto || `https://api.dicebear.com/7.x/notionists/svg?seed=${perfil.nombre}${perfil.apellido}`;

  return (
    <main className="p-5 lg:p-6 bg-gray-950 min-h-screen">

      {/* Toast */}
      {mensaje.texto && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm shadow-2xl transition-all ${
          mensaje.tipo === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {mensaje.tipo === "error" ? <X size={16} /> : <CheckCircle size={16} />}
          {mensaje.texto}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] text-orange-500 font-black tracking-[0.3em] uppercase mb-0.5">Portal Técnico</p>
          <h1 className="text-2xl font-black text-white">Mi Perfil</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPerfil(perfilOriginal)}
            className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 disabled:opacity-60 rounded-xl transition"
          >
            {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5 items-start">

        {/* ── Columna izquierda ── */}
        <div className="space-y-4">

          {/* Tarjeta de foto */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <div className="relative inline-block mb-4">
              {subiendoFoto ? (
                <div className="w-24 h-24 rounded-2xl bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-orange-400" />
                </div>
              ) : (
                <img src={fotoPerfil} alt="perfil" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-700" />
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={cambiarFoto} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoFoto}
                className="absolute -right-2 -bottom-2 w-8 h-8 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition shadow-lg"
              >
                <Camera size={14} />
              </button>
            </div>

            <p className="text-base font-black text-white">{perfil.nombre} {perfil.apellido}</p>
            <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mt-0.5">{perfil.nivel || "Técnico"}</p>

            {/* Disponibilidad */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Disponibilidad</p>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${perfil.disponible ? 'text-green-400' : 'text-red-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${perfil.disponible ? 'bg-green-400' : 'bg-red-400'}`} />
                  {perfil.disponible ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <button
                onClick={cambiarDisponibilidad}
                className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border ${
                  perfil.disponible
                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                    : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                }`}
              >
                {perfil.disponible ? 'Marcar no disponible' : 'Activar disponibilidad'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Estadísticas</p>
            <div className="space-y-3">
              <StatRow icono={ClipboardList} label="OT completadas" valor={stats.otCompletadas} color="text-green-400" />
              <StatRow icono={Wrench}        label="OT activas"     valor={stats.otActivas}     color="text-orange-400" />
              <StatRow icono={Clock}         label="Tiempo promedio" valor={`${stats.tiempoPromedio} min`} color="text-blue-400" />
            </div>
          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div className="space-y-4 min-w-0">

          {/* Datos personales */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Datos personales</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoInput
                label="Nombre"
                icon={<span className="text-[10px] text-gray-700">👤</span>}
                value={perfil.nombre}
                disabled
                nota="Solo administración"
              />
              <CampoInput
                label="Apellido"
                value={perfil.apellido}
                disabled
                nota="Solo administración"
              />
              <CampoInput
                label="Email corporativo"
                value={perfil.email}
                disabled
                nota="Solo administración"
              />
              <CampoInput
                label="Nivel técnico"
                value={perfil.nivel || '—'}
                disabled
                nota="Asignado por administración"
              />
              <CampoInput
                label="Teléfono"
                icon={<Phone size={13} className="text-gray-600" />}
                value={perfil.telefono}
                onChange={v => setPerfil(p => ({ ...p, telefono: v }))}
                placeholder="+56 9 xxxx xxxx"
              />
              <CampoInput
                label="Dirección / Centro de trabajo"
                icon={<MapPin size={13} className="text-gray-600" />}
                value={perfil.direccion}
                onChange={v => setPerfil(p => ({ ...p, direccion: v }))}
                placeholder="Av. ejemplo 123, Santiago"
              />
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={guardarCambios}
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 disabled:opacity-60 rounded-xl transition"
              >
                {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>

          {/* Seguridad */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={15} className="text-orange-400" />
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Seguridad — Cambiar contraseña</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CampoPassword
                label="Contraseña actual"
                value={pw.actual}
                onChange={v => setPw(p => ({ ...p, actual: v }))}
                ver={verPw.actual}
                onToggleVer={() => setVerPw(p => ({ ...p, actual: !p.actual }))}
              />
              <CampoPassword
                label="Nueva contraseña"
                value={pw.nueva}
                onChange={v => setPw(p => ({ ...p, nueva: v }))}
                ver={verPw.nueva}
                onToggleVer={() => setVerPw(p => ({ ...p, nueva: !p.nueva }))}
              />
              <CampoPassword
                label="Confirmar contraseña"
                value={pw.conf}
                onChange={v => setPw(p => ({ ...p, conf: v }))}
                ver={verPw.conf}
                onToggleVer={() => setVerPw(p => ({ ...p, conf: !p.conf }))}
              />
            </div>

            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-gray-600">Mínimo 8 caracteres</p>
              <button
                onClick={cambiarPassword}
                disabled={cambiandoPw}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-60 rounded-xl transition"
              >
                {cambiandoPw ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {cambiandoPw ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function CampoInput({ label, value, onChange, disabled = false, nota, placeholder, icon }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <input
          value={value}
          disabled={disabled}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border ${
            icon ? 'pl-8' : ''
          } ${
            disabled
              ? 'bg-gray-800/50 border-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30'
          }`}
        />
      </div>
      {nota && <p className="text-[10px] text-gray-700 mt-1">{nota}</p>}
    </div>
  );
}

function CampoPassword({ label, value, onChange, ver, onToggleVer }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={ver ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-3 py-2.5 pr-9 text-sm outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition"
        />
        <button
          type="button"
          onClick={onToggleVer}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition"
        >
          {ver ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function StatRow({ icono: Icon, label, valor, color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className={color} />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className={`text-sm font-black ${color}`}>{valor}</p>
    </div>
  );
}