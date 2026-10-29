import { useEffect, useState } from "react"

export interface PnfEntity {
    id: string
    name: string
}

export const usePnfs = ({ search, limit = 100 }: any) => {
    const [pnfs, setPnfs]: any = useState([])
    const getPnfs = async ({ search, limit }: any) => {
        return fetch(`/api/pnf?search=${search ?? ''}&limit=${limit ?? 100}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getPnfs({ search, limit }).then((res: any) => {
            setPnfs(res)
        })
    }, [])

    return { pnfs, setPnfs, getPnfs }
}
