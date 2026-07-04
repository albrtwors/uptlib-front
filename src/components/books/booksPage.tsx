"use client"

import { useEffect, useState } from "react"
import BookCard from "../cards/BookCard"
import { useManageBooks } from "./manageBooksPage"
import usePagination from "@/hooks/usePaginationOwn"
import { usePathname, useRouter } from "next/navigation"
import Input from "../form/input/InputField"
import Label from "../form/Label"
import Pagination from "../pagination/OwnPaginator"
import Button from "@/components/ui/button/Button"
import AuthorSelectorModal from "@/components/form/author/AuthorSelectorModal"

export default function BooksPage() {
    const pathname = usePathname()
    const router = useRouter()

    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const [pnf, setPnf] = useState('')

    // Filtro por Autor usando el modal consistente de la vista admin
    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
    const [authorFilterIds, setAuthorFilterIds] = useState<string[]>([])

    const { page, setPage, totalPages } = usePagination()

    // 💡 CLAVE DE LA VICTORIA: Estado reactivo local para forzar el renderizado de la paginación
    const [calculatedItems, setCalculatedItems] = useState(0)

    // Consumimos el mismo hook adaptado
    const { books, setUseAllBooks, getBooks } = useManageBooks({
        search,
        limit,
        page,
        pnf,
        authorIds: authorFilterIds
    })

    const pnfOptions = [
        "GENERAL", "INFORMATICA", "ELECTRONICA", "MANTENIMIENTO",
        "CONTADURIA", "ADMINISTRACION", "ELECTRICIDAD",
        "MECANICA", "INSTRUMENTACION", "TELECOMUNICACIONES"
    ]

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        params.set('page', page.toString()) // Aseguramos que la página vaya en los params
        if (pnf) params.set('pnf', pnf)
        if (authorFilterIds.length > 0) params.set('authors', authorFilterIds.join(','))

        router.push(`${pathname}?${params}`)

        getBooks({
            search,
            limit,
            page,
            pnf,
            authorIds: authorFilterIds
        }).then(res => {
            setUseAllBooks(res.data)

            // 1. Sincronizamos tu referencia por si el hook la usa para otra cosa
            totalPages.current = res.totalPages

            // 2. 💡 Forzamos el renderizado del paginador multiplicando las páginas por el límite, 
            // igualando el comportamiento esperado por la prop `totalItems`
            setCalculatedItems((res.totalPages || 1) * limit)
        }).catch(err => console.error(err))

    }, [search, limit, page, pnf, authorFilterIds])

    return (
        <section className="flex flex-col gap-6 p-4 max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Libros</h1>

            {/* 🛠️ BARRA DE FILTROS IDÉNTICA A MANAGEBOOKS */}
            <div className="flex flex-col sm:flex-row gap-3 items-end w-full bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                {/* Select de Cantidad Simplificado */}
                <div className="w-full sm:w-28">
                    <Label>Cantidad</Label>
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(parseInt(e.target.value) || 10)
                            setPage(1) // Al cambiar el límite regresamos a la página 1
                        }}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10 filas</option>
                        <option value={20}>20 filas</option>
                        <option value={30}>30 filas</option>
                    </select>
                </div>

                {/* Buscador de Texto */}
                <div className="w-full sm:flex-1">
                    <Label>Nombre del libro</Label>
                    <Input
                        className="w-full"
                        placeholder="Buscar libros..."
                        defaultValue={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>

                {/* Filtro por PNF (Select tradicional) */}
                <div className="w-full sm:w-48">
                    <Label>Filtrar por PNF</Label>
                    <select
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={pnf}
                        onChange={(e) => {
                            setPnf(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="">TODOS LOS PNF</option>
                        {pnfOptions.map((option, key) => (
                            <option key={key} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro de Autores usando el Modal */}
                <div className="w-full sm:w-48 flex flex-col gap-1">
                    <Label>Filtrar por Autor</Label>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 text-xs justify-between font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xs"
                        onClick={() => setIsAuthorModalOpen(true)}
                    >
                        <span>{authorFilterIds.length > 0 ? `Autores (${authorFilterIds.length})` : "Todos los autores"}</span>
                    </Button>
                </div>
            </div>

            {/* 💡 Paginación superior con renderizado controlado y reactivo */}
            {books && books.length > 0 && (
                <div className="flex justify-end">
                    <Pagination
                        page={page}
                        setPage={setPage}
                        totalItems={calculatedItems}
                        limit={limit}
                    />
                </div>
            )}

            {/* GRID DE TARJETAS */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 w-full">
                {books?.map((book: any) => (
                    <BookCard
                        routepdf={book.routepdf}
                        key={book.id}
                        id={book.id}
                        pnf={book.pnfs?.map((p: any) => p.pnf).join(', ') || 'GENERAL'}
                        title={book.title}
                        description={book.description}
                    />
                ))}
            </div>

            {/* Estado vacío por si no hay libros */}
            {(!books || books.length === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron libros que coincidan con los filtros.</p>
                </div>
            )}

            {/* SUB-MODAL SELECTOR DE AUTORES */}
            <AuthorSelectorModal
                isCrud={false}
                isOpen={isAuthorModalOpen}
                onClose={() => setIsAuthorModalOpen(false)}
                selectedIds={authorFilterIds}
                onChange={(ids: string[]) => {
                    setAuthorFilterIds(ids)
                    setPage(1)
                }}
            />
        </section>
    )
}