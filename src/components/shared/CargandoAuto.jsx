export default function CargandoAuto({ mensaje = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="relative w-48 h-10 overflow-hidden">
        <div className="absolute animate-drive">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" className="w-16 h-16 text-orange-500 fill-orange-500">
            <path d="M10 20 L14 10 L44 10 L54 20 Z" className="fill-orange-500" />
            <path d="M16 10 L20 4 L38 4 L44 10 Z" className="fill-orange-400" />
            <rect x="6" y="20" width="52" height="8" rx="3" className="fill-orange-500" />
            <circle cx="16" cy="28" r="4" className="fill-gray-700" />
            <circle cx="16" cy="28" r="2" className="fill-gray-400" />
            <circle cx="44" cy="28" r="4" className="fill-gray-700" />
            <circle cx="44" cy="28" r="2" className="fill-gray-400" />
          </svg>
        </div>
        <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-gray-200 rounded" />
      </div>
      <p className="text-gray-500 text-sm font-medium">{mensaje}</p>
      <style>{`
        @keyframes drive {
          0%   { transform: translateX(-70px); }
          100% { transform: translateX(200px); }
        }
        .animate-drive {
          animation: drive 1.4s linear infinite;
        }
      `}</style>
    </div>
  )
}
