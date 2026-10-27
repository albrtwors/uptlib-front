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
import { fetchPostConfig } from "@/hooks/lib/fetch/fetchConfig"
import { SwalAlert } from "@/hooks/lib/swal/swal"
import GenericModalContainer from "../modals/GenericModalContainer"
import Select from "../form/Select"

const ROLE_OPTIONS = [
    { value: 'USER', label: 'Usuario' },
    { value: 'LIBRARIAN', label: 'Bibliotecario' },
    { value: 'ADMIN', label: 'Administrador' },
]

export default function ManageUsersPage() {
    const router = useRouter()
    const pathname = usePathname()

    const [role, setRole] = useState('USER')
    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const { page, setPage, totalPages } = usePagination()
    const { users, setUsers, getUsers } = useUsers({ search, limit })

    const [roleModal, setRoleModal] = useState(false)
    const [createModal, setCreateModal] = useState(false)
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
        setRole(user.role)
        setRoleModal(true)
    }

    const refreshUsers = () => {
        getUsers({ search, limit, page }).then(data => {
            setUsers(data.data)
            totalPages.current = data.totalPages
        })
    }

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const data = Object.fromEntries(new FormData(e.currentTarget).entries())

        try {
            const res = await fetch('/api/users', fetchPostConfig(data))
            const body = await res.json().catch(() => ({}))

            if (!res.ok) {
                const text = Array.isArray(body?.message) ? body.message[0] : body?.message
                SwalAlert.fire({ title: 'Error', text: text || 'No se pudo crear el usuario', icon: 'error' })
                return
            }

            await SwalAlert.fire({ title: 'Éxito', text: body.message || 'Usuario creado correctamente', icon: 'success' })
            setCreateModal(false)
            refreshUsers()
        } catch (error) {
            console.error(error)
            SwalAlert.fire({ title: 'Error', text: 'Ocurrió un error, inténtalo de nuevo', icon: 'error' })
        }
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
            })
    }, [search, limit, page]);


    return <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold">Gestionar Usuarios</h1>
            <Button type="button" onClick={() => setCreateModal(true)} className="w-full sm:w-auto">
                + Agregar Usuario
            </Button>
        </div>
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
            <div className="flex-1 flex justify-end"><Button type="button" onClick={() => setRoleModal(false)}>X</Button></div>
            <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault()
                fetch(`/api/users/role/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget).entries())) }).then(res => res.json()).then(data => {
                    handleResponses(data)
                    refreshUsers()
                })

            }} className="flex flex-col gap-2">

                <h1 className="text-lg font-bold">Edita a {user.name}</h1>
                <Label>Rol</Label>
                <Select name="role" options={ROLE_OPTIONS} defaultValue={role} onChange={(value: string) => setRole(value)}>

                </Select>

                <Button>Realizar</Button>
            </form>
        </GenericModalContainer>}

        {createModal && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button type="button" onClick={() => setCreateModal(false)}>X</Button></div>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-2">
                <h1 className="text-lg font-bold">Agregar Usuario</h1>

                <Label htmlFor="create-name">Nombre de Usuario</Label>
                <Input id="create-name" name="name" type="text" placeholder="Ingresa el nombre" />

                <Label htmlFor="create-email">Email</Label>
                <Input id="create-email" name="email" type="email" placeholder="correo@ejemplo.com" />

                <Label htmlFor="create-password">Contraseña</Label>
                <Input id="create-password" name="password" type="password" placeholder="Mínimo 6 caracteres" />

                <Label>Rol</Label>
                <Select name="role" options={ROLE_OPTIONS} defaultValue="USER" onChange={() => { }}>

                </Select>

                <Button className="mt-2">Crear Usuario</Button>
            </form>
        </GenericModalContainer>}
    </div>
}
