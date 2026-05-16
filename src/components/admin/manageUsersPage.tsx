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
import { handleResponses } from "@/lib/responses/handleResponses"
import GenericModalContainer from "../modals/GenericModalContainer"
import Select from "../form/Select"

export default function ManageUsersPage() {
    const router = useRouter()
    const pathname = usePathname()

    const [role, setRole] = useState('user')
    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const { page, setPage, totalPages } = usePagination()
    const { users, setUsers, getUsers } = useUsers({ search, limit })

    const [roleModal, setRoleModal] = useState(false)
    const [user, setUser]: any = useState(false)

    const handleToggleBlock = (user: any) => {
        if (!user.isBlocked) {
            fetch(`/api/users/block/${user.id}`, { method: 'PATCH' }).then(res => res.json()).then(data => {
                handleResponses(data)
            })
        } else {
            fetch(`/api/users/unblock/${user.id}`, { method: 'PATCH' }).then(res => res.json()).then(data => {
                handleResponses(data)

            })
        }
        getUsers({ search, limit, page }).then(data => {
            setUsers(data.data)
        })

    }
    const handleToggleRole = (user: any) => {
        setUser(user)
        setRoleModal(true)
    }
    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        router.push(`${pathname}?${params}`)

        fetch(`/api/users?limit=${limit}&search=${search}&page=${page}`)
            .then(res => res.json())
            .then((data: any) => {

                setUsers(data.data)
                totalPages.current = data.totalPages
                console.log(totalPages)
            })
    }, [search, limit, page]);


    return <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Usuarios</h1>
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
        <ManageUsersTable items={users}
            onEditRole={(user: any) => handleToggleRole(user)}
            onToggleBlock={(user: any) => {
                handleToggleBlock(user)

            }}></ManageUsersTable>


        {roleModal && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button onClick={() => setRoleModal(false)}>X</Button></div>
            <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault()
                fetch(`/api/users/role/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget).entries())) }).then(res => res.json()).then(data => {
                    handleResponses(data)
                    getUsers({ search, limit, page }).then(data => {
                        setUsers(data.data)
                        totalPages.current = data.totalPages
                    })
                })

            }} className="flex flex-col gap-2">

                <h1 className="text-lg font-bold">Edita a {user.name}</h1>
                <Label>Rol</Label>
                <Select name="role" options={[{ value: 'ADMIN', label: 'admin' }, { value: 'SUPERADMIN', label: 'super admin' }, { value: 'USER', label: 'user' }]} defaultValue={role} onChange={(e: any) => setRole(e.target.value)}>

                </Select>

                <Button>Realizar</Button>
            </form>
        </GenericModalContainer>}
    </div>
}
