import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { ShoppingCart, User, MapPin, Phone, Mail, ChevronRight, ArrowLeft, Truck, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { obtenerMiPerfil } from "../../services/usuarioService";
import { registrarPedido } from "../../services/pedidoService";
import { Loader2 } from "lucide-react";

const REGIONES = [
  "Región Metropolitana",
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Antofagasta",
  "Región de Atacama",
  "Región de Coquimbo",
  "Región de Valparaíso",
  "Región del Libertador Gral. B. O'Higgins",
  "Región del Maule",
  "Región de Ñuble",
  "Región del Biobío",
  "Región de La Araucanía",
  "Región de Los Ríos",
  "Región de Los Lagos",
  "Región de Aysén",
  "Región de Magallanes",
];

const COSTO_ENVIO = 3990;
const UMBRAL_ENVIO_GRATIS = 50000;

function formatCLP(valor) {
  const n = typeof valor === "number" ? valor : parseFloat(valor ?? 0);
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

function Campo({ label, icono: Icono, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icono && <Icono size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          className={`w-full border rounded-lg py-2.5 text-sm text-gray-800 outline-none transition
            ${Icono ? "pl-9 pr-3" : "px-3"}
            ${error ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { usuario } = useAuth();
  const carrito   = location.state?.carrito ?? [];

  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "",
    direccion: "", ciudad: "", region: "", notas: "",
  });
  const [errores,    setErrores]    = useState({});
  const [procesando, setProcesando] = useState(false);
  const [errGeneral, setErrGeneral] = useState("");

  // Pre-rellenar con datos del usuario logueado
  useEffect(() => {
    if (!usuario) return;
    const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");
    setForm((prev) => ({
      ...prev,
      nombre: nombre || prev.nombre,
      email:  usuario.email || prev.email,
    }));
    // Obtener teléfono y dirección del perfil
    obtenerMiPerfil()
      .then(({ data }) => {
        setForm((prev) => ({
          ...prev,
          nombre:   [data.nombre, data.apellido].filter(Boolean).join(" ") || prev.nombre,
          email:    data.email    || prev.email,
          telefono: data.telefono || prev.telefono,
          direccion:data.direccion|| prev.direccion,
        }));
      })
      .catch(() => {});
  }, [usuario]);

  if (carrito.length === 0) {
    navigate("/tienda");
    return null;
  }

  const subtotal = carrito.reduce((a, i) => a + parseFloat(i.precioVenta ?? 0) * i.cantidad, 0);
  const envio    = subtotal >= UMBRAL_ENVIO_GRATIS ? 0 : COSTO_ENVIO;
  const total    = subtotal + envio;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())    e.nombre    = "Ingresa tu nombre completo";
    if (!form.email.trim())     e.email     = "Ingresa tu email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email no válido";
    if (!form.direccion.trim()) e.direccion = "Ingresa tu dirección";
    if (!form.ciudad.trim())    e.ciudad    = "Ingresa tu ciudad";
    if (!form.region)           e.region    = "Selecciona una región";
    return e;
  };

  const confirmar = async (e) => {
    e.preventDefault();
    const e2 = validar();
    if (Object.keys(e2).length > 0) { setErrores(e2); return; }

    setErrGeneral("");
    setProcesando(true);

    const numeroPedido = `MH-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(10000+Math.random()*90000)}`;

    try {
      await registrarPedido({
        numeroPedido,
        cliente: { ...form },
        items:   carrito,
        subtotal,
        envio,
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Error al registrar el pedido. Intenta de nuevo.";
      setErrGeneral(msg);
      setProcesando(false);
      return;
    }

    navigate("/tienda/confirmacion", {
      state: {
        pedido: {
          numeroPedido,
          fecha: new Date().toISOString(),
          cliente: { ...form },
          items: carrito,
          subtotal,
          envio,
          total,
        },
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">

        {/* Hero */}
        <section className="relative h-[200px] flex items-center justify-center text-white overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop"
            alt="Checkout"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-950/85" />
          <div className="relative z-10 text-center">
            <p className="text-xs uppercase tracking-[3px] mb-3 flex items-center justify-center gap-2">
              <span className="text-orange-500 font-semibold">Tienda</span>
              <ChevronRight size={12} className="text-gray-400" />
              <span className="text-white">Finalizar compra</span>
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">FINALIZAR COMPRA</h1>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate("/tienda")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition"
          >
            <ArrowLeft size={16} /> Volver a la tienda
          </button>

          <form onSubmit={confirmar} noValidate>
            <div className="grid lg:grid-cols-3 gap-8">

              {/* ── Formulario ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Contacto */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <User size={18} className="text-orange-500" />
                    <h2 className="font-black text-blue-950 text-lg">Información de contacto</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Campo label="Nombre completo *" icono={User} value={form.nombre} onChange={set("nombre")} placeholder="Juan Pérez" error={errores.nombre} />
                    <Campo label="Correo electrónico *" icono={Mail} type="email" value={form.email} onChange={set("email")} placeholder="juan@correo.cl" error={errores.email} />
                    <Campo label="Teléfono" icono={Phone} type="tel" value={form.telefono} onChange={set("telefono")} placeholder="+56 9 XXXX XXXX" />
                  </div>
                </div>

                {/* Envío */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Truck size={18} className="text-orange-500" />
                    <h2 className="font-black text-blue-950 text-lg">Dirección de envío</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Campo label="Dirección *" icono={MapPin} value={form.direccion} onChange={set("direccion")} placeholder="Av. Ejemplo 1234, Depto 5" error={errores.direccion} />
                    </div>
                    <Campo label="Ciudad *" value={form.ciudad} onChange={set("ciudad")} placeholder="Santiago" error={errores.ciudad} />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Región *</label>
                      <select
                        value={form.region}
                        onChange={set("region")}
                        className={`w-full border rounded-lg py-2.5 px-3 text-sm text-gray-800 outline-none transition bg-white
                          ${errores.region ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"}`}
                      >
                        <option value="">Selecciona una región</option>
                        {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {errores.region && <p className="text-xs text-red-500 mt-1">{errores.region}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas adicionales</label>
                      <textarea
                        value={form.notas}
                        onChange={set("notas")}
                        rows={3}
                        placeholder="Instrucciones de entrega, referencias del lugar, etc."
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-800 outline-none resize-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Resumen de pedido ── */}
              <aside>
                <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
                  <div className="flex items-center gap-2 mb-5">
                    <ShoppingCart size={18} className="text-orange-500" />
                    <h2 className="font-black text-blue-950 text-lg">Resumen</h2>
                  </div>

                  <div className="space-y-3 mb-5 max-h-[340px] overflow-y-auto pr-1">
                    {carrito.map((item) => (
                      <div key={item.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 leading-tight truncate">{item.nombre}</p>
                          {item.marca && <p className="text-xs text-gray-400 mt-0.5">{item.marca}</p>}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Tag size={9} /> {item.categoria}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">×{item.cantidad}</p>
                          <p className="text-sm font-black text-blue-950">
                            {formatCLP(parseFloat(item.precioVenta ?? 0) * item.cantidad)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2.5">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatCLP(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Truck size={13} /> Envío</span>
                      {envio === 0
                        ? <span className="font-semibold text-green-600">GRATIS</span>
                        : <span className="font-semibold">{formatCLP(envio)}</span>}
                    </div>
                    {envio > 0 && (
                      <p className="text-xs text-gray-400">
                        Compra sobre {formatCLP(UMBRAL_ENVIO_GRATIS)} y el envío es gratis
                      </p>
                    )}
                    <div className="h-px bg-gray-200 my-1" />
                    <div className="flex justify-between text-lg font-black text-blue-950">
                      <span>Total</span>
                      <span className="text-orange-500">{formatCLP(total)}</span>
                    </div>
                  </div>

                  {errGeneral && (
                    <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-semibold">{errGeneral}</p>
                  )}

                  <button
                    type="submit"
                    disabled={procesando}
                    className="w-full mt-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {procesando
                      ? <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                      : <>Confirmar pedido <ChevronRight size={18} /></>
                    }
                  </button>

                  <p className="text-xs text-center text-gray-400 mt-3">
                    Al confirmar aceptas los términos y condiciones de MecánicaHub
                  </p>
                </div>
              </aside>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}