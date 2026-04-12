import { useEffect, useState } from "react"
export const useAuthors = ({ search, limit = 10 }: any) => {
    const [authors, setAuthors]: any = useState([])
    const getAuthors = async ({ search, limit }: any) => {
        return fetch(`/api/author?search=${search}&limit=${limit ?? 10}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getAuthors({ search, limit }).then((res: any) => {
            setAuthors(res)
        })
    }, [])

    return { authors, setAuthors, getAuthors }
}
