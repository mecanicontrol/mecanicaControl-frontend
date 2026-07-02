import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider }   from './context/AuthContext'
import RutaProtegida      from './components/shared/RutaProtegida'
import Home               from './pages/Home'
import Cotizador          from './pages/Publico/Cotizador'
import Login              from './pages/Publico/Login'
import Register           from './pages/Publico/Register'
import Agendamiento       from './pages/Publico/Agendamiento'
import Seguimiento        from './pages/Publico/Seguimiento'
import Servicios          from './pages/Publico/Servicios'
import Tienda             from './pages/Publico/Tienda'
import MisVehiculos       from './pages/Cliente/MisVehiculos'
import DashboardCliente      from './pages/Cliente/Dashboard'
import Historial             from './pages/Cliente/Historial'
import AgendamientosCliente  from './pages/Cliente/Agendamientos'
import PerfilCliente         from './pages/Cliente/Perfil'
import DetalleVehiculo       from './pages/Cliente/DetalleVehiculo'
import VerificarEmail      from './pages/Publico/VerificarEmail'
import Checkout            from './pages/Publico/Checkout'
import ConfirmacionCompra  from './pages/Publico/ConfirmacionCompra'
import ConfirmarDiagnostico from './pages/Publico/ConfirmarDiagnostico'
import SeguimientoDetalle  from './pages/Cliente/SeguimientoDetalle'
import MiTienda            from './pages/Admin/MiTienda'
import VerTienda           from './pages/Admin/VerTienda'
import Perfil             from './pages/Publico/Perfil'
import TecnicoPerfil      from './pages/Tecnico/Perfil'
import TecnicoDashboard   from './pages/Tecnico/Dashboard'
import OrdenesTecnico     from './pages/Tecnico/Ordenes'
import DetalleOrden       from './pages/Tecnico/DetalleOrden'
import InventarioTecnico  from './pages/Tecnico/Inventario'

import Dashboard          from './pages/Admin/Dashboard'
import Agendamientos      from './pages/Admin/Agendamientos'
import OrdenesTrabajo     from './pages/Admin/OrdenesTrabajo'
import Inventario         from './pages/Admin/Inventario'
import Clientes           from './pages/Admin/Clientes'
import Tecnicos           from './pages/Admin/Tecnicos'
import Reportes           from './pages/Admin/Reportes'
import Catalogos          from './pages/Admin/Catalogos'
import Usuarios           from './pages/Admin/Usuarios'
import Configuracion      from './pages/Admin/Configuracion'
import MiPerfil           from './pages/Admin/MiPerfil'
import Propuestas         from './pages/Admin/Propuestas'
import ControlCalidad     from './pages/Admin/ControlCalidad'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/"            element={<Home />}         />
          <Route path="/cotizador"   element={<Cotizador />}    />
          <Route path="/login"       element={<Login />}        />
          <Route path="/register"    element={<Register />}     />
          <Route path="/agendar"      element={<Agendamiento />} />
          <Route path="/seguimiento"  element={<Seguimiento />}  />
          <Route path="/servicios"    element={<Servicios />}   />
          <Route path="/tienda"      element={<Tienda />}      />
          <Route path="/perfil"      element={<Perfil />}       />
          <Route path="/verificar-email"           element={<VerificarEmail />} />
          <Route path="/tienda/checkout"            element={<Checkout />} />
          <Route path="/tienda/confirmacion"        element={<ConfirmacionCompra />} />
          <Route path="/confirmar-diagnostico/:token" element={<ConfirmarDiagnostico />} />
          <Route path="/tecnico/perfil"    element={<RutaProtegida rolesPermitidos={['TECNICO']}><TecnicoPerfil /></RutaProtegida>} />
          <Route path="/tecnico/dashboard" element={<RutaProtegida rolesPermitidos={['TECNICO']}><TecnicoDashboard /></RutaProtegida>} />
          <Route path="/tecnico/ordenes"   element={<RutaProtegida rolesPermitidos={['TECNICO']}><OrdenesTecnico /></RutaProtegida>} />
          <Route path="/tecnico/ordenes/:codigo" element={<RutaProtegida rolesPermitidos={['TECNICO']}><DetalleOrden /></RutaProtegida>} />
          <Route path="/tecnico/inventario" element={<RutaProtegida rolesPermitidos={['TECNICO']}><InventarioTecnico /></RutaProtegida>} />

          {/* Cliente */}
          <Route
            path="/mis-vehiculos"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE', 'ADMIN']}>
                <MisVehiculos />
              </RutaProtegida>
            }
          />
          <Route
            path="/cliente/dashboard"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE', 'ADMIN']}>
                <DashboardCliente />
              </RutaProtegida>
            }
          />
          <Route
            path="/cliente/historial"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE', 'ADMIN']}>
                <Historial />
              </RutaProtegida>
            }
          />
          <Route
            path="/cliente/agendamientos"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE', 'ADMIN']}>
                <AgendamientosCliente />
              </RutaProtegida>
            }
          />
          <Route
            path="/cliente/perfil"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE', 'ADMIN']}>
                <PerfilCliente />
              </RutaProtegida>
            }
          />
          <Route
            path="/cliente/vehiculo/:id"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE', 'ADMIN']}>
                <DetalleVehiculo />
              </RutaProtegida>
            }
          />
          <Route
            path="/cliente/seguimiento/:id"
            element={
              <RutaProtegida rolesPermitidos={['CLIENTE', 'ADMIN']}>
                <SeguimientoDetalle />
              </RutaProtegida>
            }
          />
          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Dashboard />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/agendamientos"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Agendamientos />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/ot"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <OrdenesTrabajo />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/inventario"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Inventario />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/clientes"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Clientes />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/tecnicos"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Tecnicos />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/reportes"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Reportes />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/catalogos"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Catalogos />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/usuarios"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Usuarios />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/configuracion"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Configuracion />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/mi-perfil"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <MiPerfil />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/propuestas"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <Propuestas />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/control-calidad"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <ControlCalidad />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/mi-tienda"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <MiTienda />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/ver-tienda"
            element={
              <RutaProtegida rolesPermitidos={['ADMIN']}>
                <VerTienda />
              </RutaProtegida>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App