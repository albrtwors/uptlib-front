"use client"
import { useState } from 'react'
import ChatbotFab from '../ChatbotFab'

interface BookFormChatbotProps {
    mode: 'create' | 'edit'
    currentBook?: any // Mantiene el objeto actual para el contexto
    // 💡 Tipado corregido para recibir arreglos de PNFs e IDs de autores procesados por la IA
    onExtract: (data: {
        title?: string | null;
        description?: string | null;
        pnfs?: string[];
        authorIds?: string[];
        routepdf?: string | null;
        routeimg?: string | null;
    }) => void
}

export default function BookFormChatbot({ mode, currentBook, onExtract }: BookFormChatbotProps) {
    const [loading, setLoading] = useState(false)

    const handleSendMessage = async (message: string): Promise<string | null> => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai-books/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    // Si está en edit pasamos el objeto directamente para que el backend lo maneje
                    currentBook: mode === 'edit' ? currentBook : undefined
                })
            })

            const result = await response.json()

            if (result && result.extractedData) {
                // 💡 Volcamos directo los datos con pnfs y authorIds listos al formulario principal
                onExtract(result.extractedData)
                return result.message
            }

            return "No pude extraer datos claros de esa instrucción, intenta detallar más campos."
        } catch (error) {
            console.error("Error en Chatbot:", error)
            return "Ocurrió un error conectando con el servicio de IA."
        } finally {
            setLoading(false)
        }
    }

    return (
        <ChatbotFab
            title={mode === 'create' ? "Asistente de Registro" : "Asistente de Edición"}
            placeholder={mode === 'create' ? "Ej: El título es 'Cálculo de Stewart' de los autores James Stewart y Larson para INFORMATICA..." : "Ej: Cambia los autores a James Stewart y añade el PNF de MATEMATICA..."}
            onSendMessage={handleSendMessage}
            isLoading={loading}
        />
    )
}