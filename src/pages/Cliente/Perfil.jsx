import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, X, Check, ShoppingBag } from "lucide-react";
import SidebarCliente from "../../components/cliente/SidebarCliente";
import TopbarCliente from "../../components/cliente/TopbarCliente";
import {
  obtenerMiPerfil,
  actualizarPerfil,
  cambiarPassword,
} from "../../services/usuarioService";
import { obtenerMisVehiculos } from "../../services/vehiculoService";
import { obtenerMisAgendamientos } from "../../services/agendamientoService";

const AVATARES = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio1",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio2",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio3",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio6",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio7",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio8",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Claudio10",
];

export default function Perfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [agendamientos, setAgendamientos] = useState([]);
  const [tab, setTab] = useState("perfil");
  const [modalFoto, setModalFoto] = useState(false);

  const [form, setForm] = useState({
    telefono: "",
    direccion: "",
    rut: "",
    fotoUrl: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [okPerfil,   setOkPerfil]   = useState(false);
  const [errPerfil,  setErrPerfil]  = useState("");
  const [okPass,     setOkPass]     = useState(false);
  const [errPass,    setErrPass]    = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [perfilRes, vehiculosRes, agRes] = await Promise.all([
        obtenerMiPerfil(),
        obtenerMisVehiculos(),
        obtenerMisAgendamientos(),
      ]);

      const fotoGuardada = localStorage.getItem("fotoPerfilCliente");

      setPerfil(perfilRes.data);
      setVehiculos(vehiculosRes.data || []);
      setAgendamientos(agRes.data || []);

      setForm({
        telefono: perfilRes.data.telefono || "",
        direccion: perfilRes.data.direccion || "",
        rut: perfilRes.data.rut || "",
        fotoUrl: fotoGuardada || perfilRes.data.fotoUrl || AVATARES[0],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const guardarFoto = (foto) => {
    localStorage.setItem("fotoPerfilCliente", foto);
    setForm((prev) => ({ ...prev, fotoUrl: foto }));
    window.dispatchEvent(new Event("fotoPerfilActualizada"));
    setModalFoto(false);
  };

  const subirFoto = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = () => guardarFoto(reader.result);
    reader.readAsDataURL(archivo);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    setErrPerfil(""); setOkPerfil(false);
    try {
      setGuardando(true);
      await actualizarPerfil(form);
      localStorage.setItem("fotoPerfilCliente", form.fotoUrl);
      window.dispatchEvent(new Event("fotoPerfilActualizada"));
      setOkPerfil(true);
      setTimeout(() => setOkPerfil(false), 3500);
    } catch {
      setErrPerfil("Error al actualizar el perfil. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const actualizarPassword = async () => {
    setErrPass(""); setOkPass(false);
    if (!passwordForm.passwordActual) { setErrPass("Ingresa tu contraseña actual."); return; }
    if (passwordForm.passwordNueva.length < 8) { setErrPass("La nueva contraseña debe tener mínimo 8 caracteres."); return; }
    if (passwordForm.passwordNueva !== passwordForm.confirmarPassword) { setErrPass("Las contraseñas nuevas no coinciden."); return; }
    try {
      setGuardando(true);
      await cambiarPassword({
        passwordActual: passwordForm.passwordActual,
        passwordNuevo: passwordForm.passwordNueva,
      });
      setOkPass(true);
      setPasswordForm({ passwordActual: "", passwordNueva: "", confirmarPassword: "" });
      setTimeout(() => setOkPass(false), 3500);
    } catch (e) {
      setErrPass(
        e.response?.status === 400
          ? "La contraseña actual es incorrecta."
          : e.response?.data?.message ?? "Error al cambiar la contraseña."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!perfil) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarCliente />
        <div className="flex-1">
          <TopbarCliente />
          <div className="p-10 text-2xl font-bold">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  const puntosFake = 850;
  const maxPuntosFake = 1000;
  const porcentaje = (puntosFake / maxPuntosFake) * 100;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCliente />

      <div className="flex-1">
        <TopbarCliente />

        <main className="p-6">
          <div className="mb-6">
            <p className="text-orange-500 font-black tracking-[0.3em] text-xs uppercase mb-1">Mi cuenta</p>
            <h1 className="text-2xl font-black uppercase text-slate-900">
              Perfil de Usuario
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex flex-col items-center text-center">
                  <div
                    onClick={() => setModalFoto(true)}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={form.fotoUrl}
                      alt="perfil"
                      className="w-24 h-24 rounded-2xl object-cover shadow"
                    />

                    <div className="absolute inset-0 bg-black/50 rounded-2xl hidden group-hover:flex items-center justify-center">
                      <Camera className="text-white" size={22} />
                    </div>
                  </div>

                  <button
                    onClick={() => setModalFoto(true)}
                    className="mt-3 text-orange-500 font-black text-xs uppercase tracking-wide"
                  >
                    Cambiar foto
                  </button>

                  <h2 className="text-lg font-black text-slate-900 mt-3">
                    {perfil.nombre} {perfil.apellido}
                  </h2>

                  <p className="text-orange-500 font-bold uppercase tracking-widest text-xs mt-1">
                    Silver Member
                  </p>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="font-semibold text-slate-700">
                      Progreso a Gold
                    </span>
                    <span className="font-black text-slate-800">
                      {puntosFake} / {maxPuntosFake} pts
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Te faltan {maxPuntosFake - puntosFake} puntos para subir.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-gray-100 rounded-xl p-3 text-center">
                    <p className="text-gray-500 uppercase text-xs font-semibold">Vehículos</p>
                    <h3 className="text-2xl font-black mt-1">{vehiculos.length}</h3>
                  </div>

                  <div className="bg-gray-100 rounded-xl p-3 text-center">
                    <p className="text-gray-500 uppercase text-xs font-semibold">Servicios</p>
                    <h3 className="text-2xl font-black mt-1">
                      {agendamientos.length}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow">
                <h3 className="text-base font-black uppercase tracking-wide">
                  Mantención Preventiva
                </h3>

                <p className="text-gray-300 mt-2 text-sm">
                  Ahorra hasta 20% en servicios premium.
                </p>

                <div className="flex flex-col gap-2 mt-4">
                  <button className="bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-xl font-bold uppercase text-sm transition">
                    Ver promociones
                  </button>

                  <button
                    onClick={() => navigate('/tienda')}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase text-sm py-2.5 rounded-xl transition"
                  >
                    <ShoppingBag size={16} />
                    Ir a la Tienda
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-2xl shadow p-6">
              <div className="flex gap-8 border-b pb-4 mb-6">
                <button
                  onClick={() => setTab("perfil")}
                  className={`font-black pb-2 text-sm ${
                    tab === "perfil"
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Datos Personales
                </button>

                <button
                  onClick={() => setTab("seguridad")}
                  className={`font-black pb-2 text-sm ${
                    tab === "seguridad"
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Seguridad
                </button>
              </div>

              {tab === "perfil" && (
                <>
                  <h2 className="text-lg font-black mb-5 text-slate-900">
                    Información de Contacto
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Nombre</label>
                      <input value={perfil.nombre} disabled className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Apellido</label>
                      <input value={perfil.apellido} disabled className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Correo electrónico</label>
                      <input value={perfil.email} disabled className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed outline-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Teléfono</label>
                      <input
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        placeholder="+56 9 1234 5678"
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2.5 text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">RUT</label>
                      <input
                        name="rut"
                        value={form.rut}
                        onChange={handleChange}
                        placeholder="12.345.678-9"
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2.5 text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Foto URL</label>
                      <input
                        name="fotoUrl"
                        value={form.fotoUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2.5 text-sm outline-none transition"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Dirección</label>
                      <input
                        name="direccion"
                        value={form.direccion}
                        onChange={handleChange}
                        placeholder="Calle, número, ciudad"
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2.5 text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  {okPerfil && (
                    <p className="flex items-center gap-2 text-green-600 text-sm font-semibold mt-4">
                      <Check size={16} /> Perfil actualizado correctamente.
                    </p>
                  )}
                  {errPerfil && (
                    <p className="text-red-500 text-sm font-semibold mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errPerfil}</p>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => { setErrPerfil(""); setOkPerfil(false); cargarDatos(); }}
                      className="bg-gray-200 hover:bg-gray-300 px-5 py-2.5 rounded-lg font-bold text-sm transition"
                    >
                      Descartar cambios
                    </button>

                    <button
                      onClick={guardarCambios}
                      disabled={guardando}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition"
                    >
                      {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </>
              )}

              {tab === "seguridad" && (
                <>
                  <h2 className="text-lg font-black mb-5 text-slate-900">
                    Cambiar Contraseña
                  </h2>

                  <div className="space-y-4 max-w-sm">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Contraseña actual</label>
                      <input
                        type="password"
                        name="passwordActual"
                        value={passwordForm.passwordActual}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2.5 text-sm outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Nueva contraseña</label>
                      <input
                        type="password"
                        name="passwordNueva"
                        value={passwordForm.passwordNueva}
                        onChange={handlePasswordChange}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-300 rounded-lg px-4 py-2.5 text-sm outline-none transition"
                      />
                      {passwordForm.passwordNueva && passwordForm.passwordNueva.length < 8 && (
                        <p className="text-xs text-amber-500 mt-1">Mínimo 8 caracteres</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        name="confirmarPassword"
                        value={passwordForm.confirmarPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className={`w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 rounded-lg px-4 py-2.5 text-sm outline-none transition ${
                          passwordForm.confirmarPassword && passwordForm.passwordNueva !== passwordForm.confirmarPassword
                            ? "focus:ring-red-300 ring-2 ring-red-200"
                            : passwordForm.confirmarPassword && passwordForm.passwordNueva === passwordForm.confirmarPassword
                            ? "focus:ring-green-300 ring-2 ring-green-200"
                            : "focus:ring-orange-300"
                        }`}
                      />
                      {passwordForm.confirmarPassword && passwordForm.passwordNueva !== passwordForm.confirmarPassword && (
                        <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                      )}
                      {passwordForm.confirmarPassword && passwordForm.passwordNueva === passwordForm.confirmarPassword && (
                        <p className="text-xs text-green-600 mt-1">✓ Las contraseñas coinciden</p>
                      )}
                    </div>

                    {errPass && (
                      <p className="text-red-500 text-sm font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errPass}</p>
                    )}
                    {okPass && (
                      <p className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                        <Check size={16} /> Contraseña actualizada correctamente.
                      </p>
                    )}

                    <button
                      onClick={actualizarPassword}
                      disabled={guardando}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition"
                    >
                      {guardando ? "Actualizando..." : "Cambiar contraseña"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalFoto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 relative">
            <button
              onClick={() => setModalFoto(false)}
              className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 p-3 rounded-full"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900">
              Elige tu imagen de perfil
            </h2>

            <p className="text-gray-500 text-sm mt-1.5">
              Selecciona un avatar o sube una foto real.
            </p>

            <div className="mt-6 grid grid-cols-5 gap-4">
              {AVATARES.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => guardarFoto(avatar)}
                  className={`relative rounded-xl overflow-hidden border-2 transition hover:scale-105 ${
                    form.fotoUrl === avatar
                      ? "border-orange-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-full h-24 object-cover"
                  />

                  {form.fotoUrl === avatar && (
                    <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white rounded-full p-0.5">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <Upload className="mx-auto text-orange-500 mb-2" size={28} />

              <h3 className="text-base font-black">
                Subir una foto real
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Formatos recomendados: JPG o PNG
              </p>

              <label className="inline-block mt-4 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition">
                Seleccionar archivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={subirFoto}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}