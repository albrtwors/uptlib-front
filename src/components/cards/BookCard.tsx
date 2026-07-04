"use client"

import Link from "next/link"
import LikeButton from "../buttons/LikeButton"
import Button from "../ui/button/Button"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"

interface BookCardProps {
    id: string | number
    title: string
    pnf: string
    isLikable?: boolean,
    description?: string
    routepdf?: string
    isPublic?: boolean
    handleQuit?: () => void // 💡 Recuperado
}

export default function BookCard({ id, isPublic = false, isLikable = true, title, pnf, description, routepdf, handleQuit }: BookCardProps) {
    return (
        <div className="group flex flex-col justify-between p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 min-w-0 w-full h-[280px]">

            {/* Contenedor Superior (Títulos, Textos y Favoritos) */}
            <div className="flex flex-col gap-2 min-w-0">

                {/* Etiquetas de Estado, PNF y Botón de Favoritos */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {/* Formato: Físico o PDF */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${routepdf ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                            }`}>
                            {routepdf ? 'PDF' : 'Físico'}
                        </span>

                        {/* Badge para el PNF */}
                        {pnf && (
                            <span
                                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 truncate max-w-[100px]"
                                title={pnf}
                            >
                                {pnf}
                            </span>
                        )}
                    </div>

                    {/* 💡 Lógica de Favoritos Recuperada */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            #{id}
                        </span>

                        {!handleQuit ? (
                            isLikable && <LikeButton id={String(id)} />

                        ) : (
                            isLikable && <Button
                                size="sm"
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 border-none shadow-none text-xs"
                                onClick={() => {
                                    fetch(`/api/book/remove-like/${id}`, { method: 'POST' })
                                        .then(res => res.json())
                                        .then(data => {
                                            handleResponses(data);
                                            handleQuit();
                                        });
                                }}
                            >
                                ✕
                            </Button>
                        )}
                    </div>
                </div>

                {/* Título del libro */}
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-base leading-snug line-clamp-2 min-w-0" title={title}>
                    {title}
                </h3>

                {/* Descripción corta */}
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed min-w-0">
                    {description || "Sin descripción disponible para este ejemplar."}
                </p>
            </div>

            {/* Contenedor Inferior (Botones de Acción) */}
            <div className="pt-4 border-t border-gray-50 dark:border-gray-800/60 flex gap-2 w-full mt-auto">
                <Link
                    href={!isPublic ? `/books/${id}` : `/publicBooks/${id}`}
                    className="flex-1 text-center py-2 px-3 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 dark:bg-gray-800 dark:hover:bg-purple-950/30 dark:text-gray-300 dark:hover:text-purple-400 rounded-xl text-xs font-semibold transition-colors truncate"
                >
                    Ver Detalle
                </Link>

                {routepdf && (
                    <a
                        href={routepdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-colors flex items-center justify-center shrink-0"
                        title="Leer PDF"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </a>
                )}
            </div>

        </div>
    )
}