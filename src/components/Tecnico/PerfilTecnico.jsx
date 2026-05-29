import { useEffect, useRef, useState } from "react";
import { obtenerMiPerfilTecnico } from "../../services/tecnicoService";

const perfilInicial = {
  nombre: "Carlos",
  apellido: "Ramírez",
  email: "tecnico1@mecanicahub.cl",
  telefono: "+56 9 1234 5678",
  direccion: "Parque Industrial Las Palmeras, Nave 4, Santiago, Chile",
  nivel: "Técnico Senior de Planta",
  disponible: true,
  especialidades:
    "Diagnóstico automotriz, sistemas eléctricos, mantenimiento preventivo, programación PLC.",
  foto: "",
};

export default function PerfilTecnico() {
  const fileInputRef = useRef(null);

  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("datos");
  const [mensaje, setMensaje] = useState("");
  const [mostrarLogs, setMostrarLogs] = useState(false);
  const [perfilOriginal, setPerfilOriginal] = useState(perfilInicial);
  const [perfil, setPerfil] = useState(perfilInicial);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const avisar = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 2500);
  };

  const cargarPerfil = async () => {
    try {
      const guardado = localStorage.getItem("perfil-tecnico");

      if (guardado) {
        const datos = JSON.parse(guardado);
        setPerfil(datos);
        setPerfilOriginal(datos);
        return;
      }

      const { data } = await obtenerMiPerfilTecnico();

      const datos = {
        ...perfilInicial,
        nombre: data.nombre || perfilInicial.nombre,
        apellido: data.apellido || perfilInicial.apellido,
        email: data.email || perfilInicial.email,
        telefono: data.telefono || perfilInicial.telefono,
        direccion: data.direccion || perfilInicial.direccion,
        nivel: data.nivel || perfilInicial.nivel,
        disponible: data.disponible ?? perfilInicial.disponible,
        especialidades: data.especialidades || perfilInicial.especialidades,
        foto: data.foto || "",
      };

      setPerfil(datos);
      setPerfilOriginal(datos);
    } catch (error) {
      console.error(error);
      setPerfil(perfilInicial);
      setPerfilOriginal(perfilInicial);
    } finally {
      setCargando(false);
    }
  };

  const actualizarCampo = (campo, valor) => {
    setPerfil((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const guardarCambios = () => {
    localStorage.setItem("perfil-tecnico", JSON.stringify(perfil));
    setPerfilOriginal(perfil);
    avisar("Perfil guardado correctamente.");
  };

  const cancelarCambios = () => {
    setPerfil(perfilOriginal);
    avisar("Cambios cancelados.");
  };

  const cambiarDisponibilidad = () => {
    const nuevo = {
      ...perfil,
      disponible: !perfil.disponible,
    };

    setPerfil(nuevo);
    localStorage.setItem("perfil-tecnico", JSON.stringify(nuevo));
    setPerfilOriginal(nuevo);

    avisar(
      nuevo.disponible
        ? "Disponibilidad activada correctamente."
        : "Disponibilidad desactivada correctamente."
    );
  };

  const cambiarFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = () => {
      const nuevo = {
        ...perfil,
        foto: reader.result,
      };

      setPerfil(nuevo);
      localStorage.setItem("perfil-tecnico", JSON.stringify(nuevo));
      setPerfilOriginal(nuevo);
      avisar("Foto actualizada y guardada correctamente.");
    };

    reader.readAsDataURL(archivo);
  };

  if (cargando) {
    return (
      <main className="p-8 bg-gray-100 min-h-screen">
        <p className="font-black text-slate-700">Cargando perfil...</p>
      </main>
    );
  }

  const fotoPerfil =
    perfil.foto ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${perfil.nombre}${perfil.apellido}`;

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      {mensaje && (
        <div className="mb-6 bg-green-100 text-green-700 px-6 py-4 rounded-xl font-black">
          {mensaje}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-orange-500 font-black tracking-[0.35em] text-xs uppercase">
            System / Terminal / Account
          </p>
          <h1 className="text-5xl font-black text-slate-900 mt-3">
            MI PERFIL
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setMostrarLogs(!mostrarLogs)}
            className="bg-gray-200 hover:bg-gray-300 px-8 py-4 rounded font-black uppercase text-sm"
          >
            Logs de actividad
          </button>

          <button
            onClick={guardarCambios}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded font-black uppercase text-sm shadow-lg"
          >
            Guardar cambios
          </button>
        </div>
      </div>

      {mostrarLogs && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-black mb-4">Logs de actividad</h2>
          <div className="space-y-3 text-sm">
            <p>✅ Perfil visualizado correctamente.</p>
            <p>✅ Edición local guardada en navegador.</p>
            <p>✅ Disponibilidad sincronizada localmente.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow p-8">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={fotoPerfil}
                  alt="perfil"
                  className="w-44 h-44 rounded-xl border-8 border-gray-100 object-cover"
                />

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
                  className="absolute -right-3 bottom-4 bg-orange-500 text-white w-12 h-12 rounded-xl font-black shadow-lg"
                >
                  📷
                </button>
              </div>
            </div>

            <h2 className="text-center text-3xl font-black mt-8 text-slate-900 uppercase">
              {perfil.nombre} {perfil.apellido}
            </h2>

            <p className="text-center text-slate-600 tracking-[0.25em] uppercase text-sm mt-2">
              {perfil.nivel}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {["Electromecánica", "Diagnóstico", "PLC"].map((item) => (
                <span
                  key={item}
                  className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase"
                >
                  {item}
                </span>
              ))}
            </div>

            <hr className="my-8" />

            <div className="grid grid-cols-3 text-center">
              <div>
                <h3 className="text-3xl font-black">1,240</h3>
                <p className="text-xs text-slate-500 font-black uppercase">
                  OT completadas
                </p>
              </div>

              <div className="border-x">
                <h3 className="text-3xl font-black">42m</h3>
                <p className="text-xs text-slate-500 font-black uppercase">
                  Min promedio
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-black text-orange-500">5.0☆</h3>
                <p className="text-xs text-slate-500 font-black uppercase">
                  Valoración
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="uppercase tracking-[0.25em] font-black text-sm">
                Disponibilidad actual
              </h3>

              <span
                className={`w-3 h-3 rounded-full ${
                  perfil.disponible ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
            </div>

            <p className="text-lg font-semibold">
              {perfil.disponible
                ? "Disponible para asignación"
                : "No disponible actualmente"}
            </p>

            <button
              type="button"
              onClick={cambiarDisponibilidad}
              className="mt-6 w-full border border-slate-500 hover:bg-slate-800 py-4 rounded font-black uppercase tracking-widest text-sm"
            >
              Cambiar disponibilidad
            </button>
          </div>
        </section>

        <section className="col-span-8">
          <div className="bg-white rounded-xl shadow p-8">
            <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-2 mb-8">
              <button
                type="button"
                onClick={() => setTab("datos")}
                className={`py-4 rounded-lg font-black uppercase ${
                  tab === "datos"
                    ? "bg-white text-orange-500"
                    : "text-slate-600"
                }`}
              >
                Datos personales
              </button>

              <button
                type="button"
                onClick={() => setTab("seguridad")}
                className={`py-4 rounded-lg font-black uppercase ${
                  tab === "seguridad"
                    ? "bg-white text-orange-500"
                    : "text-slate-600"
                }`}
              >
                Seguridad
              </button>

              <button
                type="button"
                onClick={() => setTab("estadisticas")}
                className={`py-4 rounded-lg font-black uppercase ${
                  tab === "estadisticas"
                    ? "bg-white text-orange-500"
                    : "text-slate-600"
                }`}
              >
                Estadísticas
              </button>
            </div>

            {tab === "datos" && (
              <>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-slate-900 uppercase">
                    Información del perfil
                  </h2>
                  <p className="text-xs font-black text-slate-500 uppercase">
                    Última actualización: hoy
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <Campo
                    label="Nombre"
                    value={perfil.nombre}
                    onChange={(v) => actualizarCampo("nombre", v)}
                  />

                  <Campo
                    label="Apellido"
                    value={perfil.apellido}
                    onChange={(v) => actualizarCampo("apellido", v)}
                  />

                  <Campo
                    label="Teléfono móvil"
                    value={perfil.telefono}
                    onChange={(v) => actualizarCampo("telefono", v)}
                  />

                  <Campo
                    label="Email corporativo 🔒"
                    value={perfil.email}
                    disabled
                  />

                  <div className="col-span-2">
                    <Campo
                      label="Dirección de oficina / centro de trabajo"
                      value={perfil.direccion}
                      onChange={(v) => actualizarCampo("direccion", v)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-black tracking-[0.25em] uppercase mb-3">
                      Especialidades certificadas
                    </label>

                    <textarea
                      rows={4}
                      value={perfil.especialidades}
                      onChange={(e) =>
                        actualizarCampo("especialidades", e.target.value)
                      }
                      className="w-full bg-gray-100 rounded px-5 py-5 text-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {tab === "seguridad" && (
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">
                  Seguridad
                </h2>

                <div className="space-y-5">
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    className="w-full bg-gray-100 rounded px-5 py-5"
                  />

                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    className="w-full bg-gray-100 rounded px-5 py-5"
                  />

                  <button
                    type="button"
                    onClick={() => avisar("Contraseña actualizada localmente.")}
                    className="bg-orange-500 text-white px-8 py-4 rounded font-black uppercase"
                  >
                    Cambiar contraseña
                  </button>
                </div>
              </div>
            )}

            {tab === "estadisticas" && (
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">
                  Estadísticas
                </h2>

                <div className="grid grid-cols-3 gap-6">
                  <MiniStat titulo="OT completadas" valor="1,240" />
                  <MiniStat titulo="Tiempo promedio" valor="42m" />
                  <MiniStat titulo="Valoración" valor="5.0☆" />
                </div>
              </div>
            )}

            <hr className="my-10" />

            <div className="flex justify-between items-center">
              <p className="text-xs font-black uppercase text-slate-600">
                ⚙ Identidad verificada por recursos humanos
              </p>

              <div className="flex gap-5">
                <button
                  type="button"
                  onClick={cancelarCambios}
                  className="px-8 py-4 font-black uppercase"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={guardarCambios}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded font-black uppercase shadow-xl"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Campo({ label, value, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-black tracking-[0.25em] uppercase mb-3">
        {label}
      </label>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded px-5 py-5 font-semibold ${
          disabled ? "bg-gray-100 text-gray-500" : "bg-gray-200"
        }`}
      />
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