
//Configuracion de Rutas

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from './context/AuthContext'
import Home         from './pages/Home'
import Cotizador    from './pages/Publico/Cotizador'
import Login        from './pages/Publico/Login'
import Agendamiento from './pages/Publico/Agendamiento'
import Register from "./pages/Publico/Register";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Home />}         />
          <Route path="/cotizador" element={<Cotizador />}   />
          <Route path="/login"    element={<Login />}        />
          <Route path="/agendar"  element={<Agendamiento />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App