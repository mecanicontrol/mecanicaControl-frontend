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
    <header className="h-20 bg-white border-b flex items-center justify-between px-8">
      <h2 className="text-4xl font-black text-orange-500">
        OPERATIONAL TERMINAL
      </h2>

      <div className="flex items-center gap-4">
        <input
          placeholder="Search..."
          className="bg-gray-100 px-4 py-2 rounded-xl outline-none"
        />

        <img
          src={fotoPerfil}
          alt="Perfil técnico"
          className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
        />
      </div>
    </header>
  );
}