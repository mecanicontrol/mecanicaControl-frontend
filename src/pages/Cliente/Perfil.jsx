import { useEffect, useState } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
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
    try {
      setGuardando(true);
      await actualizarPerfil(form);
      localStorage.setItem("fotoPerfilCliente", form.fotoUrl);
      window.dispatchEvent(new Event("fotoPerfilActualizada"));
      alert("Perfil actualizado correctamente");
    } catch {
      alert("Error al actualizar perfil");
    } finally {
      setGuardando(false);
    }
  };

  const actualizarPassword = async () => {
    if (passwordForm.passwordNueva !== passwordForm.confirmarPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      setGuardando(true);
      await cambiarPassword({
        passwordActual: passwordForm.passwordActual,
        passwordNuevo: passwordForm.passwordNueva,
      });

      alert("Contraseña actualizada correctamente");
      setPasswordForm({
        passwordActual: "",
        passwordNueva: "",
        confirmarPassword: "",
      });
    } catch {
      alert("Error al cambiar contraseña");
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

        <main className="p-8">
          <h1 className="text-5xl font-black uppercase text-slate-900 mb-8">
            Perfil de Usuario
          </h1>

          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow p-8">
                <div className="flex flex-col items-center text-center">
                  <div
                    onClick={() => setModalFoto(true)}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={form.fotoUrl}
                      alt="perfil"
                      className="w-32 h-32 rounded-2xl object-cover shadow"
                    />

                    <div className="absolute inset-0 bg-black/50 rounded-2xl hidden group-hover:flex items-center justify-center">
                      <Camera className="text-white" size={30} />
                    </div>
                  </div>

                  <button
                    onClick={() => setModalFoto(true)}
                    className="mt-4 text-orange-500 font-black text-sm uppercase"
                  >
                    Cambiar foto
                  </button>

                  <h2 className="text-3xl font-black text-slate-900 mt-4">
                    {perfil.nombre} {perfil.apellido}
                  </h2>

                  <p className="text-orange-500 font-bold uppercase tracking-widest mt-2">
                    Silver Member
                  </p>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-slate-700">
                      Progreso a Gold
                    </span>
                    <span className="font-black">
                      {puntosFake} / {maxPuntosFake} pts
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-orange-500 h-4 rounded-full"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    Te faltan {maxPuntosFake - puntosFake} puntos para subir.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-gray-100 rounded-xl p-6 text-center">
                    <p className="text-gray-500 uppercase text-sm">Vehículos</p>
                    <h3 className="text-4xl font-black">{vehiculos.length}</h3>
                  </div>

                  <div className="bg-gray-100 rounded-xl p-6 text-center">
                    <p className="text-gray-500 uppercase text-sm">Servicios</p>
                    <h3 className="text-4xl font-black">
                      {agendamientos.length}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-8 text-white shadow">
                <h3 className="text-3xl font-black uppercase">
                  Mantención Preventiva
                </h3>

                <p className="text-gray-300 mt-3">
                  Ahorra hasta 20% en servicios premium.
                </p>

                <button className="mt-6 bg-orange-500 hover:bg-orange-600 px-6 py-4 rounded-xl font-bold uppercase">
                  Ver promociones
                </button>
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-2xl shadow p-8">
              <div className="flex gap-10 border-b pb-5 mb-8">
                <button
                  onClick={() => setTab("perfil")}
                  className={`font-black pb-3 ${
                    tab === "perfil"
                      ? "text-orange-500 border-b-4 border-orange-500"
                      : "text-slate-500"
                  }`}
                >
                  Datos Personales
                </button>

                <button
                  onClick={() => setTab("seguridad")}
                  className={`font-black pb-3 ${
                    tab === "seguridad"
                      ? "text-orange-500 border-b-4 border-orange-500"
                      : "text-slate-500"
                  }`}
                >
                  Seguridad
                </button>
              </div>

              {tab === "perfil" && (
                <>
                  <h2 className="text-3xl font-black mb-8">
                    Información de Contacto
                  </h2>

                  <div className="grid grid-cols-2 gap-6">
                    <input value={perfil.nombre} disabled className="bg-gray-100 rounded-xl p-4" />
                    <input value={perfil.apellido} disabled className="bg-gray-100 rounded-xl p-4" />
                    <input value={perfil.email} disabled className="bg-gray-100 rounded-xl p-4" />

                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="Teléfono"
                      className="bg-gray-100 rounded-xl p-4"
                    />

                    <input
                      name="rut"
                      value={form.rut}
                      onChange={handleChange}
                      placeholder="RUT"
                      className="bg-gray-100 rounded-xl p-4"
                    />

                    <input
                      name="fotoUrl"
                      value={form.fotoUrl}
                      onChange={handleChange}
                      placeholder="Foto URL"
                      className="bg-gray-100 rounded-xl p-4"
                    />

                    <input
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      placeholder="Dirección"
                      className="col-span-2 bg-gray-100 rounded-xl p-4"
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-10">
                    <button className="bg-gray-200 px-8 py-4 rounded-xl font-bold">
                      Descartar cambios
                    </button>

                    <button
                      onClick={guardarCambios}
                      disabled={guardando}
                      className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </>
              )}

              {tab === "seguridad" && (
                <>
                  <h2 className="text-3xl font-black mb-8">
                    Cambiar Contraseña
                  </h2>

                  <div className="space-y-6">
                    <input
                      type="password"
                      name="passwordActual"
                      value={passwordForm.passwordActual}
                      onChange={handlePasswordChange}
                      placeholder="Contraseña actual"
                      className="w-full bg-gray-100 rounded-xl p-4"
                    />

                    <input
                      type="password"
                      name="passwordNueva"
                      value={passwordForm.passwordNueva}
                      onChange={handlePasswordChange}
                      placeholder="Nueva contraseña"
                      className="w-full bg-gray-100 rounded-xl p-4"
                    />

                    <input
                      type="password"
                      name="confirmarPassword"
                      value={passwordForm.confirmarPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirmar nueva contraseña"
                      className="w-full bg-gray-100 rounded-xl p-4"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={actualizarPassword}
                        className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold"
                      >
                        Cambiar contraseña
                      </button>
                    </div>
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

            <h2 className="text-4xl font-black text-slate-900">
              Elige tu imagen de perfil
            </h2>

            <p className="text-gray-500 mt-2">
              Puedes seleccionar un avatar profesional o subir una foto real.
            </p>

            <div className="mt-8 grid grid-cols-5 gap-5">
              {AVATARES.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => guardarFoto(avatar)}
                  className={`relative rounded-2xl overflow-hidden border-4 transition hover:scale-105 ${
                    form.fotoUrl === avatar
                      ? "border-orange-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-full h-36 object-cover"
                  />

                  {form.fotoUrl === avatar && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1">
                      <Check size={18} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-10 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
              <Upload className="mx-auto text-orange-500 mb-3" size={34} />

              <h3 className="text-xl font-black">
                Subir una foto real
              </h3>

              <p className="text-gray-500 mt-2">
                Formatos recomendados: JPG o PNG
              </p>

              <label className="inline-block mt-5 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold cursor-pointer">
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