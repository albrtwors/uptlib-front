"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Label from "../../Label"
import { useManageBooks } from "@/hooks/physicalBooks/useManageBooks"

export default function PhysicalBookSearcher({ defaultValue = null, onSelect }: any) {
    const [search, setSearch] = useState('')
    const [selectedBook, setSelectedBook]: any = useState(defaultValue)
    const [isOpen, setIsOpen] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search })
    const containerRef = useRef<HTMLDivElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    const runSearch = useCallback((term: string) => {
        if (!term) {
            setUseAllBooks([])
            setHasSearched(false)
            return
        }
        getBooks({ search: term, limit: 8 }).then((data: any) => {
            setUseAllBooks(Array.isArray(data?.data) ? data.data : [])
            setHasSearched(true)
        })
    }, [getBooks, setUseAllBooks])

    // Búsqueda con debounce: se aplica mientras se escribe, sin exigir un mínimo
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        if (!search) return
        searchTimeoutRef.current = setTimeout(() => runSearch(search), 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [search, runSearch])

    const handleChange = (term: string) => {
        setSearch(term)
        if (!term) {
            setUseAllBooks([])
            setHasSearched(false)
        }
    }

    const selectBook = (book: any) => {
        setSelectedBook(book)
        setSearch('')
        setIsOpen(false)
        setUseAllBooks([])
        onSelect?.(book)
    }

    const clearSelection = () => {
        setSelectedBook(null)
        setSearch('')
        setIsOpen(true)
        onSelect?.(null)
    }

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsOpen(false)
        }
    }, [])

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [handleClickOutside])

    const showResults = isOpen && !selectedBook

    return (
        <div ref={containerRef} className="space-y-3">
            <div>
                <Label>Libro</Label>
                <input
                    className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                    value={search}
                    onChange={(e: any) => handleChange(e.currentTarget.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e: any) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            runSearch(search)
                        }
                    }}
                    type="text"
                    placeholder="Buscar libro por título..."
                />
            </div>

            {showResults && books.length > 0 && (
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {books.slice(0, 8).map((book: any) => (
                            <div
                                key={book.id}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all border-l-4 border-transparent hover:border-blue-400 first:rounded-t-lg last:rounded-b-lg"
                                onClick={() => selectBook(book)}
                            >
                                <div className="font-medium text-gray-900 hover:text-blue-700 truncate dark:text-white/90">
                                    {book.title}
                                </div>
                                <div className="text-sm text-gray-500 mt-0.5 dark:text-white/50">
                                    {book.code ? `Código: ${book.code} · ` : ''}Disponibles: {book.availableStock}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showResults && hasSearched && books.length === 0 && (
                <div className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-500 dark:border-gray-700 dark:text-white/50">
                    No se encontró ningún libro con ese título.
                </div>
            )}

            {showResults && !hasSearched && (
                <div className="px-4 py-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 dark:border-gray-700 dark:text-white/50">
                    Escribe el título del libro para buscarlo.
                </div>
            )}

            {selectedBook && (
                <div className="p-4 border-2 border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm dark:border-blue-800">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-xl text-gray-900 truncate dark:text-white/90">
                                {selectedBook.title}
                            </div>
                            {selectedBook.code && (
                                <div className="text-sm text-gray-600 mt-0.5 dark:text-white/70">
                                    Código: {selectedBook.code}
                                </div>
                            )}
                            <div className="text-sm text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1 dark:text-blue-300 dark:bg-blue-900/40">
                                CANTIDAD DISPONIBLE: {selectedBook.availableStock}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={clearSelection}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                            title="Cambiar libro"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {selectedBook && (
                <input
                    type="hidden"
                    name="bookId"
                    value={selectedBook.id}
                />
            )}

            {!selectedBook && !isOpen && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-sm text-gray-500 mb-1 dark:text-white/50">📖</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white/90">Busca un libro</div>
                    <div className="text-xs text-gray-500 dark:text-white/50">Escribe el título para seleccionarlo</div>
                </div>
            )}
        </div>
    )
}
