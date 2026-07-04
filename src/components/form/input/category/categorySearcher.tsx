"use client"

import { useState, useRef, useEffect } from "react"
import Label from "../../Label"
import { useCategories } from "@/hooks/categories/useCategories"

export default function CategorySearcher({ defaultValue = null }: any) {
    const [search, setSearch] = useState(defaultValue?.name || '')
    const [selectedCategory, setSelectedCategory] = useState<any>(defaultValue)

    const { categories, getCategories, setCategories } = useCategories({ search: "" })
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    // Sincroniza si cambia externamente (ej. al editar)
    useEffect(() => {
        if (defaultValue) {
            setSearch(defaultValue.name || '')
            setSelectedCategory(defaultValue)
        } else {
            setSearch('')
            setSelectedCategory(null)
        }
    }, [defaultValue])

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

        if (search.trim().length < 2 || (selectedCategory && selectedCategory.name === search)) {
            if (categories && categories.length > 0) setCategories([])
            return
        }

        searchTimeoutRef.current = setTimeout(() => {
            getCategories({ search }).then(res => {
                if (res) setCategories(res)
            })
        }, 300)

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        }
    }, [search, getCategories, setCategories, selectedCategory])

    const selectCategory = (category: any) => {
        setSelectedCategory(category)
        setSearch(category.name)
        setCategories([])
    }

    return (
        <div className="space-y-2 relative">
            <div>
                <Label>Categoría</Label>
                <input
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={search}
                    onChange={(e: any) => {
                        setSearch(e.target.value)
                        if (selectedCategory) setSelectedCategory(null) // Rompe el vínculo si el usuario vuelve a escribir
                    }}
                    type="text"
                    placeholder="Buscar categoría o escribir una nueva..."
                />
            </div>

            {/* 💡 INPUTS OCULTOS CONDICIONALES PARA EL FORMDATA */}
            {selectedCategory ? (
                <input type="hidden" name="categoryId" value={selectedCategory.id} />
            ) : (
                search.trim().length >= 2 && <input type="hidden" name="categoryName" value={search.trim()} />
            )}

            {/* DESPLEGABLE FLOTANTE DE SUGERENCIAS */}
            {categories && categories.length > 0 && !selectedCategory && (
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg shadow-md bg-white dark:bg-gray-900 absolute mountaineer z-50 w-full top-[4.5rem]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {categories.slice(0, 8).map((category: any) => (
                            <div
                                key={category.id}
                                className="px-4 py-2.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-800 cursor-pointer transition-all border-l-4 border-transparent hover:border-purple-400 text-sm"
                                onClick={() => selectCategory(category)}
                            >
                                <div className="font-medium text-gray-900 dark:text-white truncate">{category.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}