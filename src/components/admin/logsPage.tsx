"use client"

import usePagination from "@/hooks/usePaginationOwn"
import { useUsers } from "@/hooks/users/useUsers"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Button from "../ui/button/Button"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import Pagination from "../pagination/OwnPaginator"
import ManageUsersTable from "./tables/manageUsersTable"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import GenericModalContainer from "../modals/GenericModalContainer"
import Select from "../form/Select"
import ManageLogsTable from "./tables/logsTable"

export const useOperations = () => {
    const [operations, setOperations] = useState([])
    const getOperations = async ({ search, limit, page }: any) => {
        return fetch(`/api/logs?search=${search}&limit=${limit ?? 10}&page=${page ?? 1}`).then(res => res.json()).then(data => {
            return data
        })

    }
    return { operations, setOperations, getOperations }
}


export default function LogsPage() {
    const router = useRouter()
    const pathname = usePathname()

    const { operations, getOperations, setOperations } = useOperations()

    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const { page, setPage, totalPages } = usePagination()






    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        router.push(`${pathname}?${params}`)

        fetch(`/api/logs?limit=${limit}&search=${search}&page=${page}`)
            .then(res => res.json())
            .then((data: any) => {

                setOperations(data.data)
                totalPages.current = data.totalPages

            })
    }, [search, limit, page]);


    return <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Bitácora de Usuario</h1>
        <div className="flex sm:flex-col lg:flex-row flex-col h-20 md:flex-row gap-3 min-w-full overflow-y-scroll">

            <div>
                <Label>Cantidad por Pagina</Label>
                <Input type="number" placeholder="Cantidad" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const limi = parseInt(e.target.value)
                    if (!isNaN(limi) && limi > 0) {
                        setLimit(parseInt(e.target.value))
                    } else {
                        setLimit(10)
                    }

                }}></Input>
            </div>

            <div>
                <Label>Buscar por Nombre del Item</Label>
                <Input className="w-full" placeholder="Buscar libros..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}></Input>
            </div>


        </div>



        <Pagination page={page} setPage={setPage} totalItems={totalPages.current || 0} limit={limit} ></Pagination>

        <ManageLogsTable items={operations}></ManageLogsTable>


    </div>
}
