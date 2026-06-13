import { useEffect, useState } from "react";

export default function TopbarTecnico() {
  const [foto, setFoto] = useState("");

  useEffect(() => {
    const perfilGuardado = localStorage.getItem("perfil-tecnico");

    if (perfilGuardado) {
      const perfil = JSON.parse(perfilGuardado);
      setFoto(perfil.foto || "");
    }
  }, []);

  const fotoPerfil =
    foto || "https://api.dicebear.com/7.x/notionists/svg?seed=Tecnico";

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
        Portal Técnico
      </h2>

      <div className="flex items-center gap-3">
        <input
          placeholder="Buscar..."
          className="bg-gray-100 px-3 py-1.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-orange-300 w-48"
        />

        <img
          src={fotoPerfil}
          alt="Perfil técnico"
          className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
        />
      </div>
    </header>
  );
}