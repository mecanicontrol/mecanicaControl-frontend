import { Link } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Wrench, Package, BarChart, Phone, MapPin, FileText } from "lucide-react";
import { useState } from "react";

export default function InicioSesion({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  nombre,
  apellido,
  setNombre,
  setApellido,
  telefono,
  direccion,
  rut,
  setTelefono,
  setDireccion,
  setRut,
  esRegistro,
  error,
  cargando,
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
            {esRegistro ? "CREAR CUENTA" : "BIENVENIDO DE VUELTA"}
          </h1>

          <p className="text-center text-gray-500 text-sm mb-6">
            {esRegistro 
              ? "Completa los datos para registrarte"
              : "Ingresa tus credenciales para continuar"}
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

          {/* OPCIONES - solo login */}
          {!esRegistro && (
            <div className="flex justify-between items-center text-xs mb-5 text-gray-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Mantener sesión
              </label>

              <Link className="text-blue-600 font-semibold">
                ¿Olvidaste?
              </Link>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm text-center mb-4 bg-red-50 border border-red-200 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          {/* LINK LOGIN (cuando no es registro) */}
          {!esRegistro && (
            <p className="text-center text-sm text-gray-500 mt-2 mb-4">
              ¿Eres nuevo?{" "}
              <Link 
                to="/register"
                className="text-orange-500 font-semibold hover:underline"
              >
                Crear cuenta
              </Link>
            </p>
          )}

          {/* LINK VOLVER LOGIN (cuando es registro) */}
          {esRegistro && (
            <p className="text-center text-sm text-gray-500 mt-2 mb-4">
              ¿Ya tienes cuenta?{" "}
              <Link 
                to="/login"
                className="text-orange-500 font-semibold hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          )}

          {/* REGISTRO */}
          {esRegistro && (
            <>
              <div className="mb-4">
                <input
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="bg-gray-100 px-4 py-3 rounded-lg w-full"
                />
              </div>
              <div className="mb-4">
                <input
                  placeholder="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="bg-gray-100 px-4 py-3 rounded-lg w-full"
                />
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-xs font-semibold">
                  TELÉFONO
                </label>
                <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center mt-1">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="bg-transparent outline-none w-full text-sm"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-xs font-semibold">
                  DIRECCIÓN
                </label>
                <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center mt-1">
                  <MapPin size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Siempre Viva 742"
                    className="bg-transparent outline-none w-full text-sm"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-gray-500 text-xs font-semibold">
                  RUT
                </label>
                <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center mt-1">
                  <FileText size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="12.345.678-9"
                    className="bg-transparent outline-none w-full text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* BOTÓN */}
          <button
            onClick={handleLogin}
            disabled={cargando}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {esRegistro 
              ? (cargando ? 'Registrando...' : 'REGISTRARSE')
              : (cargando ? 'Ingresando...' : 'INICIAR SESIÓN')
            }
          </button>

        </div>
      </div>

    </div>
  );
}
