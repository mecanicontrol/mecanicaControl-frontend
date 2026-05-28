import { useEffect, useState } from "react";
import SidebarCliente from "../../components/cliente/SidebarCliente";
import TopbarCliente from "../../components/cliente/TopbarCliente";
import { obtenerMisAgendamientos } from "../../services/agendamientoService";

export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const res = await obtenerMisAgendamientos();

      const completados = (res.data || []).filter(
        (ag) =>
          ag.estadoAgendamiento?.nombre === "COMPLETADO" ||
          ag.estadoAgendamiento === "COMPLETADO"
      );

      setHistorial(completados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarCliente />
        <div className="flex-1">
          <TopbarCliente />
          <div className="p-10 text-2xl font-bold">Cargando historial...</div>
        </div>
      </div>
    );
  }

  const principal = historial[0];
  const recientes = historial.slice(1);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCliente />

      <div className="flex-1">
        <TopbarCliente />

        <main className="p-8">
          <h1 className="text-5xl font-black uppercase text-slate-900 mb-8">
            Historial de Servicios
          </h1>

          {historial.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-500">
                No tienes servicios completados todavía
              </h2>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow p-8 border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-black text-slate-900">
                        {principal.idAgendamiento?.slice(0, 8)}
                      </h2>

                      <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold text-sm">
                        COMPLETADO
                      </span>
                    </div>

                    <p className="text-gray-500 mt-2">
                      {new Date(principal.fechaInicio).toLocaleDateString("es-CL")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-500 uppercase text-sm">Costo Total</p>
                    <p className="text-4xl font-black text-orange-500">
                      $
                      {principal.precioAcordado
                        ? principal.precioAcordado.toLocaleString("es-CL")
                        : "Por definir"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                        🚗
                      </div>

                      <div>
                        <p className="text-gray-400 uppercase text-xs font-bold tracking-wider">
                          Vehículo
                        </p>

                        <h3 className="text-2xl font-black text-slate-900">
                          {principal.marcaVehiculo} {principal.modeloVehiculo}
                        </h3>

                        <p className="text-gray-500 font-medium">
                          Patente: {principal.patenteVehiculo}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                        👨‍🔧
                      </div>

                      <div>
                        <p className="text-gray-400 uppercase text-xs font-bold tracking-wider">
                          Técnico asignado
                        </p>

                        <h3 className="text-2xl font-black text-slate-900">
                          {principal.nombreTecnico || "No asignado"}
                        </h3>

                        <p className="text-gray-500 font-medium">
                          Servicio completado
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
                    <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-5">
                      Servicio realizado
                    </p>

                    <div className="bg-gray-50 px-4 py-4 rounded-xl">
                      <p className="font-semibold text-slate-700">
                        {principal.nombreServicio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-black uppercase text-slate-900 mb-6">
                  Historial Reciente
                </h3>

                <div className="space-y-4">
                  {recientes.map((item) => (
                    <div
                      key={item.idAgendamiento}
                      className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="text-xl font-bold">
                          {item.idAgendamiento?.slice(0, 8)}
                        </h4>

                        <p className="text-lg">
                          {item.marcaVehiculo} {item.modeloVehiculo}
                        </p>

                        <p className="text-gray-500">{item.nombreServicio}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <p className="text-2xl font-black text-slate-900">
                          $
                          {item.precioAcordado
                            ? item.precioAcordado.toLocaleString("es-CL")
                            : "Por definir"}
                        </p>

                        <button className="border border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold">
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}