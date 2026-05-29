import { useState } from "react";
import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, User, Wrench, Clock } from "lucide-react";

const ordenes = {
  "OT-2026-0011": {
    cliente: "Claudio Mohr",
    vehiculo: "Toyota Hilux 2023",
    servicio: "Revision sistema electrico",
    estado: "En proceso",
    progreso: 60,
  },
  "OT-2026-0012": {
    cliente: "Maria Gonzalez",
    vehiculo: "Chevrolet Silverado",
    servicio: "Diagnostico electronico",
    estado: "Pendiente",
    progreso: 20,
  },
  "OT-2026-0013": {
    cliente: "Juan Perez",
    vehiculo: "Ford Ranger",
    servicio: "Mantencion preventiva",
    estado: "Completada",
    progreso: 100,
  },
};

export default function DetalleOrden() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const base = ordenes[codigo] || ordenes["OT-2026-0011"];

  const [estado, setEstado] = useState(
    localStorage.getItem(`estado-${codigo}`) || base.estado
  );

  const [progreso, setProgreso] = useState(
    Number(localStorage.getItem(`progreso-${codigo}`)) || base.progreso
  );

  const [diagnostico, setDiagnostico] = useState(
    localStorage.getItem(`diagnostico-${codigo}`) ||
      "Se detecto una falla intermitente. Se recomienda revisar el sistema correspondiente."
  );

  const [mensaje, setMensaje] = useState("");

  const avisar = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 2500);
  };

  const guardarDiagnostico = () => {
    localStorage.setItem(`diagnostico-${codigo}`, diagnostico);
    avisar("Diagnostico guardado correctamente.");
  };

  const actualizarEstado = () => {
    let nuevoEstado = "";
    let nuevoProgreso = 0;

    if (estado === "Pendiente") {
      nuevoEstado = "En proceso";
      nuevoProgreso = 60;
    } else if (estado === "En proceso") {
      nuevoEstado = "Completada";
      nuevoProgreso = 100;
    } else {
      nuevoEstado = "Pendiente";
      nuevoProgreso = 20;
    }

    setEstado(nuevoEstado);
    setProgreso(nuevoProgreso);

    localStorage.setItem(`estado-${codigo}`, nuevoEstado);
    localStorage.setItem(`progreso-${codigo}`, nuevoProgreso);

    avisar(`Estado actualizado a ${nuevoEstado}.`);
  };

  const finalizarOT = () => {
    const confirmar = window.confirm("¿Deseas finalizar esta orden de trabajo?");
    if (!confirmar) return;

    setEstado("Completada");
    setProgreso(100);

    localStorage.setItem(`estado-${codigo}`, "Completada");
    localStorage.setItem(`progreso-${codigo}`, 100);

    avisar("Orden de trabajo finalizada correctamente.");
  };

  const colorEstado =
    estado === "Completada"
      ? "text-green-600"
      : estado === "Pendiente"
      ? "text-gray-600"
      : "text-orange-600";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarTecnico />

      <div className="flex-1">
        <TopbarTecnico />

        <main className="p-8">
          {mensaje && (
            <div className="mb-6 bg-green-100 text-green-700 px-6 py-4 rounded-xl font-black">
              {mensaje}
            </div>
          )}

          <button
            onClick={() => navigate("/tecnico/ordenes")}
            className="flex items-center gap-2 text-orange-500 font-black mb-6"
          >
            <ArrowLeft size={20} />
            Volver a ordenes
          </button>

          <div className="mb-8">
            <p className="text-orange-500 font-black tracking-widest text-xs uppercase">
              Terminal / Ordenes / Detalle
            </p>

            <h1 className="text-5xl font-black text-slate-900 mt-3">
              {codigo}
            </h1>

            <p className="text-gray-500 mt-2">
              Informacion detallada de la orden de trabajo.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-8">
              <div className="bg-white rounded-2xl shadow p-8">
                <h2 className="text-2xl font-black mb-6">
                  Informacion General
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <Card icon={<Car />} titulo="Vehiculo" valor={base.vehiculo} />
                  <Card icon={<User />} titulo="Cliente" valor={base.cliente} />
                  <Card icon={<Wrench />} titulo="Servicio" valor={base.servicio} />
                  <Card
                    icon={<Clock />}
                    titulo="Estado"
                    valor={estado}
                    color={colorEstado}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-8">
                <h2 className="text-2xl font-black mb-6">
                  Diagnostico Tecnico
                </h2>

                <textarea
                  rows={8}
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl p-5 outline-none"
                />

                <button
                  onClick={guardarDiagnostico}
                  className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black"
                >
                  Guardar Diagnostico
                </button>
              </div>
            </div>

            <div className="col-span-4 space-y-8">
              <div className="bg-white rounded-2xl shadow p-8">
                <h2 className="text-2xl font-black mb-6">Progreso</h2>

                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: progreso + "%" }}
                  ></div>
                </div>

                <p className="text-4xl font-black mt-5">{progreso}%</p>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl shadow p-8">
                <h2 className="text-2xl font-black mb-6">Acciones</h2>

                <button
                  onClick={actualizarEstado}
                  className="w-full bg-orange-500 hover:bg-orange-600 py-4 rounded-xl font-black mb-4"
                >
                  Actualizar Estado
                </button>

                <button
                  onClick={finalizarOT}
                  className="w-full bg-white text-slate-900 hover:bg-gray-100 py-4 rounded-xl font-black"
                >
                  Finalizar OT
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Card({ icon, titulo, valor, color = "text-slate-900" }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 flex gap-4">
      <div className="text-orange-500">{icon}</div>

      <div>
        <p className="text-sm text-gray-500">{titulo}</p>
        <p className={`font-black ${color}`}>{valor}</p>
      </div>
    </div>
  );
}