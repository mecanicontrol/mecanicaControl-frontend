import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function InicioSesion() {

  return(
    <div className="flex justify-center items-center h-full">

      <div className="w-full max-w-md bg-gray-100 p-8 rounded border border-gray-300">

        {/* TITULO */}
        <h1 className="text-3xl font-black text-center mb-2">
          INICIO DE SESION
        </h1>

        <p className="text-center text-gray-600 text-sm mb-6">
          Ingresa para acceder a todas las funciones.
        </p>

        {/* CORREO */}
        <div className="mb-4">
          <label className="text-[oklch(21%_0.006_285.885)]">CORREO ELECTRÓNICO</label>

          <div className="bg-gray-200 p-2 rounded flex items-center mt-1">
            <span className="mr-2">📧</span>
            <input
              type="email"
              placeholder="nombre@taller.cl"
              className="bg-transparent outline-none w-full"
            />
          </div>
        </div>

        {/* CONTRASEÑA */}
        <div className="mb-4">
          <label className="oklch(21% 0.006 285.885)">CONTRASEÑA</label>

          <div className="bg-gray-200 p-2 rounded flex items-center mt-1">
            <Lock size={16} className="oklch(14.1% 0.005 285.823)" />
            <input
              type="password"
              placeholder="********"
              className="bg-transparent outline-none w-full"
            />
            <span className="text-gray-400">👁️</span>
          </div>
        </div>

        {/* OPCIONES */}
        <div className="flex justify-between items-center text-xs mb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Mantener sesión iniciada
          </label>

          <Link className="text-blue-600 font-semi-bold text-xs">
            ¿Olvidaste contraseña?
          </Link>
        </div>

        {/* BOTON */}
        <button className="w-full bg-orange-500 text-white py-2 rounded font-semibold">
          INICIAR SESIÓN
        </button>

      </div>

    </div>
  )
}