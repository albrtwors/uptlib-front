"use client"

import { useEffect, useState } from "react"
import BookCard from "../cards/BookCard"
import { useManageBooks } from "./manageBooksPage"
import usePagination from "@/hooks/usePaginationOwn"
import { usePathname, useRouter } from "next/navigation"
import Input from "../form/input/InputField"
import Label from "../form/Label"
import Pagination from "../pagination/OwnPaginator"

export default function BooksPage() {
    const pathname = usePathname()
    const router = useRouter()

    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const [pnf, setPnf] = useState('')

    const { page, setPage, totalPages } = usePagination()

    const { books, setUseAllBooks, getBooks } = useManageBooks({ search, limit, page, pnf })

    const pnfOptions = [
        "GENERAL", "INFORMATICA", "ELECTRONICA", "MANTENIMIENTO",
        "CONTADURIA", "ADMINISTRACION", "ELECTRICIDAD",
        "MECANICA", "INSTRUMENTACION", "TELECOMUNICACIONES"
    ]

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        if (pnf) params.set('pnf', pnf)

        router.push(`${pathname}?${params}`)

        getBooks({ search, limit, page, pnf }).then(res => {
            setUseAllBooks(res.data)
            totalPages.current = res.totalPages
        })

    }, [search, limit, page, pnf])

    return (
        <section className="flex flex-col gap-6 p-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Libros</h1>

            {/* Contenedor de Filtros */}
            <div className="flex flex-wrap gap-4 items-end bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-full sm:w-32">
                    <Label>Por Página</Label>
                    <Input type="number" placeholder="Cantidad" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const limi = parseInt(e.target.value)
                        if (!isNaN(limi) && limi > 0) {
                            setLimit(limi)
                        } else {
                            setLimit(10)
                        }
                    }}></Input>
                </div>

                <div className="flex-1 min-w-[240px]">
                    <Label>Nombre del libro</Label>
                    <Input className="w-full" placeholder="Buscar libros..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}></Input>
                </div>

                <div className="w-full md:w-64">
                    <Label>Filtrar por PNF</Label>
                    <select
                        className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        value={pnf}
                        onChange={(e) => setPnf(e.target.value)}
                    >
                        <option value="">TODOS LOS PNF</option>
                        {pnfOptions.map((option, key) => (
                            <option key={key} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Paginación superior */}
            <div className="flex justify-end">
                <Pagination page={page} setPage={setPage} totalItems={totalPages.current} limit={limit} />
            </div>

            {/* 🛠️ GRID REDISEÑADO Y ULTRA-RESPONSIVO */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 w-full">
                {books?.map((book: any) => (
                    <BookCard
                        routepdf={book.routepdf}
                        key={book.id}
                        id={book.id}
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
        </section>
    )
}