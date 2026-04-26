import { useEffect, useState } from "react";

export default function useItemLoans({ search, limit, page }: any) {
    const [itemLoans, setItemLoans] = useState<any>([])

    const getItemLoans = async ({ search, limit, page = 1 }: any) => {
        const res = await fetch(`/api/inventory-operation/loan?search=${search}&limit=${limit}&page=${page}`)
        const data = await res.json()
        return data
    }


    return { itemLoans, setItemLoans, getItemLoans }
}