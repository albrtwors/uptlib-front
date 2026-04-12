import { useEffect, useState } from "react"
export const useCategories = ({ search, limit = 10 }: any) => {
    const [categories, setCategories]: any = useState([])
    const getCategories = async ({ search, limit }: any) => {
        return fetch(`/api/category?search=${search}&limit=${limit ?? 10}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getCategories({ search, limit }).then((res: any) => {
            setCategories(res)
        })
    }, [])

    return { categories, setCategories, getCategories }
}
