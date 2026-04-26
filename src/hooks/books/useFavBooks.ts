import { useState } from "react"

export const useFavBooks = ({ search, limit, page }: any) => {
    const [books, setUseAllBooks] = useState([])
    const getBooks = async ({ search, limit, page }: any) => {
        return fetch(`/api/book/my-library?search=${search}&limit=${limit ?? 10}&page=${page}`).then((res: any) => res.json()).then(data => data)
    }

    return { books, setUseAllBooks, getBooks }
}