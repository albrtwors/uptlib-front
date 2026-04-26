import { useState } from "react"

export const useItemOperation = ({ search, limit, page }: any) => {
    const [operations, setOperations] = useState([])
    const getOperations = async ({ search, limit, page }: any) => {
        const res = await fetch(`/api/inventory-operation?search=${search}&limit=${limit}&page=${page}`)
        const data = await res.json()
        return data
    }

    return { operations, setOperations, getOperations }


}