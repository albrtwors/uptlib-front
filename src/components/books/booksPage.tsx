"use client"

import { useEffect, useState } from "react"

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
            {books?.map((book: any) => <div key={book.id} className="flex  shadow-xl rounded-lg">
                <img className="rounded-l-lg" src={book.routeimg}></img>
                <div className="flex p-5 flex-col text-left items-center  rounded-r-lg bg-white">
                    <strong className="text-lg">{book.title}</strong>
                    <p className="text-sm">{book.description}</p>
                </div>

            </div>)}

        </div>

    </section>
}