import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { obtenerServicios } from "../../services/serviciosCatalogoService";

import correaImg from "../../assets/servicios/correa.jpg";
import motorImg from "../../assets/servicios/motor.jpg";
import enfriamientoImg from "../../assets/servicios/enfriamiento.jpg";
import electricoImg from "../../assets/servicios/electrico.jpg";
import bateriaImg from "../../assets/servicios/bateria.jpg";
import frenosDelanterosImg from "../../assets/servicios/frenos-delanteros.jpg";
import frenosTraserosImg from "../../assets/servicios/frenos-traseros.jpg";
import suspensionImg from "../../assets/servicios/suspension.jpg";
import amortiguadoresImg from "../../assets/servicios/amortiguadores.jpg";
import soldaduraImg from "../../assets/servicios/soldadura.jpg";
import alineacionImg from "../../assets/servicios/alineacion.jpg";
import neumaticosImg from "../../assets/servicios/neumaticos.jpg";
import mantencion5000Img from "../../assets/servicios/mantencion-5000.jpg";
import mantencion10000Img from "../../assets/servicios/mantencion-10000.jpg";
import diagnosticoImg from "../../assets/servicios/diagnostico.jpg";

export default function Servicios() {
  const navigate = useNavigate();

  const [categoriaActiva, setCategoriaActiva] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    obtenerServicios()
      .then(({ data }) => setServicios(data))
      .catch((err) => console.error(err));
  }, []);

  const botonFiltro = (categoria) =>
    categoriaActiva === categoria
      ? "bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow"
      : "bg-white px-5 py-2 rounded-lg text-sm font-semibold shadow hover:bg-orange-100";

  const mostrarServicio = (servicio) => {
  const categoria = (servicio.categoria || "").toLowerCase();
  const nombre = (servicio.nombre || "").toLowerCase();
  const descripcion = (servicio.descripcion || "").toLowerCase();
  const textoBusqueda = busqueda.toLowerCase();

  const textoCompleto = `${categoria} ${nombre} ${descripcion}`;

  let coincideCategoria = false;

  if (categoriaActiva === "TODOS") {
    coincideCategoria = true;
  } else if (categoriaActiva === "MANTENCIÓN") {
    coincideCategoria =
      textoCompleto.includes("mant") ||
      textoCompleto.includes("aceite") ||
      textoCompleto.includes("filtro") ||
      textoCompleto.includes("5000") ||
      textoCompleto.includes("5.000") ||
      textoCompleto.includes("10000") ||
      textoCompleto.includes("10.000");
  } else if (categoriaActiva === "DIAGNÓSTICO") {
    coincideCategoria =
      textoCompleto.includes("diagn") ||
      textoCompleto.includes("scanner") ||
      textoCompleto.includes("escáner") ||
      textoCompleto.includes("obd");
  } else if (categoriaActiva === "FRENOS") {
    coincideCategoria =
      textoCompleto.includes("freno") ||
      textoCompleto.includes("pastilla") ||
      textoCompleto.includes("zapata");
  } else if (categoriaActiva === "SUSPENSIÓN") {
    coincideCategoria =
      textoCompleto.includes("susp") ||
      textoCompleto.includes("amortiguador") ||
      textoCompleto.includes("alineación") ||
      textoCompleto.includes("alineacion") ||
      textoCompleto.includes("neum");
  } else if (categoriaActiva === "MOTOR") {
    coincideCategoria =
      textoCompleto.includes("motor") ||
      textoCompleto.includes("correa") ||
      textoCompleto.includes("distribución") ||
      textoCompleto.includes("distribucion") ||
      textoCompleto.includes("enfriamiento") ||
      textoCompleto.includes("radiador");
  } else if (categoriaActiva === "ELÉCTRICO") {
    coincideCategoria =
      textoCompleto.includes("elect") ||
      textoCompleto.includes("eléctr") ||
      textoCompleto.includes("bater") ||
      textoCompleto.includes("alternador") ||
      textoCompleto.includes("circuito");
  }

  const coincideBusqueda = textoCompleto.includes(textoBusqueda);

  return coincideCategoria && coincideBusqueda;
};

  const obtenerImagenServicio = (servicio) => {
    const nombre = servicio.nombre.toLowerCase();

    if (nombre.includes("correa")) return correaImg;
    if (nombre.includes("motor")) return motorImg;
    if (nombre.includes("enfriamiento")) return enfriamientoImg;
    if (nombre.includes("eléctr") || nombre.includes("electr")) return electricoImg;
    if (nombre.includes("bater")) return bateriaImg;
    if (nombre.includes("frenos delanteros")) return frenosDelanterosImg;
    if (nombre.includes("frenos traseros")) return frenosTraserosImg;
    if (nombre.includes("suspensión") || nombre.includes("suspension")) return suspensionImg;
    if (nombre.includes("amortiguadores")) return amortiguadoresImg;
    if (nombre.includes("soldadura") || nombre.includes("carrocer")) return soldaduraImg;
    if (nombre.includes("alineación") || nombre.includes("alineacion")) return alineacionImg;
    if (nombre.includes("neum")) return neumaticosImg;
    if (nombre.includes("5.000") || nombre.includes("5000")) return mantencion5000Img;
    if (nombre.includes("10.000") || nombre.includes("10000")) return mantencion10000Img;
    if (nombre.includes("diagnóstico") || nombre.includes("diagnostico")) return diagnosticoImg;

    return diagnosticoImg;
  };

  const categorias = [
    "TODOS",
    "MANTENCIÓN",
    "DIAGNÓSTICO",
    "FRENOS",
    "SUSPENSIÓN",
    "MOTOR",
    "ELÉCTRICO",
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100">
        <section className="relative h-[260px] flex items-center justify-center text-white overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop"
            alt="Servicios"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-blue-950/85"></div>

          <div className="relative z-10 text-center">
            <p className="text-xs uppercase tracking-[3px] mb-3">
              <span className="text-orange-500 font-semibold">Inicio</span>
              <span className="text-gray-300 mx-2">›</span>
              <span className="text-white">Servicios</span>
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight antialiased">
              NUESTROS SERVICIOS
            </h1>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                  className={botonFiltro(categoria)}
                >
                  {categoria}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-[320px]">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
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

        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {servicios.filter(mostrarServicio).map((servicio) => (
              <div
                key={servicio.id}
                className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition"
              >
                <img
                  src={obtenerImagenServicio(servicio)}
                  alt={servicio.nombre}
                  className="w-full h-52 object-cover"
                />

                <div className="p-6">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded">
                    {servicio.categoria || "SERVICIO"}
                  </span>

                  <h3 className="text-xl font-black mt-4 mb-3 leading-tight antialiased">
                    {servicio.nombre}
                  </h3>

                  <p className="text-gray-500 text-sm leading-6 mb-6">
                    {servicio.descripcion}
                  </p>

                  <p className="text-2xl font-black text-blue-950 mb-6">
                    ${servicio.precioBase?.toLocaleString("es-CL")}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        navigate("/cotizador", {
                          state: {
                            servicio: servicio.nombre,
                            precio: servicio.precioBase,
                          },
                        })
                      }
                      className="flex-1 border border-orange-500 text-orange-500 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
                    >
                      Cotizar
                    </button>

                    <button
                      onClick={() =>
                        navigate("/agendar", {
                          state: {
                            servicioId: servicio.id,
                            servicio: servicio.nombre,
                            descripcion: servicio.descripcion,
                            precio: servicio.precioBase,
                          },
                        })
                      }
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}