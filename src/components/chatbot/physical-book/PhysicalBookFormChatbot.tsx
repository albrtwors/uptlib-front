"use client"
import { useState } from 'react'
import ChatbotFab from '../ChatbotFab' // 💡 Reutiliza tu FAB visual genérico

interface PhysicalBookFormChatbotProps {
    mode: 'create' | 'edit'
    currentBook?: any
    onExtract: (data: {
        title: string | null
        isbn: string | null
        authorName: string | null
        categoryName: string | null
        pnf: string | null
        yearOfPublication: string | null
        editorial: string | null
        totalStock: string | null
    }) => void
}

export default function PhysicalBookFormChatbot({ mode, currentBook, onExtract }: PhysicalBookFormChatbotProps) {
    const [loading, setLoading] = useState(false)

    const handleSendMessage = async (message: string): Promise<string | null> => {
        setLoading(true)
        try {
            // Conexión directa a la nueva ruta expuesta por tu AiBookController
            const response = await fetch('/api/ai-books/process-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userInput: message,
                    currentBookData: mode === 'edit' ? currentBook : undefined
                })
            })

            if (!response.ok) throw new Error("Error en la respuesta del servidor de IA")

            const result = await response.json()

            if (result && result.extractedData) {
                // Despacha los datos estructurados al componente padre (ManagePhysicalBooksPage)
                onExtract(result.extractedData)
                return result.message
            }

            return "No logré estructurar información válida basada en esa instrucción."
        } catch (error) {
            console.error("Error en Chatbot Libros Físicos:", error)
            return "Hubo un problema de red al intentar procesar la petición con la IA."
        } finally {
            setLoading(false)
        }
    }

    return (
        <ChatbotFab
            title={mode === 'create' ? "Asistente de Libros Físicos" : `Modificar: ${currentBook?.title || 'Libro'}`}
            placeholder="Ej: Modifica la editorial a Alfaguara y súmale 3 al stock..."
            onSendMessage={handleSendMessage}
            isLoading={loading}
        />
    )
}