    import { Link } from 'react-router-dom'
    import { Bot } from 'lucide-react'
    import { Calculator } from "lucide-react"

    export default function DiagnosticoIA(){
        return(
            <section className="text-white relative">
                <div className="bg-slate-900 rounded-xl shadow-lg p-6 border border-gray-100 w-full">
                    <div>
                        <h1 className="text-3xl font-bold">Diagnostico Inteligente</h1>
                        <p className="text-gray-600 mb-4">
                            Describe los sintomas o ruidos de tu vehiculo y deja que<br />
                            nuestra IA prediga la falla tecnica<br />
                        </p>
                    </div>
                    <div>
                        <textarea 
                            className="w-full h-80 p-4 rounded-lg text-white bg-slate-800 resize-none"
                            placeholder="Ej: Escucho un chillido metálico al frenar..."
                        ></textarea>
                    </div>
                    <button className="bg-orange-500 font-bold rounded-lg w-full py-3 flex items-center justify-center gap-2 hover:bg-orange-600 transition">
                        <Bot size={18} />
                        Analizar con IA
                    </button>
                                        
                </div>
                
            </section>
        )
        

    }