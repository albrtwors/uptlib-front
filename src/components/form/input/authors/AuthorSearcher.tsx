"use client"

import { useState, useRef, useEffect } from "react"
import Label from "../../Label"
import { useAuthors } from "@/hooks/authors/useAuthors"

export default function AuthorSearcher({ defaultValue = null }: any) {
    const [search, setSearch] = useState(defaultValue?.name || '')
    const [selectedAuthor, setSelectedAuthor] = useState<any>(defaultValue)

    const { authors, getAuthors, setAuthors } = useAuthors({ search: "" })
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    // Sincroniza si cambia externamente (ej. al editar)
    useEffect(() => {
        if (defaultValue) {
            setSearch(defaultValue.name || '')
            setSelectedAuthor(defaultValue)
        } else {
            setSearch('')
            setSelectedAuthor(null)
        }
    }, [defaultValue])

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

        if (search.trim().length < 2 || (selectedAuthor && selectedAuthor.name === search)) {
            if (authors && authors.length > 0) setAuthors([])
            return
        }

        searchTimeoutRef.current = setTimeout(() => {
            getAuthors({ search }).then(res => {
                if (res) setAuthors(res)
            })
        }, 300)

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        }
    }, [search, getAuthors, setAuthors, selectedAuthor])

    const selectAuthor = (author: any) => {
        setSelectedAuthor(author)
        setSearch(author.name)
        setAuthors([])
    }

    return (
        <div className="space-y-2 relative">
            <div>
                <Label>Autor</Label>
                <input
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={search}
                    onChange={(e: any) => {
                        setSearch(e.target.value)
                        if (selectedAuthor) setSelectedAuthor(null) // Rompe el vínculo si el usuario vuelve a escribir
                    }}
                    type="text"
                    placeholder="Buscar autor o escribir uno nuevo..."
                />
            </div>

            {/* 💡 INPUTS OCULTOS CONDICIONALES PARA EL FORMDATA */}
            {selectedAuthor ? (
                <input type="hidden" name="authorId" value={selectedAuthor.id} />
            ) : (
                search.trim().length >= 2 && <input type="hidden" name="authorName" value={search.trim()} />
            )}

            {/* DESPLEGABLE FLOTANTE DE SUGERENCIAS */}
            {authors && authors.length > 0 && !selectedAuthor && (
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg shadow-md bg-white dark:bg-gray-900 absolute mountaineer z-50 w-full top-[4.5rem]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {authors.slice(0, 8).map((author: any) => (
                            <div
                                key={author.id}
                                className="px-4 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-800 cursor-pointer transition-all border-l-4 border-transparent hover:border-blue-400 text-sm"
                                onClick={() => selectAuthor(author)}
                            >
                                <div className="font-medium text-gray-900 dark:text-white truncate">{author.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}