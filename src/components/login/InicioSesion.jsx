import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function InicioSesion({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin
}) {

  return(
    <div className="min-h-screen flex">

      {/* IZQUIERDA */}
      <div className="w-1/2 bg-gray-900 text-white flex flex-col justify-center p-10">

        <h1 className="text-4xl font-black mb-6">
          GESTIÓN <br />
          <span className="text-orange-500">PROFESIONAL</span><br />
          PARA TU TALLER
        </h1>

        <p className="text-gray-300 mb-6">
          Controla todo tu taller de forma fácil y rápida.
        </p>

        <div className="text-sm text-gray-400 space-y-2">
          <p>✔ Órdenes de trabajo en tiempo real</p>
          <p>✔ Control de inventario</p>
          <p>✔ Métricas y reportes</p>
        </div>

      </div>

      {/* DERECHA (TU LOGIN ORIGINAL) */}
      <div className="w-1/2 flex justify-center items-center bg-gray-100">

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
            <label className="text-gray-600 text-xs font-semibold">
              CORREO ELECTRÓNICO
            </label>

            <div className="bg-gray-200 p-2 rounded flex items-center mt-1">
              <span className="mr-2 text-gray-500">📧</span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@taller.cl"
                className="bg-transparent outline-none w-full"
              />
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div className="mb-4">
            <label className="text-gray-600 text-xs font-semibold">
              CONTRASEÑA
            </label>

            <div className="bg-gray-200 p-2 rounded flex items-center mt-1">
              <Lock size={16} className="text-gray-500 mr-2" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <Link className="text-blue-600 font-semibold text-xs">
              ¿Olvidaste contraseña?
            </Link>
          </div>

          {/* BOTON */}
          <button 
            onClick={handleLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold"
          >
            INICIAR SESIÓN
          </button>

        </div>

      </div>

    </div>
  )
}