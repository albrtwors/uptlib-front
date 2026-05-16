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


    </section>
}