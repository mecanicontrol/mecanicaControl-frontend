import { useEffect, useState } from "react";
import SidebarCliente from "../../components/cliente/SidebarCliente";
import TopbarCliente from "../../components/cliente/TopbarCliente";
import { obtenerMisAgendamientos } from "../../services/agendamientoService";

export default function Agendamientos() {
  const [agendamientos, setAgendamientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAgendamientos();
  }, []);

  const cargarAgendamientos = async () => {
    try {
      const response = await obtenerMisAgendamientos();
      console.log(response.data);
      setAgendamientos(response.data);
    } catch (error) {
      console.error("Error cargando agendamientos:", error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarCliente />
        <div className="flex-1">
          <TopbarCliente />
          <main className="p-8">
            <h1 className="text-4xl font-black">Cargando agendamientos...</h1>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCliente />

      <div className="flex-1">
        <TopbarCliente />

        <main className="p-8">
          <h1 className="text-4xl font-black uppercase text-[#111827] mb-8">
            MIS AGENDAMIENTOS
          </h1>

          {agendamientos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-16 text-center">
              <h2 className="text-2xl font-bold text-gray-500">
                No tienes agendamientos registrados
              </h2>
            </div>
          ) : (
            <div className="grid gap-8">
              {agendamientos.map((ag) => {
                console.log("AG:", ag);

                return (
                  <div
                    key={ag.idAgendamiento}
                    className="bg-white rounded-2xl shadow overflow-hidden"
                  >
                    <div className="flex">
                      <div className="bg-orange-500 text-white p-8 w-[280px] flex flex-col justify-between">
                        <div>
                          <p className="uppercase text-sm tracking-widest">
                            Orden de trabajo
                          </p>

                          <h2 className="text-3xl font-black mt-2">
                            {ag.idAgendamiento?.slice(0, 8)}
                          </h2>
                        </div>

                        <div className="bg-orange-400 rounded-xl p-4 mt-8">
                          <p className="text-2xl font-black">
                            {formatearFecha(ag.fechaInicio)}
                          </p>

                          <p className="text-xl">
                            {formatearHora(ag.fechaInicio)}
                          </p>
                        </div>

                        <div>
                          <p className="uppercase text-sm tracking-widest mt-8">
                            Precio estimado
                          </p>

                          <p className="text-4xl font-black">
                            {ag.precioAcordado
                              ? `$${ag.precioAcordado.toLocaleString("es-CL")}`
                              : "Por definir"}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-4xl font-black text-[#111827]">
                              {ag.nombreServicio || "Servicio agendado"}
                            </h2>

                            <p className="text-gray-500 mt-2">
                              {[ag.marcaVehiculo, ag.modeloVehiculo, ag.anioVehiculo]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>

                            <p className="text-gray-500">
                              Patente: {ag.patenteVehiculo || "Sin patente"}
                            </p>
                          </div>

                          <span className="bg-orange-100 text-orange-500 px-5 py-2 rounded-full font-bold">
                            {typeof ag.estadoAgendamiento === "object"
                              ? ag.estadoAgendamiento?.nombre ||
                                ag.estadoAgendamiento?.descripcion ||
                                "PENDIENTE"
                              : ag.estadoAgendamiento || "PENDIENTE"}
                          </span>
                        </div>

                        <div className="bg-gray-100 rounded-xl p-5 border-l-4 border-orange-500">
                          <p className="font-bold text-[#111827] mb-2">
                            Técnico asignado
                          </p>

                          <p className="text-gray-600">
                            {ag.nombreTecnico || "Aún no asignado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}