"use client"

import { useState, useRef, useEffect } from "react"
import Label from "../../Label"
import { useAuthors } from "@/hooks/authors/useAuthors"

export default function AuthorSearcher({ defaultValue = null }: any) {
    const [search, setSearch] = useState(defaultValue?.name || '')
    const [selectedAuthor, setSelectedAuthor] = useState<any>(defaultValue)

    // 💡 Pasamos un string o dejamos que el hook maneje su estado interno, 
    // pero usamos getAuthors manualmente para evitar reactividad cruzada por objetos.
    const { authors, getAuthors, setAuthors } = useAuthors({ search: "" })

    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

        // Si es muy corto o ya está seleccionado, limpiamos las sugerencias de forma segura
        if (search.trim().length < 2 || (selectedAuthor && selectedAuthor.name === search)) {
            // Solo actualizamos si ya había autores en la lista para evitar re-renders infinitos
            if (authors && authors.length > 0) {
                setAuthors([])
            }
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
        // 💡 Quitamos 'selectedAuthor' y 'authors' de las dependencias para romper el ciclo.
    }, [search, getAuthors, setAuthors])

    const selectAuthor = (author: any) => {
        setSelectedAuthor(author)
        setSearch(author.name)
        setAuthors([])
    }

    const clearAuthor = () => {
        setSelectedAuthor(null)
        setSearch('')
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
                        if (selectedAuthor) setSelectedAuthor(null)
                    }}
                    type="text"
                    placeholder="Buscar autor o escribir uno nuevo..."
                />
            </div>

            {selectedAuthor ? (
                <input type="hidden" name="authorId" value={selectedAuthor.id} />
            ) : (
                search.trim().length >= 2 && <input type="hidden" name="authorName" value={search.trim()} />
            )}

            {authors && authors.length > 0 && !selectedAuthor && (
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-900 absolute z-50 w-full top-[4.5rem]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {authors.slice(0, 8).map((author: any) => (
                            <div
                                key={author.id}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-800 cursor-pointer transition-all border-l-4 border-transparent hover:border-blue-400"
                                onClick={() => selectAuthor(author)}
                            >
                                <div className="font-medium text-gray-900 dark:text-white truncate">{author.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">ID: {author.id}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!selectedAuthor && search.trim().length >= 2 && (!authors || authors.length === 0) && (
                <div className="p-3 border border-dashed border-blue-300 rounded-xl bg-blue-50/50 text-xs text-blue-700 flex items-center gap-2">
                    <span>✨</span>
                    <span>El autor <strong>"{search}"</strong> no existe. Se creará automáticamente al guardar.</span>
                </div>
            )}

            {selectedAuthor && (
                <div className="p-3 border border-emerald-200 rounded-xl bg-emerald-50/40 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 truncate">Vinculado a: <strong>{selectedAuthor.name}</strong></span>
                    <button type="button" onClick={clearAuthor} className="text-gray-400 hover:text-red-500 font-bold ml-2">Cambiar</button>
                </div>
            )}
        </div>
    )
}