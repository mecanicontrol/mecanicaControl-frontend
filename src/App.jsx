
//Configuracion de Rutas

import { BrowserRouter,Route,Routes } from "react-router-dom";
import Home from './pages/Home'
import Cotizador from './pages/Publico/Cotizador'
import Login from "./pages/Publico/Login";


function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/cotizador" element={<Cotizador />} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App