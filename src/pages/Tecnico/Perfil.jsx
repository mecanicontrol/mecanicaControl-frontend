import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import PerfilTecnico from "../../components/Tecnico/PerfilTecnico";

export default function TecnicoPerfil() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <SidebarTecnico />

      <div className="flex-1">
        <TopbarTecnico />
        <PerfilTecnico />
      </div>
    </div>
  );
}