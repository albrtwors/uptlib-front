"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/landing/navbar/Navbar"

export default function PublicBookDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [book, setBook] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        fetch(`/api/book/${id}`)
            .then(res => {
                if (!res.ok) throw new Error()
                return res.json()
            })
            .then(data => {
                setBook(data)
                setLoading(false)
            })
            .catch(() => {
                router.push('/404') // Si el libro no existe, mandarlo a error
            })
    }, [id, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <p className="text-lg font-medium text-gray-500 animate-pulse">Cargando detalles del libro...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* 💡 Navbar inteligente reutilizada sin parámetros de scroll */}
            <Navbar />

            {/* 💡 pt-28 añadido para evitar colisiones con el Navbar fixed */}
            <section className="max-w-5xl mx-auto p-6 pt-28 w-full flex flex-col gap-6">
                <button
                    onClick={() => router.back()}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start flex items-center gap-1"
                >
                    ← Volver al catálogo
                </button>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Panel de Metadatos e Información */}
                    <div className="md:col-span-1 bg-white/80 backdrop-blur-xs border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                        <div>
                            {/* 🔥 Corregido con opcional chaining */}
                            <span className="text-xs font-bold uppercase bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg">
                                {book?.pnf || "General"}
                            </span>
                        </div>

                        {/* 🔥 Corregido con opcional chaining */}
                        <h1 className="text-2xl font-bold text-gray-900">
                            {book?.title}
                        </h1>

                        {/* 🔥 Corregido con opcional chaining */}
                        <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                            {book?.description || "Este ejemplar no posee una descripción detallada en el sistema."}
                        </p>

                        {/* 🔥 Corregido con opcional chaining */}
                        {book?.routepdf && (
                            <a
                                href={book.routepdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-center block w-full px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                            >
                                📄 Abrir en pestaña nueva
                            </a>
                        )}
                    </div>

                    {/* Visor de Documento Completo con iFrame */}
                    <div className="md:col-span-2 w-full flex flex-col gap-3">
                        {/* 🔥 Corregido con opcional chaining */}
                        {book?.routepdf ? (
                            <div className="w-full bg-white border border-gray-200/60 p-2 rounded-2xl shadow-md overflow-hidden">
                                <iframe
                                    src={`${book.routepdf}#toolbar=1`}
                                    title={`Visor del libro: ${book.title}`}
                                    className="w-full h-[650px] rounded-xl border-none"
                                    allow="autoplay"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-48 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-gray-400 text-sm font-medium">Este recurso no dispone de un archivo digital para previsualización.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}