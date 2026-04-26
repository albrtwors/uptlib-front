"use client"

import { useEffect, useState } from "react"
import BookCard from "../cards/BookCard"
import { useManageBooks } from "./manageBooksPage"
import usePagination from "@/hooks/usePaginationOwn"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import Input from "../form/input/InputField"
import Label from "../form/Label"
import Pagination from "../pagination/OwnPaginator"

export default function BooksPage() {

    const pathname = usePathname()
    const router = useRouter()

    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const { page, setPage, totalPages } = usePagination()
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search, limit, page })

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        router.push(`${pathname}?${params}`)


        getBooks({ search, limit, page }).then(res => {
            setUseAllBooks(res.data)
            totalPages.current = res.totalPages
        })

    }, [search, limit, page])

    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Libros</h1>


        <div className="flex gap-3">

            <div>
                <Label>Cantidad por Página</Label>
                <Input type="number" placeholder="Cantidad" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const limi = parseInt(e.target.value)
                    if (!isNaN(limi) && limi > 0) {
                        setLimit(parseInt(e.target.value))
                    } else {
                        setLimit(10)
                    }

                }}></Input>
            </div>
            <div>
                <Label>Nombre del libro</Label>
                <Input className="w-full" placeholder="Buscar libros..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}></Input>
            </div>
        </div>

        <Pagination page={page} setPage={setPage} totalItems={totalPages.current} limit={limit} ></Pagination>
        <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
            {books?.map((book: any) => <BookCard routepdf={book.routepdf} key={book.id} id={book.id} title={book.title} description={book.description} />)}

        </div>

    </section>
}