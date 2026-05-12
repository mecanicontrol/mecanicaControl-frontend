export default function CargandoAuto({ mensaje = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="relative w-56 h-14 overflow-hidden">

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded" />

        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div className="animate-road-line absolute bottom-0 h-0.5 w-8 bg-gray-300 rounded" style={{ left: '10%' }} />
          <div className="animate-road-line absolute bottom-0 h-0.5 w-8 bg-gray-300 rounded" style={{ left: '45%', animationDelay: '-0.5s' }} />
          <div className="animate-road-line absolute bottom-0 h-0.5 w-8 bg-gray-300 rounded" style={{ left: '80%', animationDelay: '-1s' }} />
        </div>

     
        <div className="absolute animate-drive" style={{ bottom: '2px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 42" width="90" height="42">

            <ellipse cx="45" cy="41" rx="30" ry="3" fill="#00000015" />

            <rect x="6" y="24" width="78" height="13" rx="4" fill="#f97316" />


            <path d="M22 24 L28 10 L62 10 L68 24 Z" fill="#ea6f0f" />

 
            <path d="M55 10 L63 22 L55 22 Z" fill="#bfdbfe" opacity="0.85" />

            <path d="M35 10 L27 22 L35 22 Z" fill="#bfdbfe" opacity="0.85" />

            <rect x="36" y="11" width="18" height="11" rx="1" fill="#bfdbfe" opacity="0.85" />


            <rect x="78" y="26" width="8" height="5" rx="2" fill="#fef08a" />
            <rect x="82" y="27" width="4" height="3" rx="1" fill="white" opacity="0.6" />

            <rect x="4" y="26" width="6" height="5" rx="2" fill="#fca5a5" />


            <circle cx="22" cy="37" r="7" fill="#1f2937" />
            <circle cx="22" cy="37" r="4.5" fill="#374151" />
            <circle cx="22" cy="37" r="2" fill="#9ca3af" />
            <line x1="22" y1="33" x2="22" y2="41" stroke="#6b7280" strokeWidth="1" />
            <line x1="18" y1="37" x2="26" y2="37" stroke="#6b7280" strokeWidth="1" />

            {/* rueda delantera */}
            <circle cx="66" cy="37" r="7" fill="#1f2937" />
            <circle cx="66" cy="37" r="4.5" fill="#374151" />
            <circle cx="66" cy="37" r="2" fill="#9ca3af" />
            <line x1="66" y1="33" x2="66" y2="41" stroke="#6b7280" strokeWidth="1" />
            <line x1="62" y1="37" x2="70" y2="37" stroke="#6b7280" strokeWidth="1" />

            {/* manija puerta */}
            <rect x="42" y="27" width="8" height="2" rx="1" fill="#c2440a" />
          </svg>
        </div>
      </div>

      <p className="text-gray-500 text-sm font-medium">{mensaje}</p>

      <style>{`
        @keyframes drive {
          0%   { transform: translateX(-100px); }
          100% { transform: translateX(240px); }
        }
        .animate-drive {
          animation: drive 1.6s linear infinite;
        }
        @keyframes roadLine {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-260px); }
        }
        .animate-road-line {
          animation: roadLine 1.6s linear infinite;
        }
      `}</style>
    </div>
  )
}
