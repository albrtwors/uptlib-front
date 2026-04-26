import { useEffect, useState } from "react"
export const useManageBooks = ({ search, limit }: any) => {
    const [useAllBooks, setUseAllBooks]: any = useState([])


    const getBooks = async ({ search, limit, page, category, pnf }: any) => {
        return fetch(`/api/physical-book?genre=${category}&pnf=${pnf}&search=${search}&limit=${limit ?? 10}&page=${page ?? 1}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getBooks({ search, limit })
    }, [])

    return { books: useAllBooks, setUseAllBooks, getBooks }
}
