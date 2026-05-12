import { useState } from "react";
import Navbar from "../../components/Navbar";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import aceite from "../../assets/tienda/aceite.jpg";
import frenos from "../../assets/tienda/frenos.jpg";
import bateria from "../../assets/tienda/bateria.jpg";
import filtroAire from "../../assets/tienda/filtro-aire.jpg";
import herramientas from "../../assets/tienda/herramientas.jpg";
import shampoo from "../../assets/tienda/shampoo.jpg";
import plumillas from "../../assets/tienda/plumillas.jpg";
import refrigerante from "../../assets/tienda/refrigerante.jpg";
import filtroAceite from "../../assets/tienda/filtro-aceite.jpg";
export default function Tienda() {
  const [categoriaActiva, setCategoriaActiva] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const productos = [
  {
    id: 1,
    categoria: "ACEITES",
    nombre: "Aceite Mobil 1 5W-30",
    descripcion: "Aceite sintético premium para alto rendimiento.",
    precio: 24990,
    imagen: aceite,
  },
  {
    id: 2,
    categoria: "FRENOS",
    nombre: "Pastillas de Freno Brembo",
    descripcion: "Pastillas delanteras de alta seguridad.",
    precio: 89990,
    imagen: frenos,
  },
  {
    id: 3,
    categoria: "BATERÍAS",
    nombre: "Batería Bosch 60Ah",
    descripcion: "Batería automotriz de larga duración.",
    precio: 129990,
    imagen: bateria,
  },
  {
    id: 4,
    categoria: "FILTROS",
    nombre: "Filtro de Aire K&N",
    descripcion: "Mejora el flujo de aire del motor.",
    precio: 34990,
    imagen: filtroAire,
  },
  {
    id: 5,
    categoria: "ACCESORIOS",
    nombre: "Kit Herramientas Auto",
    descripcion: "Set básico para mantención y emergencias.",
    precio: 45990,
    imagen: herramientas,
  },
  {
    id: 6,
    categoria: "LIMPIEZA",
    nombre: "Shampoo Automotriz Mothers",
    descripcion: "Limpieza premium con brillo protector.",
    precio: 12990,
    imagen: shampoo,
  },
  {
    id: 7,
    categoria: "ACCESORIOS",
    nombre: "Limpiaparabrisas Bosch",
    descripcion: "Plumillas resistentes para lluvia intensa.",
    precio: 19990,
    imagen: plumillas,
  },
  {
    id: 8,
    categoria: "ACEITES",
    nombre: "Refrigerante Motor Prestone",
    descripcion: "Protección térmica y anticorrosiva.",
    precio: 15990,
    imagen: refrigerante,
  },
  {
    id: 9,
    categoria: "FILTROS",
    nombre: "Filtro de Aceite Bosch",
    descripcion: "Filtro de aceite de alta eficiencia.",
    precio: 9990,
    imagen: filtroAceite,
  },
];

  const categorias = [
    "TODOS",
    "ACEITES",
    "FRENOS",
    "BATERÍAS",
    "FILTROS",
    "ACCESORIOS",
    "LIMPIEZA",
  ];

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaActiva === "TODOS" || producto.categoria === categoriaActiva;

    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((item) => item.id === producto.id);

    if (existe) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const aumentarCantidad = (id) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  const disminuirCantidad = (id) => {
    setCarrito(
      carrito
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const botonFiltro = (categoria) =>
    categoriaActiva === categoria
      ? "bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow"
      : "bg-white text-gray-800 px-5 py-2 rounded-lg text-sm font-semibold shadow hover:bg-orange-100 transition";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100">

        {/* HERO */}
        <section className="relative h-[260px] flex items-center justify-center text-white overflow-hidden">

          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop"
            alt="Tienda"
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
                Tienda
              </span>
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight antialiased">
              TIENDA MECÁNICAHUB
            </h1>

          </div>

        </section>

        {/* FILTROS */}
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

            {/* BUSCADOR */}
            <div className="relative w-full lg:w-[320px]">

              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos..."
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

        {/* CONTENIDO */}
        <section className="max-w-7xl mx-auto px-6 pb-16">

          <div className="grid lg:grid-cols-4 gap-8">

            {/* PRODUCTOS */}
            <div className="lg:col-span-3">

              <div className="grid md:grid-cols-3 gap-8">

                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition flex flex-col"
                  >

                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-48 object-cover"
                    />

                    <div className="p-5 flex flex-col flex-1">

                      <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded w-fit">
                        {producto.categoria}
                      </span>

                      <h3 className="text-lg font-black mt-4 mb-2 leading-tight antialiased">
                        {producto.nombre}
                      </h3>

                      <p className="text-gray-500 text-sm leading-6 mb-4">
                        {producto.descripcion}
                      </p>

                      <p className="text-2xl font-black text-blue-950 mb-5 mt-auto">
                        ${producto.precio.toLocaleString("es-CL")}
                      </p>

                      <button
                        onClick={() => agregarAlCarrito(producto)}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Agregar
                      </button>

                    </div>
                  </div>
                ))}

              </div>

            </div>

            {/* CARRITO */}
            <aside className="lg:col-span-1">

              <div className="bg-white rounded-2xl shadow p-6 sticky top-6">

                <div className="flex items-center gap-2 mb-5">

                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                    <ShoppingCart size={22} />
                  </div>

                  <div>
                    <h2 className="font-black text-blue-950">
                      Carrito
                    </h2>
                    <p className="text-xs text-gray-400">
                      Resumen de compra
                    </p>
                  </div>

                </div>

                {carrito.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Aún no agregas productos.
                  </p>
                ) : (
                  <div className="space-y-4">

                    {carrito.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >

                        <div className="flex justify-between gap-2">

                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {item.nombre}
                            </p>

                            <p className="text-sm font-bold text-orange-500 mt-1">
                              ${item.precio.toLocaleString("es-CL")}
                            </p>
                          </div>

                          <button
                            onClick={() => eliminarProducto(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                        <div className="flex items-center justify-between mt-3">

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() => disminuirCantidad(item.id)}
                              className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="text-sm font-bold">
                              {item.cantidad}
                            </span>

                            <button
                              onClick={() => aumentarCantidad(item.id)}
                              className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              <Plus size={14} />
                            </button>

                          </div>

                          <p className="text-sm font-black text-blue-950">
                            ${(item.precio * item.cantidad).toLocaleString("es-CL")}
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

                <div className="border-t border-gray-200 mt-6 pt-5">

                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString("es-CL")}</span>
                  </div>

                  <div className="flex justify-between text-xl font-black text-blue-950 mb-5">
                    <span>Total</span>
                    <span>${total.toLocaleString("es-CL")}</span>
                  </div>

                  <button
                    disabled={carrito.length === 0}
                    className={`w-full py-3 rounded-lg font-bold transition ${
                      carrito.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    Comprar
                  </button>

                </div>

              </div>

            </aside>

          </div>

        </section>

      </div>
    </>
  );
}