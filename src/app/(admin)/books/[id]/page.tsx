'use client'

import { api } from '@/consts/api'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const { base_url } = api

export default function Page() {
    const [book, setBook]: any = useState(null)
    const [loading, setLoading] = useState(true)
    const params = useParams()

    useEffect(() => {

        fetch(`${base_url}/book/${params.id}`, {
            credentials: 'include'
        }).then(res => res.json()).then(data => {
            setBook(data)
            setLoading(false)
        })
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando libro...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            <div className="max-w-4xl mx-auto px-6 py-20">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-8">
                        {book.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        {book.description}
                    </p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    <iframe
                        src={`${base_url}${book.routepdf}`}
                        className="w-full h-[80vh] md:h-[85vh] border-0"
                        title={book.title}
                    />
                </div>
            </div>
        </div>
    )
}