import { useEffect, useState } from "react";

export default function useTypes({ search }: any) {
    const [types, setTypes] = useState<any>([])
    const getTypes = async ({ src }: any) => {
        const res = await fetch(`/api/item-type?search=${src}`)
        const data = await res.json()
        console.log(data)
        return data
    }

    useEffect(() => {
        getTypes({ src: search }).then(res => {

            setTypes(res)
        })
    }, [])

    return { types, setTypes, getTypes }
}