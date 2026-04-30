import { Link } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Wrench, Package, BarChart } from "lucide-react";
import { useState } from "react";

export default function InicioSesion({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">

      {/* IZQUIERDA */}
      <div className="w-[45%] bg-gradient-to-b from-gray-900 to-black text-white flex flex-col justify-center p-12">

        <h1 className="text-5xl font-black mb-6 leading-tight">
          GESTIÓN <br />
          <span className="text-orange-500">PROFESIONAL</span><br />
          PARA TU TALLER
        </h1>

        <p className="text-gray-400 mb-10 text-lg">
          Controla todo tu taller de forma fácil y rápida.
        </p>

        <div className="space-y-8">

          <div className="flex items-start gap-4">
            <div className="bg-orange-500/10 p-2 rounded-md">
              <Wrench size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-300 tracking-widest font-semibold">
                CONTROL DE PRECISIÓN
              </p>
              <p className="text-base text-gray-400">
                Órdenes de trabajo digitales con seguimiento en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-orange-500/10 p-2 rounded-md">
              <Package size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 tracking-widest font-semibold">
                STOCK INTELIGENTE
              </p>
              <p className="text-sm text-gray-300">
                Gestión de inventario automatizada y alertas de reposición.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-orange-500/10 p-2 rounded-md">
              <BarChart size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 tracking-widest font-semibold">
                MÉTRICAS DE RENDIMIENTO
              </p>
              <p className="text-sm text-gray-300">
                Dashboard con KPIs de productividad y rentabilidad.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* DERECHA */}
      <div className="w-[55%] flex justify-center items-center bg-gray-100 px-6">

        <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl">

          <h1 className="text-3xl font-bold text-center mb-2">
            BIENVENIDO DE VUELTA
          </h1>

          <p className="text-center text-gray-500 text-sm mb-6">
            Ingresa tus credenciales para continuar
          </p>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-gray-500 text-xs font-semibold">
              CORREO ELECTRÓNICO
            </label>

            <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center mt-1">
              <Mail size={16} className="text-gray-400 mr-2" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@taller.cl"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label className="text-gray-500 text-xs font-semibold">
              CONTRASEÑA
            </label>

            <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center mt-1">

              <Lock size={16} className="text-gray-400 mr-2" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="bg-transparent outline-none w-full"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

            </div>
          </div>

          {/* OPCIONES */}
          <div className="flex justify-between items-center text-xs mb-5 text-gray-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Mantener sesión
            </label>

            <Link className="text-blue-600 font-semibold">
              ¿Olvidaste?
            </Link>
          </div>

          {/* BOTÓN */}
          <button 
            onClick={handleLogin}
            className="w-full bg-orange-500 ..."
          >
            INICIAR SESIÓN
          </button>

        </div>
      </div>

    </div>
  );
}