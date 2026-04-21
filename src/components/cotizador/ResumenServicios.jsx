import { Calculator } from "lucide-react";



export default function ResumenServicios() {
  return (
    <section className="text-black relative">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 w-full">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2"> <Calculator className="text-orange-500" size={18}/>COTIZADOR RÁPIDO</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <h6 className="text-gray-600 font-bold">Marca</h6>
                    <select className="bg-zinc-200 border p-2 rounded" />
                </div>
                <div className="flex flex-col">
                    <h6 className="text-gray-600 font-bold">Modelo</h6>
                    <select className="bg-zinc-200 border p-2 rounded" />
                </div>
                <div className="flex flex-col">
                    <h6 className="text-gray-600 font-bold">Año</h6>
                    <select className="bg-zinc-200 border p-2 rounded" />
                </div>
                <div className="flex flex-col">
                    <h6 className="text-gray-600 font-bold">Kilometraje</h6>
                    <select className="bg-zinc-200 border p-2 rounded" />
                </div>
            </div>
        </div>
        

    </section>
  )
}
