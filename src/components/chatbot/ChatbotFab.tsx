"use client"
import { useState } from 'react'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface Message {
    sender: 'user' | 'ai'
    text: string
}

interface ChatbotFabProps {
    title: string
    placeholder?: string
    onSendMessage: (message: string) => Promise<string | null>
    isLoading: boolean
}

export default function ChatbotFab({ title, placeholder = "Escribe aquí...", onSendMessage, isLoading }: ChatbotFabProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: `¡Hola! Soy tu asistente para este formulario. Dime qué deseas rellenar o cambiar.` }
    ])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userText = input
        setMessages(prev => [...prev, { sender: 'user', text: userText }])
        setInput('')

        const aiResponse = await onSendMessage(userText)
        if (aiResponse) {
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }])
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Ventana del Chat */}
            {isOpen && (
                <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 sm:w-96 h-[450px] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                            <h3 className="font-semibold text-sm">{title}</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-sm">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl shadow-xs ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-xs text-gray-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input de texto */}
                    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={placeholder}
                            disabled={isLoading}
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                        <button type="submit" disabled={isLoading} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:bg-gray-300">
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Botón Flotante (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center"
            >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <ChatBubbleLeftRightIcon className="w-6 h-6" />}
            </button>
        </div>
    )
}