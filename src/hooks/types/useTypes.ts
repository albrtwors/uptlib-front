import { useEffect, useState } from "react";

export default function useTypes({ search }: any) {
    const [types, setTypes] = useState<any>([])
    const getTypes = async ({ src, search, limit }: any) => {
        const term = src ?? search ?? ''
        const params = new URLSearchParams()
        if (term) params.set('search', term)
        if (limit) params.set('limit', `${limit}`)
        const res = await fetch(`/api/item-type?${params.toString()}`)
        return await res.json()
    }

    useEffect(() => {
        getTypes({ search }).then(res => {
            setTypes(Array.isArray(res) ? res : (res?.data || []))
        })
    }, [])

    return { types, setTypes, getTypes }
}
