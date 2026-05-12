import AdminLayout from '../../components/admin/AdminLayout'
export default function Reportes() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Reportes</h2>
          <p className="text-gray-500 text-sm mt-0.5">Reportes e indicadores del taller</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Próximamente</p>
        </div>
      </div>
    </AdminLayout>
  )
}
