import { useEffect, useState } from "react"
export const useManageBooks = ({ search, limit }: any) => {
    const [useAllBooks, setUseAllBooks]: any = useState([])


    const getBooks = async ({ search, limit }: any) => {
        return fetch(`/api/physical-book?search=${search}&limit=${limit ?? 10}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getBooks({ search, limit })
    }, [])

    return { books: useAllBooks, setUseAllBooks, getBooks }
}
