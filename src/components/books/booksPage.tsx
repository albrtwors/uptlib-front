"use client"

import { useEffect, useState } from "react"
import BookCard from "../cards/BookCard"

export default function BooksPage() {
    const [books, setBooks] = useState([])

    useEffect(() => {
        fetch('/api/book').then((res: any) => {
            if (!res.ok) {
                console.log('error')
                return
            }

            return res.json()
        }).then((data: any) => {
            console.log(data)
            setBooks(data)
        })


    }, [])

    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Libros</h1>
        <div className="grid gap-3 grid-cols-4">
            {books?.map((book: any) => <BookCard key={book.id} id={book.id} title={book.title} description={book.description} img={book.routeimg} />)}

        </div>

    </section>
}