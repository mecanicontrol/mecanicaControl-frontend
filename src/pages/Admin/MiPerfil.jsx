import AdminLayout from '../../components/admin/AdminLayout'
import PerfilUsuario from '../../components/perfil/PerfilUsuario'
import BccAdminsConfig from '../../components/admin/BccAdminsConfig'
import CapacidadTallerConfig from '../../components/admin/CapacidadTallerConfig'

export default function MiPerfil() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Mi Perfil</h2>
          <p className="text-gray-500 text-sm mt-0.5">Datos personales y seguridad</p>
        </div>
        <PerfilUsuario />
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-wide mb-3">Configuración del sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BccAdminsConfig />
            <CapacidadTallerConfig />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}