import { useEffect, useState, useCallback } from "react";
import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { obtenerInventarioTecnico } from "../../services/tecnicoService";
import { Search, Package, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 30;

export default function InventarioTecnico() {
  const [productos,  setProductos]  = useState([]);
  const [total,      setTotal]      = useState(0);
  const [cargando,   setCargando]   = useState(true);
  const [busqueda,   setBusqueda]   = useState("");
  const [page,       setPage]       = useState(0);
  const [busqTimeout, setBusqTimeout] = useState(null);

  const cargar = useCallback(async (q, pg) => {
    setCargando(true);
    try {
      const { data } = await obtenerInventarioTecnico({ q, page: pg, size: PAGE_SIZE });
      setProductos(data);
      setTotal(data.length > 0 ? (data[0]?.total ?? data.length) : 0);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar("", 0);
  }, [cargar]);

  const handleBusqueda = (valor) => {
    setBusqueda(valor);
    setPage(0);
    clearTimeout(busqTimeout);
    setBusqTimeout(setTimeout(() => cargar(valor, 0), 350));
  };

  const handlePage = (nueva) => {
    setPage(nueva);
    cargar(busqueda, nueva);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const sinStock   = productos.filter((p) => p.stock <= 0).length;
  const stockBajo  = productos.filter((p) => p.stock > 0 && p.stock <= p.stockMin).length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarTecnico />
      <div className="flex-1">
        <TopbarTecnico />
        <main className="p-8">
          {/* Encabezado */}
          <div className="mb-8">
            <p className="text-orange-500 font-black tracking-widest text-xs uppercase">
              Terminal / Inventario
            </p>
            <h1 className="text-4xl font-black text-slate-900 mt-2">INVENTARIO</h1>
            <p className="text-gray-500 mt-1 text-sm">Consulta el stock de repuestos y materiales disponibles en el taller</p>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Productos activos"
              valor={total}
              color="text-slate-900"
            />
            <StatCard
              label="Stock bajo"
              valor={stockBajo}
              color="text-amber-600"
              icono={<AlertTriangle size={16} className="text-amber-500" />}
            />
            <StatCard
              label="Sin stock"
              valor={sinStock}
              color="text-red-600"
              icono={<AlertTriangle size={16} className="text-red-500" />}
            />
          </div>

          {/* Buscador */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="relative max-w-xl">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busqueda}
                onChange={(e) => handleBusqueda(e.target.value)}
                placeholder="Buscar por nombre de producto..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-400 text-sm"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-black text-slate-900 uppercase text-sm tracking-wider">
                {busqueda ? `Resultados para "${busqueda}"` : "Todos los productos"}
              </h2>
              <span className="text-xs text-gray-400 font-black">{productos.length} mostrando · {total} total</span>
            </div>

            {cargando ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 animate-pulse font-black">Cargando inventario...</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="p-12 text-center">
                <Package size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-black">
                  {busqueda ? `Sin resultados para "${busqueda}"` : "No hay productos en el inventario aún"}
                </p>
                {!busqueda && (
                  <p className="text-gray-500 text-xs mt-2">El administrador debe cargar los productos desde el módulo de Inventario</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-black uppercase text-gray-400 tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase text-gray-400 tracking-wider">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase text-gray-400 tracking-wider">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase text-gray-400 tracking-wider">Marca</th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase text-gray-400 tracking-wider">Precio</th>
                      <th className="px-4 py-3 text-center text-xs font-black uppercase text-gray-400 tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase text-gray-400 tracking-wider">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productos.map((p) => {
                      const sinStock = p.stock <= 0;
                      const bajStock = p.stock > 0 && p.stock <= p.stockMin;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <p className="font-black text-slate-900">{p.nombre}</p>
                            {p.descripcion && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{p.descripcion}</p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-600 font-mono text-xs">
                            {p.sku || "—"}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {p.categoria || "—"}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {p.marca || "—"}
                          </td>
                          <td className="px-4 py-4 text-right font-black text-slate-900">
                            ${parseFloat(p.precio || 0).toLocaleString("es-CL")}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                              sinStock
                                ? "bg-red-100 text-red-700"
                                : bajStock
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {sinStock && <AlertTriangle size={10} />}
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-xs">
                            {p.ubicacion || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm transition"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="text-sm font-black text-gray-500">
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  onClick={() => handlePage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm transition"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, valor, color, icono }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center gap-2 mb-2">
        {icono}
        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">{label}</p>
      </div>
      <h3 className={`text-4xl font-black ${color}`}>{valor}</h3>
    </div>
  );
}
