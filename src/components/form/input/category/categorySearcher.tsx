"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Label from "../../Label"
import { useCategories } from "@/hooks/categories/useCategories" // ✅ CAMBIADO
import Input from "../InputField"

export default function CategorySearcher({ defaultValue = null }: any) {
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<any>(defaultValue)
    const { categories, getCategories } = useCategories({ search }) // ✅ CAMBIADO
    const containerRef = useRef<HTMLDivElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    // ✅ Debounce búsqueda
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (search.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                getCategories({ search }) // ✅ getCategories
            }, 300)
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [search, getCategories])

    // Seleccionar categoría (solo una)
    const selectCategory = (category: any) => {
        setSelectedCategory(category)
        setSearch('')
    }

    // Limpiar selección
    const clearCategory = () => {
        setSelectedCategory(null)
        setSearch('')
    }

    // Click outside
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            // No cerrar si hay selección
        }
    }, [])

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [handleClickOutside])

    return (
        <div ref={containerRef} className="space-y-3">
            <div>
                <Label>Categoría</Label> {/* ✅ CAMBIADO */}
                <input
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={search}
                    onChange={(e: any) => setSearch(e.currentTarget.value)}
                    type="text"
                    name="categorySearch"
                    placeholder="Buscar categoría..."

                />
            </div>

            {/* ✅ LISTA DE RESULTADOS */}
            {categories.length > 0 && search.length >= 2 && !selectedCategory && ( // ✅ categories
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                    <div className="divide-y divide-gray-100">
                        {categories.slice(0, 8).map((category: any) => ( // ✅ categories
                            <div
                                key={category.id}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all border-l-4 border-transparent hover:border-purple-400 first:rounded-t-lg last:rounded-b-lg"
                                onClick={() => selectCategory(category)}
                            >
                                <div className="font-medium text-gray-900 hover:text-purple-700 truncate">
                                    {category.name}
                                </div>
                                <div className="text-sm text-gray-500 mt-0.5">ID: {category.id}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ✅ CARD DE LA CATEGORÍA SELECCIONADA */}
            {selectedCategory && (
                <div className="p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-xl text-gray-900 truncate">
                                {selectedCategory.name}
                            </div>
                            <div className="text-sm text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                ID: {selectedCategory.id}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={clearCategory}
                            className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110 shadow-sm"
                            title="Cambiar categoría"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ✅ INPUT OCULTO para DB */}
            {selectedCategory && (
                <input
                    type="hidden"
                    name="categoryId"
                    value={selectedCategory.id}
                />
            )}

            {/* ✅ Estado vacío */}
            {!selectedCategory && !categories.length && search.length < 2 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">📂</div>
                    <div className="text-sm font-medium text-gray-900">Busca una categoría</div>
                    <div className="text-xs text-gray-500">Escribe mínimo 2 caracteres</div>
                </div>
            )}
        </div>
    )
}