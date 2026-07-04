"use client"
import { useState } from 'react'
import ChatbotFab from '../ChatbotFab' // Reutiliza el FAB visual de tu módulo anterior

interface InventoryFormChatbotProps {
    mode: 'create' | 'edit'
    currentItem?: any
    onExtract: (data: { name?: string; code?: string; description?: string; stock?: string; typeName?: string }) => void
}

export default function InventoryFormChatbot({ mode, currentItem, onExtract }: InventoryFormChatbotProps) {
    const [loading, setLoading] = useState(false)

    const handleSendMessage = async (message: string): Promise<string | null> => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai-inventory/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    currentItem: mode === 'edit' ? currentItem : undefined
                })
            })
            const result = await response.json()
            if (result && result.extractedData) {
                onExtract(result.extractedData)
                return result.message
            }
            return "No pude definir campos válidos en esta instrucción."
        } catch (error) {
            return "Error de conexión con la IA de inventario."
        } finally {
            setLoading(false)
        }
    }

    return (
        <ChatbotFab
            title={mode === 'create' ? "Asistente de Inventario" : "Modificar Item"}
            placeholder="Ej: Registra 15 video beams con código V-01 en Audiovisuales..."
            onSendMessage={handleSendMessage}
            isLoading={loading}
        />
    )
}