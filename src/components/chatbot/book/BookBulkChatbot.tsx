"use client"
import { useState } from 'react'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface Message {
    sender: 'user' | 'ai'
    text: string
}

interface BookBulkChatbotProps {
    onSuccessExecute: () => void; // Callback para refrescar la lista de libros del CRUD
}

export default function BookBulkChatbot({ onSuccessExecute }: BookBulkChatbotProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: 'ai',
            // 💡 Mensaje de bienvenida actualizado con la nueva lógica multi-autor y multi-pnf
            text: `¡Saludos, varón! Soy el centro de mando masivo. Puedes pedirme acciones en lote como:\n\n• "Registra el libro Cálculo I escrito por James Stewart para los PNFs de INFORMATICA y ELECTRONICA."\n• "Modifica los autores a Robert Kruse y cambia el PNF a INFORMATICA del libro de Estructuras de Datos."`
        }
    ])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userText = input
        setMessages(prev => [...prev, { sender: 'user', text: userText }])
        setInput('')
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append('message', userText)

            const res = await fetch('/api/ai-books/bulk-execute', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })

            if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`)
            const data = await res.json()

            let aiResponseText = data.aiAnalysis || 'Lote procesado correctamente.'

            if (data.summary) {
                const { created, updated, deleted, failed, errors } = data.summary

                aiResponseText += `\n\n📊 **Reporte de ejecución:**\n• Creados: ${created}\n• Editados: ${updated}\n• Borrados: ${deleted}`

                if (failed > 0) {
                    aiResponseText += `\n\n❌ Fallidos: ${failed}\n⚠️ Errores detallados:\n${errors.join('\n')}`
                }
            }

            setMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }])

            // Disparamos el refresco de la tabla general si hubo mutaciones exitosas
            if (data.summary && (data.summary.created > 0 || data.summary.updated > 0 || data.summary.deleted > 0)) {
                onSuccessExecute()
            }

        } catch (err) {
            console.error('Error en ejecución en lote:', err)
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: '❌ Hubo un problema al procesar la orden masiva. Verifica la conexión con el servidor.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Ventana del Chat */}
            {isOpen && (
                <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 sm:w-96 h-[450px] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-slate-900 text-white px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-blue-400 animate-pulse'}`}></span>
                            <h3 className="font-semibold text-sm">IA Centro de Operaciones Masivas</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-sm whitespace-pre-line">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl shadow-xs ${msg.sender === 'user'
                                    ? 'bg-slate-800 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-xs text-gray-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input de texto */}
                    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ej: Registra el libro X y borra el libro Y..."
                            disabled={isLoading}
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 disabled:bg-gray-50 resize-none"
                            rows={1}
                        />
                        <button type="submit" disabled={isLoading} className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors disabled:bg-gray-300">
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Botón Flotante (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center"
            >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <ChatBubbleLeftRightIcon className="w-6 h-6" />}
            </button>
        </div>
    )
}