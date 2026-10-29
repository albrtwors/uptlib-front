"use client"

import Label from "@/components/form/Label"
import { useCategories } from "@/hooks/categories/useCategories"
import { useEffect, useRef, useState } from "react"

export default function CategoryFilter({ setSearchHandler }: any) {
    const [search, setSearch] = useState('')
    const [dropDownShow, setDropdownShow] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const { categories, setCategories, getCategories } = useCategories({ search })

    const loadSuggestions = (term: string) => {
        getCategories({ search: term, limit: 20 }).then((res: any) => {
            setCategories(res)
            setHasSearched(true)
        })
    }

    const handleSearch = (e: any) => {
        const term = e.target.value
        setSearch(term)
        setDropdownShow(term.length > 0)
        setHasSearched(false)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (term.length === 0) {
            setCategories([])
            setSearchHandler('')
            return
        }
        // Las sugerencias se piden al escribir, pero el filtro de la tabla solo se aplica
        // al elegir una categoría, pulsar Enter o limpiar el campo.
        timeoutRef.current = setTimeout(() => loadSuggestions(term), 300)
    }

    const applyCategory = (name: string) => {
        setSearch(name)
        setDropdownShow(false)
        setSearchHandler(name)
    }

    const clearCategory = () => {
        setSearch('')
        setCategories([])
        setHasSearched(false)
        setDropdownShow(false)
        setSearchHandler('')
    }

    useEffect(() => {
        getCategories({ search: '', limit: 20 }).then((res: any) => setCategories(res))
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setDropdownShow(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return <div ref={containerRef} className="relative flex flex-col">
        <Label>Categoría</Label>
        <div className="flex gap-2">
            <input
                onChange={handleSearch}
                onFocus={() => setDropdownShow(search.length > 0)}
                onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        applyCategory(search)
                    }
                }}
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800"
                value={search}
                placeholder="Buscar categoría..."
            ></input>
            {search && <button type="button" onClick={clearCategory} title="Quitar filtro de categoría"
                className="h-11 px-3 rounded-lg border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-400 dark:border-gray-700 dark:text-white/60">
                ✕
            </button>}
        </div>
        {dropDownShow && <div className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            {categories.length === 0 && hasSearched && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-white/50">Sin categorías</div>
            )}
            {categories.map((category: any) => (
                <div key={category.id} onClick={() => { applyCategory(category.name) }}
                    className="cursor-pointer px-3 py-2 text-sm text-gray-800 hover:bg-brand-50 hover:text-brand-700 dark:text-white/80 dark:hover:bg-white/5">
                    {category.name}
                </div>
            ))}
        </div>}
    </div>
}
