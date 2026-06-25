"use client"

import { useState, useRef, useEffect } from "react"
import Label from "../../Label"
import { useCategories } from "@/hooks/categories/useCategories"

export default function CategorySearcher({ defaultValue = null }: any) {
    const [search, setSearch] = useState(defaultValue?.name || '')
    const [selectedCategory, setSelectedCategory] = useState<any>(defaultValue)

    // Evitamos enviar el objeto de búsqueda cambiante en cada renderización
    const { categories, getCategories, setCategories } = useCategories({ search: "" })

    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

        if (search.trim().length < 2 || (selectedCategory && selectedCategory.name === search)) {
            if (categories && categories.length > 0) {
                setCategories([])
            }
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
    }, [search, getCategories, setCategories])

    const selectCategory = (category: any) => {
        setSelectedCategory(category)
        setSearch(category.name)
        setCategories([])
    }

    const clearCategory = () => {
        setSelectedCategory(null)
        setSearch('')
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
                        if (selectedCategory) setSelectedCategory(null)
                    }}
                    type="text"
                    placeholder="Buscar categoría o escribir una nueva..."
                />
            </div>

            {selectedCategory ? (
                <input type="hidden" name="categoryId" value={selectedCategory.id} />
            ) : (
                search.trim().length >= 2 && <input type="hidden" name="categoryName" value={search.trim()} />
            )}

            {categories && categories.length > 0 && !selectedCategory && (
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-900 absolute z-50 w-full top-[4.5rem]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {categories.slice(0, 8).map((category: any) => (
                            <div
                                key={category.id}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-800 cursor-pointer transition-all border-l-4 border-transparent hover:border-purple-400"
                                onClick={() => selectCategory(category)}
                            >
                                <div className="font-medium text-gray-900 dark:text-white truncate">{category.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">ID: {category.id}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!selectedCategory && search.trim().length >= 2 && (!categories || categories.length === 0) && (
                <div className="p-3 border border-dashed border-purple-300 rounded-xl bg-purple-50/50 text-xs text-purple-700 flex items-center gap-2">
                    <span>✨</span>
                    <span>El género <strong>"{search}"</strong> no existe. Se creará automáticamente al guardar.</span>
                </div>
            )}

            {selectedCategory && (
                <div className="p-3 border border-emerald-200 rounded-xl bg-emerald-50/40 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 truncate">Vinculado a: <strong>{selectedCategory.name}</strong></span>
                    <button type="button" onClick={clearCategory} className="text-gray-400 hover:text-red-500 font-bold ml-2">Cambiar</button>
                </div>
            )}
        </div>
    )
}