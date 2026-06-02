import { useEffect, useRef, useState } from "react";
import {
  obtenerMiPerfilTecnico,
  actualizarMiPerfil,
  toggleDisponibilidadTecnico,
  obtenerDashboardTecnico,
} from "../../services/tecnicoService";
import api from "../../api/axiosInstance";
import { supabase } from "../../lib/supabaseClient";

export default function PerfilTecnico() {
  const fileInputRef = useRef(null);

  const [cargando,   setCargando]   = useState(true);
  const [tab,        setTab]        = useState("datos");
  const [mensaje,    setMensaje]    = useState({ texto: "", tipo: "ok" });
  const [guardando,  setGuardando]  = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [stats,      setStats]      = useState({ otActivas: 0, otCompletadas: 0, tiempoPromedio: 0 });

  const [perfil, setPerfil] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    direccion: "", nivel: "", disponible: true, foto: "",
  });
  const [perfilOriginal, setPerfilOriginal] = useState({});

  // Seguridad
  const [pwActual,    setPwActual]    = useState("");
  const [pwNueva,     setPwNueva]     = useState("");
  const [pwNueva2,    setPwNueva2]    = useState("");
  const [cambiandoPw, setCambiandoPw] = useState(false);

  const avisar = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "ok" }), 3000);
  };

  useEffect(() => {
    Promise.all([obtenerMiPerfilTecnico(), obtenerDashboardTecnico()])
      .then(([{ data: p }, { data: d }]) => {
        const datos = {
          nombre:    p.nombre    || "",
          apellido:  p.apellido  || "",
          email:     p.email     || "",
          telefono:  p.telefono  || "",
          direccion: p.direccion || "",
          nivel:     p.nivel     || "",
          disponible: p.disponible ?? true,
          foto:      p.foto      || "",
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
      await actualizarMiPerfil({
        telefono:  perfil.telefono,
        direccion: perfil.direccion,
        fotoUrl:   perfil.foto,
      });
      setPerfilOriginal(perfil);
      avisar("Perfil guardado correctamente");
    } catch {
      avisar("Error al guardar el perfil", "error");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarCambios = () => {
    setPerfil(perfilOriginal);
    avisar("Cambios cancelados");
  };

  const cambiarDisponibilidad = async () => {
    try {
      const { data } = await toggleDisponibilidadTecnico();
      setPerfil((p) => ({ ...p, disponible: data.disponible }));
      setPerfilOriginal((p) => ({ ...p, disponible: data.disponible }));
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
      setPerfil((p) => ({ ...p, foto: nuevaFoto }));
      setPerfilOriginal((p) => ({ ...p, foto: nuevaFoto }));
      avisar("Foto actualizada");
    } catch {
      avisar("Error al subir la foto", "error");
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  const cambiarPassword = async () => {
    if (!pwActual || !pwNueva) return avisar("Completa todos los campos", "error");
    if (pwNueva !== pwNueva2)  return avisar("Las contraseñas no coinciden", "error");
    if (pwNueva.length < 8)    return avisar("La nueva contraseña debe tener al menos 8 caracteres", "error");
    setCambiandoPw(true);
    try {
      await api.put("/api/usuarios/me/password", { passwordActual: pwActual, passwordNuevo: pwNueva });
      setPwActual(""); setPwNueva(""); setPwNueva2("");
      avisar("Contraseña actualizada correctamente");
    } catch (err) {
      const msg = err.response?.data?.message || "Error al cambiar la contraseña";
      avisar(msg, "error");
    } finally {
      setCambiandoPw(false);
    }
  };

  if (cargando) {
    return (
      <main className="p-8 bg-gray-100 min-h-screen">
        <p className="font-black text-slate-700 animate-pulse">Cargando perfil...</p>
      </main>
    );
  }

  const fotoPerfil = perfil.foto ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${perfil.nombre}${perfil.apellido}`;

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      {/* Toast */}
      {mensaje.texto && (
        <div className={`mb-6 px-6 py-4 rounded-xl font-black text-sm ${
          mensaje.tipo === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {mensaje.texto}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-orange-500 font-black tracking-[0.35em] text-xs uppercase">
            Terminal / Account
          </p>
          <h1 className="text-5xl font-black text-slate-900 mt-3">MI PERFIL</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={cancelarCambios}
            className="bg-gray-200 hover:bg-gray-300 px-8 py-4 rounded font-black uppercase text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-4 rounded font-black uppercase text-sm shadow-lg"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar izquierdo */}
        <section className="col-span-4 space-y-6">
          {/* Tarjeta de foto y datos */}
          <div className="bg-white rounded-xl shadow p-8">
            <div className="flex justify-center">
              <div className="relative">
                {subiendoFoto ? (
                  <div className="w-44 h-44 rounded-xl border-8 border-gray-100 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-black animate-pulse">Subiendo...</span>
                  </div>
                ) : (
                  <img
                    src={fotoPerfil}
                    alt="perfil"
                    className="w-44 h-44 rounded-xl border-8 border-gray-100 object-cover"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={cambiarFoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subiendoFoto}
                  className="absolute -right-3 bottom-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white w-12 h-12 rounded-xl font-black shadow-lg text-lg"
                >
                  📷
                </button>
              </div>
            </div>

            <h2 className="text-center text-3xl font-black mt-8 text-slate-900 uppercase">
              {perfil.nombre} {perfil.apellido}
            </h2>
            <p className="text-center text-slate-600 tracking-[0.25em] uppercase text-sm mt-2">
              {perfil.nivel || "Técnico"}
            </p>

            <hr className="my-8" />

            <div className="grid grid-cols-3 text-center gap-2">
              <div>
                <h3 className="text-3xl font-black">{stats.otCompletadas}</h3>
                <p className="text-xs text-slate-500 font-black uppercase">OT completadas</p>
              </div>
              <div className="border-x">
                <h3 className="text-3xl font-black">{stats.tiempoPromedio}m</h3>
                <p className="text-xs text-slate-500 font-black uppercase">Min promedio</p>
              </div>
              <div>
                <h3 className="text-3xl font-black text-orange-500">{stats.otActivas}</h3>
                <p className="text-xs text-slate-500 font-black uppercase">OT activas</p>
              </div>
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="uppercase tracking-[0.25em] font-black text-sm">
                Disponibilidad actual
              </h3>
              <span className={`w-3 h-3 rounded-full ${perfil.disponible ? "bg-green-400" : "bg-red-400"}`} />
            </div>
            <p className="text-lg font-semibold">
              {perfil.disponible ? "Disponible para asignación" : "No disponible actualmente"}
            </p>
            <button
              type="button"
              onClick={cambiarDisponibilidad}
              className="mt-6 w-full border border-slate-500 hover:bg-slate-800 py-4 rounded font-black uppercase tracking-widest text-sm transition"
            >
              Cambiar disponibilidad
            </button>
          </div>
        </section>

        {/* Sección principal */}
        <section className="col-span-8">
          <div className="bg-white rounded-xl shadow p-8">
            {/* Tabs */}
            <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-2 mb-8">
              {[
                { id: "datos",       label: "Datos personales" },
                { id: "seguridad",   label: "Seguridad"        },
                { id: "estadisticas",label: "Estadísticas"     },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`py-4 rounded-lg font-black uppercase transition ${
                    tab === id ? "bg-white text-orange-500 shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Datos personales */}
            {tab === "datos" && (
              <>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-slate-900 uppercase">Información del perfil</h2>
                  <p className="text-xs font-black text-slate-500 uppercase">Nivel: {perfil.nivel || "—"}</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <Campo
                    label="Nombre"
                    value={perfil.nombre}
                    disabled
                    nota="Editable solo por administración"
                  />
                  <Campo
                    label="Apellido"
                    value={perfil.apellido}
                    disabled
                    nota="Editable solo por administración"
                  />
                  <Campo
                    label="Teléfono móvil"
                    value={perfil.telefono}
                    onChange={(v) => setPerfil((p) => ({ ...p, telefono: v }))}
                  />
                  <Campo
                    label="Email corporativo 🔒"
                    value={perfil.email}
                    disabled
                  />
                  <div className="col-span-2">
                    <Campo
                      label="Dirección / Centro de trabajo"
                      value={perfil.direccion}
                      onChange={(v) => setPerfil((p) => ({ ...p, direccion: v }))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Tab: Seguridad */}
            {tab === "seguridad" && (
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">Seguridad</h2>
                <div className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2 text-slate-500">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={pwActual}
                      onChange={(e) => setPwActual(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-100 rounded px-5 py-4 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2 text-slate-500">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={pwNueva}
                      onChange={(e) => setPwNueva(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-100 rounded px-5 py-4 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase mb-2 text-slate-500">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={pwNueva2}
                      onChange={(e) => setPwNueva2(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-100 rounded px-5 py-4 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={cambiarPassword}
                    disabled={cambiandoPw}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-4 rounded font-black uppercase transition"
                  >
                    {cambiandoPw ? "Cambiando..." : "Cambiar contraseña"}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Estadísticas */}
            {tab === "estadisticas" && (
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">Estadísticas</h2>
                <div className="grid grid-cols-3 gap-6">
                  <MiniStat titulo="OT completadas"  valor={stats.otCompletadas}  />
                  <MiniStat titulo="OT activas"       valor={stats.otActivas}      />
                  <MiniStat titulo="Tiempo promedio"  valor={`${stats.tiempoPromedio}m`} />
                </div>
              </div>
            )}

            <hr className="my-10" />

            <div className="flex justify-between items-center">
              <p className="text-xs font-black uppercase text-slate-500">
                ⚙ Los datos de nombre y email son gestionados por administración
              </p>
              <div className="flex gap-5">
                <button onClick={cancelarCambios} className="px-8 py-4 font-black uppercase text-slate-600">
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  disabled={guardando}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-12 py-4 rounded font-black uppercase shadow-xl transition"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Campo({ label, value, onChange, disabled = false, nota }) {
  return (
    <div>
      <label className="block text-xs font-black tracking-[0.25em] uppercase mb-2 text-slate-600">
        {label}
      </label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded px-5 py-4 font-semibold outline-none transition ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-150 focus:bg-white focus:ring-2 focus:ring-orange-300"
        }`}
      />
      {nota && <p className="text-xs text-gray-400 mt-1">{nota}</p>}
    </div>
  );
}

function MiniStat({ titulo, valor }) {
  return (
    <div className="bg-gray-100 rounded-xl p-6">
      <p className="text-xs font-black uppercase text-gray-500">{titulo}</p>
      <h3 className="text-4xl font-black mt-3">{valor}</h3>
    </div>
  );
}
