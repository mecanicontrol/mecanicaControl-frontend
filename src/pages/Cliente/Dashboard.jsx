import { useAuth } from '../../context/AuthContext'

export default function DashboardCliente() {
  const { usuario } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            Bienvenido, {usuario?.nombre}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Panel de cliente</p>
        </div>
      </div>
    </div>
  )
}