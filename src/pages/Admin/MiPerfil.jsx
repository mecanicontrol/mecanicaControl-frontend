import AdminLayout from '../../components/admin/AdminLayout'
import PerfilUsuario from '../../components/perfil/PerfilUsuario'

export default function MiPerfil() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Mi Perfil</h2>
          <p className="text-gray-500 text-sm mt-0.5">Datos personales y seguridad</p>
        </div>
        <PerfilUsuario />
      </div>
    </AdminLayout>
  )
}
