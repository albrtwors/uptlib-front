import { useEffect, useState } from "react"
export const usePhysicalBookLoans = ({ search, limit }: any) => {
    const [loans, setLoans]: any = useState([])


    const getLoans = async ({ search, limit }: any) => {
        return fetch(`/api/physical-book-operation/loan?search=${search}&limit=${limit ?? 10}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getLoans({ search, limit })
    }, [])

    return { loans, setLoans, getLoans }
}
