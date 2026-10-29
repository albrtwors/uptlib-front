import { useEffect, useState } from "react"
export const useManageBooks = ({ search, limit }: any) => {
    const [useAllBooks, setUseAllBooks]: any = useState([])


    const getBooks = async ({ search, limit, page, category, pnf }: any) => {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (category) params.set('genre', category)
        if (pnf) params.set('pnf', pnf)
        params.set('limit', `${limit ?? 10}`)
        params.set('page', `${page ?? 1}`)

        return fetch(`/api/physical-book?${params}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getBooks({ search, limit })
    }, [])

    return { books: useAllBooks, setUseAllBooks, getBooks }
}
