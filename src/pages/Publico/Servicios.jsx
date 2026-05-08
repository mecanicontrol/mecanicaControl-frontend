import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Servicios() {

  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100">

        {/* HERO */}
        <section className="relative h-[260px] flex items-center justify-center text-white overflow-hidden">

          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop"
            alt="Servicios"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-blue-950/85"></div>

          <div className="relative z-10 text-center">

            <p className="text-xs uppercase tracking-[3px] mb-3">
              <span className="text-orange-500 font-semibold">
                Inicio
              </span>

              <span className="text-gray-300 mx-2">
                ›
              </span>

              <span className="text-white">
                Servicios
              </span>
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight antialiased">
              NUESTROS SERVICIOS
            </h1>

          </div>

        </section>

        {/* FILTROS */}
        <section className="max-w-7xl mx-auto px-6 py-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex flex-wrap gap-3">

              <button className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                TODOS
              </button>

              <button className="bg-white px-5 py-2 rounded-lg text-sm font-semibold shadow">
                MANTENCIÓN
              </button>

              <button className="bg-white px-5 py-2 rounded-lg text-sm font-semibold shadow">
                DIAGNÓSTICO
              </button>

              <button className="bg-white px-5 py-2 rounded-lg text-sm font-semibold shadow">
                FRENOS
              </button>

              <button className="bg-white px-5 py-2 rounded-lg text-sm font-semibold shadow">
                SUSPENSIÓN
              </button>

              <button className="bg-white px-5 py-2 rounded-lg text-sm font-semibold shadow">
                MOTOR
              </button>

              <button className="bg-white px-5 py-2 rounded-lg text-sm font-semibold shadow">
                ELÉCTRICO
              </button>

            </div>

            {/* BUSCADOR */}
            <div className="relative w-full lg:w-[320px]">

              <input
                type="text"
                placeholder="Filtrar servicios técnicos..."
                className="w-full bg-gray-100 border border-gray-200 rounded-md py-3 pl-10 pr-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

            </div>

          </div>

        </section>

        {/* GRID SERVICIOS */}
        <section className="max-w-7xl mx-auto px-6 pb-16">

          <div className="grid md:grid-cols-3 gap-8">

            {/* CARD 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition">

              <img
                src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1200&auto=format&fit=crop"
                alt="Mantención"
                className="w-full h-52 object-cover"
              />

              <div className="p-6">

                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded">
                  MANTENCIÓN
                </span>

                <h3 className="text-xl font-black mt-4 mb-3 leading-tight antialiased">
                  MANTENCIÓN 10.000 KM
                </h3>

                <p className="text-gray-500 text-sm leading-6 mb-6">
                  Revisión integral programada para mantener tu vehículo en óptimas condiciones.
                </p>

                <p className="text-2xl font-black text-blue-950 mb-6">
                  $125.900
                </p>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      navigate("/cotizador", {
                        state: {
                          servicio: "MANTENCIÓN 10.000 KM",
                          precio: 125900,
                        },
                      })
                    }
                    className="flex-1 border border-orange-500 text-orange-500 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
                  >
                    Cotizar
                  </button>

                  <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                    Agendar
                  </button>

                </div>

              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition">

              <img
                src="https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?q=80&w=1200&auto=format&fit=crop"
                alt="Diagnóstico"
                className="w-full h-52 object-cover"
              />

              <div className="p-6">

                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded">
                  DIAGNÓSTICO
                </span>

                <h3 className="text-xl font-black mt-4 mb-3 leading-tight antialiased">
                  ESCÁNER COMPUTARIZADO
                </h3>

                <p className="text-gray-500 text-sm leading-6 mb-6">
                  Detección de fallas electrónicas y revisión técnica avanzada.
                </p>

                <p className="text-2xl font-black text-blue-950 mb-6">
                  $45.000
                </p>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      navigate("/cotizador", {
                        state: {
                          servicio: "ESCÁNER COMPUTARIZADO",
                          precio: 45000,
                        },
                      })
                    }
                    className="flex-1 border border-orange-500 text-orange-500 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
                  >
                    Cotizar
                  </button>

                  <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                    Agendar
                  </button>

                </div>

              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition">

              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop"
                alt="Frenos"
                className="w-full h-52 object-cover"
              />

              <div className="p-6">

                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded">
                  FRENOS
                </span>

                <h3 className="text-xl font-black mt-4 mb-3 leading-tight antialiased">
                  CAMBIO DE PASTILLAS
                </h3>

                <p className="text-gray-500 text-sm leading-6 mb-6">
                  Instalación profesional de pastillas y revisión del sistema de frenado.
                </p>

                <p className="text-2xl font-black text-blue-950 mb-6">
                  $89.900
                </p>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      navigate("/cotizador", {
                        state: {
                          servicio: "CAMBIO DE PASTILLAS",
                          precio: 89900,
                        },
                      })
                    }
                    className="flex-1 border border-orange-500 text-orange-500 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
                  >
                    Cotizar
                  </button>

                  <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                    Agendar
                  </button>

                </div>

              </div>
            </div>

            {/* CARD 4 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition flex flex-col">

              <img
                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200&auto=format&fit=crop"
                alt="Suspensión"
                className="w-full h-52 object-cover"
              />

              <div className="p-6 flex flex-col flex-1">

                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded w-fit">
                  SUSPENSIÓN
                </span>

                <h3 className="text-xl font-black mt-4 mb-3 leading-tight antialiased">
                  ALINEACIÓN Y BALANCEO
                </h3>

                <p className="text-gray-500 text-sm leading-6 mb-8">
                  Ajuste preciso de neumáticos y suspensión para una conducción segura.
                </p>

                <p className="text-2xl font-black text-blue-950 mb-8">
                  $28.900
                </p>

                <div className="flex gap-3 mt-auto">

                  <button
                    onClick={() =>
                      navigate("/cotizador", {
                        state: {
                          servicio: "ALINEACIÓN Y BALANCEO",
                          precio: 28900,
                        },
                      })
                    }
                    className="flex-1 border border-orange-500 text-orange-500 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
                  >
                    Cotizar
                  </button>

                  <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                    Agendar
                  </button>

                </div>

              </div>

            </div>

            {/* CARD 5 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition flex flex-col">

              <img
                src="https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg"
                alt="Motor"
                className="w-full h-52 object-cover"
              />

              <div className="p-6 flex flex-col flex-1">

                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded w-fit">
                  MOTOR
                </span>

                <h3 className="text-xl font-black mt-4 mb-3 leading-tight antialiased">
                  AJUSTE DE VÁLVULAS
                </h3>

                <p className="text-gray-500 text-sm leading-6 mb-4">
                  Sincronización técnica del tren de válvulas para mejorar el consumo de combustible y reducir emisiones.
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">

                  <span>● 180 MIN</span>

                  <span>● GARANTÍA 12M</span>

                </div>

                <p className="text-2xl font-black text-blue-950 mb-6">
                  $185.000
                </p>

                <div className="flex gap-3 mt-auto">

                  <button
                    onClick={() =>
                      navigate("/cotizador", {
                        state: {
                          servicio: "AJUSTE DE VÁLVULAS",
                          precio: 185000,
                        },
                      })
                    }
                    className="flex-1 border border-orange-500 text-orange-500 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
                  >
                    Cotizar
                  </button>

                  <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                    Agendar
                  </button>

                </div>

              </div>
            </div>

            {/* CARD 6 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition flex flex-col">

              <img
                src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=1200&auto=format&fit=crop"
                alt="Batería"
                className="w-full h-52 object-cover"
              />

              <div className="p-6 flex flex-col flex-1">

                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded w-fit">
                  ELÉCTRICO
                </span>

                <h3 className="text-xl font-black mt-4 mb-3 leading-tight antialiased">
                  REVISIÓN DE BATERÍA
                </h3>

                <p className="text-gray-500 text-sm leading-6 mb-4">
                  Test de carga y estado de salud de celdas. Incluye limpieza de terminales y chequeo del sistema eléctrico.
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">

                  <span>● 30 MIN</span>

                  <span>● CERTIFICADO</span>

                </div>

                <p className="text-2xl font-black text-blue-950 mb-6">
                  $15.000
                </p>

                <div className="flex gap-3 mt-auto">

                  <button
                    onClick={() =>
                      navigate("/cotizador", {
                        state: {
                          servicio: "REVISIÓN DE BATERÍA",
                          precio: 15000,
                        },
                      })
                    }
                    className="flex-1 border border-orange-500 text-orange-500 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
                  >
                    Cotizar
                  </button>

                  <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                    Agendar
                  </button>

                </div>

              </div>
            </div>

          </div>

        </section>

      </div>
    </>
  );
}