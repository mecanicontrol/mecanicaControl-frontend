import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { ShoppingCart, Plus, Minus, Trash2, Package, Search, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import imgAceite       from "../../assets/tienda/aceite.jpg";
import imgFrenos       from "../../assets/tienda/frenos.jpg";
import imgBateria      from "../../assets/tienda/bateria.jpg";
import imgFiltroAire   from "../../assets/tienda/filtro-aire.jpg";
import imgFiltroAceite from "../../assets/tienda/filtro-aceite.jpg";
import imgHerramientas from "../../assets/tienda/herramientas.jpg";
import imgShampoo      from "../../assets/tienda/shampoo.jpg";
import imgRefrigerante from "../../assets/tienda/refrigerante.jpg";
import imgPlumillas    from "../../assets/tienda/plumillas.jpg";

const IMAGEN_POR_CATEGORIA = {
  "aceites":       imgAceite,
  "lubricantes":   imgAceite,
  "refrigeración": imgRefrigerante,
  "refrigerantes": imgRefrigerante,
  "frenos":        imgFrenos,
  "baterias":      imgBateria,
  "baterías":      imgBateria,
  "eléctrico":     imgBateria,
  "electrico":     imgBateria,
  "filtros":       imgFiltroAire,
  "limpieza":      imgShampoo,
  "accesorios":    imgPlumillas,
  "herramientas":  imgHerramientas,
  "neumaticos":    imgFrenos,
  "neumáticos":    imgFrenos,
  "encendido":     imgFiltroAceite,
  "correas":       imgFiltroAceite,
  "suspensión":    imgFrenos,
  "suspension":    imgFrenos,
  "escape":        imgFrenos,
  "embrague":      imgFrenos,
  "consumibles":   imgAceite,
};

const IMAGEN_DEFECTO = imgHerramientas;

function imagenParaCategoria(categoria) {
  if (!categoria) return IMAGEN_DEFECTO;
  const key = categoria.toLowerCase().trim();
  return IMAGEN_POR_CATEGORIA[key] ?? IMAGEN_DEFECTO;
}

function formatCLP(valor) {
  const num = typeof valor === "number" ? valor : parseFloat(valor ?? 0);
  return num.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  );
}

export default function Tienda() {
  const navigate = useNavigate();
  const [categoriaActiva, setCategoriaActiva] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito]   = useState([]);
  const [productos, setProductos]   = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState(null);
  const [pagina, setPagina]         = useState(1);
  const POR_PAGINA = 6;

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/api/tienda/productos"),
        api.get("/api/tienda/categorias"),
      ]);
      setProductos(prodRes.data);
      setCategorias(["TODOS", ...catRes.data]);
    } catch {
      setError("No se pudo cargar el catálogo. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const productosFiltrados = useMemo(() => productos.filter((p) => {
    const coincideCategoria =
      categoriaActiva === "TODOS" || p.categoria === categoriaActiva;
    const q = busqueda.toLowerCase();
    const coincideBusqueda = !busqueda ||
      p.nombre.toLowerCase().includes(q) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
      p.categoria.toLowerCase().includes(q) ||
      (p.marca && p.marca.toLowerCase().includes(q));
    return coincideCategoria && coincideBusqueda;
  }), [productos, categoriaActiva, busqueda]);

  const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA);
  const productosPagina = productosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // Reset a página 1 cuando cambia filtro o búsqueda
  useEffect(() => { setPagina(1); }, [categoriaActiva, busqueda]);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev;
        return prev.map((i) => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const aumentarCantidad = (id) => {
    setCarrito((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      if (i.cantidad >= i.stock) return i;
      return { ...i, cantidad: i.cantidad + 1 };
    }));
  };

  const disminuirCantidad = (id) => {
    setCarrito((prev) =>
      prev.map((i) => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i)
          .filter((i) => i.cantidad > 0)
    );
  };

  const eliminarProducto = (id) => setCarrito((prev) => prev.filter((i) => i.id !== id));

  const total = carrito.reduce((acc, i) => acc + parseFloat(i.precioVenta ?? 0) * i.cantidad, 0);

  const btnFiltro = (cat) =>
    categoriaActiva === cat
      ? "bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow"
      : "bg-white text-gray-800 px-5 py-2 rounded-lg text-sm font-semibold shadow hover:bg-orange-100 transition";

  const enCarrito = (id) => carrito.find((i) => i.id === id);

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
          <div className="absolute inset-0 bg-blue-950/85" />
          <div className="relative z-10 text-center">
            <p className="text-xs uppercase tracking-[3px] mb-3">
              <span className="text-orange-500 font-semibold">Inicio</span>
              <span className="text-gray-300 mx-2">›</span>
              <span className="text-white">Tienda</span>
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
              {cargando
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
                  ))
                : categorias.map((cat) => (
                    <button key={cat} onClick={() => setCategoriaActiva(cat)} className={btnFiltro(cat)}>
                      {cat}
                    </button>
                  ))}
            </div>

            <div className="relative w-full lg:w-[320px]">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos, marcas..."
                className="w-full bg-white border border-gray-200 rounded-md py-3 pl-10 pr-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

          </div>
        </section>

        {/* CONTENIDO */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* PRODUCTOS */}
            <div className="lg:col-span-3">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
                  <p>{error}</p>
                  <button onClick={cargarDatos} className="mt-3 text-sm underline">Reintentar</button>
                </div>
              )}

              {cargando && (
                <div className="grid md:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {!cargando && !error && productosFiltrados.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <Package size={48} className="mb-4 opacity-30" />
                  <p className="text-lg font-semibold">Sin productos disponibles</p>
                  <p className="text-sm mt-1">
                    {busqueda || categoriaActiva !== "TODOS"
                      ? "Prueba con otro filtro o búsqueda."
                      : "El catálogo está vacío por el momento."}
                  </p>
                </div>
              )}

              {!cargando && !error && productosFiltrados.length > 0 && (
                <>
                <div className="grid md:grid-cols-3 gap-8">
                  {productosPagina.map((producto) => {
                    const itemCarrito = enCarrito(producto.id);
                    const sinStock = producto.stock <= 0;
                    return (
                      <div
                        key={producto.id}
                        className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition flex flex-col"
                      >
                        <div className="relative">
                          <img
                            src={imagenParaCategoria(producto.categoria)}
                            alt={producto.nombre}
                            className="w-full h-48 object-cover"
                          />
                          {producto.marca && (
                            <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full shadow">
                              {producto.marca}
                            </span>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded w-fit flex items-center gap-1">
                            <Tag size={10} />
                            {producto.categoria}
                          </span>

                          <h3 className="text-lg font-black mt-4 mb-1 leading-tight antialiased">
                            {producto.nombre}
                          </h3>

                          {producto.sku && (
                            <p className="text-xs text-gray-400 mb-2 font-mono">SKU: {producto.sku}</p>
                          )}

                          <p className="text-gray-500 text-sm leading-6 mb-4 flex-1">
                            {producto.descripcion || "Sin descripción disponible."}
                          </p>

                          <p className="text-2xl font-black text-blue-950 mb-5">
                            {formatCLP(producto.precioVenta)}
                          </p>

                          {sinStock ? (
                            <button disabled className="w-full bg-gray-200 text-gray-400 py-2 rounded-lg font-semibold cursor-not-allowed">
                              Sin stock
                            </button>
                          ) : itemCarrito ? (
                            <div className="flex items-center justify-between border border-orange-300 rounded-lg px-3 py-2">
                              <button
                                onClick={() => disminuirCantidad(producto.id)}
                                className="w-7 h-7 rounded bg-orange-100 flex items-center justify-center hover:bg-orange-200"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold text-blue-950">{itemCarrito.cantidad}</span>
                              <button
                                onClick={() => aumentarCantidad(producto.id)}
                                disabled={itemCarrito.cantidad >= producto.stock}
                                className="w-7 h-7 rounded bg-orange-100 flex items-center justify-center hover:bg-orange-200 disabled:opacity-40"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => agregarAlCarrito(producto)}
                              className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                            >
                              <ShoppingCart size={18} />
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Paginación ── */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between mt-10">
                    <p className="text-sm text-gray-500">
                      Mostrando{" "}
                      <span className="font-bold text-gray-700">
                        {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, productosFiltrados.length)}
                      </span>{" "}
                      de <span className="font-bold text-gray-700">{productosFiltrados.length}</span> productos
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setPagina((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={pagina === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => { setPagina(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition border ${
                            n === pagina
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-300"
                          }`}
                        >
                          {n}
                        </button>
                      ))}

                      <button
                        onClick={() => { setPagina((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={pagina === totalPaginas}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>

            {/* CARRITO */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow p-6 sticky top-6">

                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white relative">
                    <ShoppingCart size={22} />
                    {carrito.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-950 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {carrito.reduce((a, i) => a + i.cantidad, 0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-black text-blue-950">Carrito</h2>
                    <p className="text-xs text-gray-400">Resumen de compra</p>
                  </div>
                </div>

                {carrito.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Aún no agregas productos.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {carrito.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{item.nombre}</p>
                            <p className="text-sm font-bold text-orange-500 mt-1">
                              {formatCLP(item.precioVenta)}
                            </p>
                          </div>
                          <button onClick={() => eliminarProducto(item.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
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
                            <span className="text-sm font-bold">{item.cantidad}</span>
                            <button
                              onClick={() => aumentarCantidad(item.id)}
                              disabled={item.cantidad >= item.stock}
                              className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-black text-blue-950">
                            {formatCLP(parseFloat(item.precioVenta ?? 0) * item.cantidad)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 mt-6 pt-5">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Subtotal</span>
                    <span>{formatCLP(total)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-blue-950 mb-5">
                    <span>Total</span>
                    <span>{formatCLP(total)}</span>
                  </div>
                  <button
                    disabled={carrito.length === 0}
                    onClick={() => navigate("/tienda/checkout", { state: { carrito } })}
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
