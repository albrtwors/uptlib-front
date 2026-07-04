"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import BookCard from "@/components/cards/BookCard"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import Pagination from "@/components/pagination/OwnPaginator"
import Navbar from "@/components/landing/navbar/Navbar"
import Button from "@/components/ui/button/Button"
import AuthorSelectorModal from "@/components/form/author/AuthorSelectorModal"
import usePagination from "@/hooks/usePaginationOwn"

export default function PublicBooksPage() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const [pnf, setPnf] = useState('')

    // Filtro por Autor usando el modal consistente
    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
    const [authorFilterIds, setAuthorFilterIds] = useState<string[]>([])

    // Hook nativo de paginación
    const { page, setPage, totalPages } = usePagination()

    // Estado local reactivo de libros y total de páginas para asegurar el render
    const [books, setBooks] = useState<any[]>([])
    const [calculatedItems, setCalculatedItems] = useState(0)

    const pnfOptions = [
        "GENERAL", "INFORMATICA", "ELECTRONICA", "MANTENIMIENTO",
        "CONTADURIA", "ADMINISTRACION", "ELECTRICIDAD",
        "MECANICA", "INSTRUMENTACION", "TELECOMUNICACIONES"
    ]

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        if (pnf) params.set('pnf', pnf)
        if (authorFilterIds.length > 0) params.set('authors', authorFilterIds.join(','))

        router.push(`${pathname}?${params}`)

        // Construimos el query string limpio
        const query = new URLSearchParams()
        query.set('search', search)
        query.set('limit', limit.toString())
        query.set('page', page.toString())
        if (pnf) query.set('pnf', pnf)
        if (authorFilterIds.length > 0) query.set('authors', authorFilterIds.join(','))

        fetch(`/api/book?${query.toString()}`)
            .then(res => res.json())
            .then((result: any) => {
                if (result) {
                    setBooks(result.data || [])

                    // Sincronizamos tu ref original
                    totalPages.current = result.totalPages || 1

                    // 💡 CLAVE: Si tu OwnPaginator calcula internamente: totalPages = totalItems / limit
                    // Al multiplicarlo aquí, la cuenta dará exactamente las páginas que mandó el backend.
                    setCalculatedItems((result.totalPages || 1) * limit)
                }
            })
            .catch(err => console.error("Error cargando libros públicos:", err))

    }, [search, limit, page, pnf, authorFilterIds])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />

            <section className="flex flex-col gap-6 p-4 pt-28 max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Biblioteca Pública
                </h1>

                {/* BARRA DE FILTROS */}
                <div className="flex flex-col sm:flex-row gap-3 items-end w-full bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">

                    {/* Cantidad */}
                    <div className="w-full sm:w-28">
                        <Label>Cantidad</Label>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(parseInt(e.target.value) || 10)
                                setPage(1)
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

                    {/* Filtro por PNF */}
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

                    {/* Filtro de Autores */}
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

                {/* 💡 CONTROLES DE PAGINACIÓN VISIBLES CON MATEMÁTICA CORREGIDA */}
                {books.length > 0 && (
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
                            isPublic={true}
                            isLikable={false}
                            routepdf={book.routepdf}
                            key={book.id}
                            id={book.id}
                            pnf={book.pnfs?.map((p: any) => p.pnf).join(', ') || book.pnf || 'GENERAL'}
                            title={book.title}
                            description={book.description}
                        />
                    ))}
                </div>

                {/* Estado vacío */}
                {(!books || books.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron libros que coincidan con los filtros.</p>
                    </div>
                )}
            </section>

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
        </div>
    )
}