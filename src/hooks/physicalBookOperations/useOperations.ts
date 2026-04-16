import { useEffect, useState } from "react"
export const useOperations = ({ search, limit }: any) => {
    const [operations, setOperations]: any = useState([])


    const getOperations = async ({ search, limit }: any) => {
        return fetch(`/api/physical-book-operation?search=${search}&limit=${limit ?? 10}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getOperations({ search, limit })
    }, [])

    return { operations, setOperations, getOperations }
}
