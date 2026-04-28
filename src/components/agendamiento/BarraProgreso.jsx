import { useState } from "react";

export default function BarraProgreso() {
  const estados = [
    { valor: "FECHAYHORA", texto: "Fecha y hora" },
    { valor: "DATOS",      texto: "Datos"         },
    { valor: "CONFIRMADO", texto: "Confirmación"  },
  ];

  const [estadoActual] = useState("DATOS");

  const indiceActual = estados.findIndex(e => e.valor === estadoActual);

  return (
    <div className="w-full flex justify-center items-start pt-6 gap-56">
      {estados.map((estado, index) => (
        <div
          key={estado.valor}
          className={`w-10 h-10 rounded flex items-center justify-center font-bold text-white
            ${
              index === indiceActual
                ? "bg-orange-500"
                : "bg-gray-300"
            }`}
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
}