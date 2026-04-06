"use client"

import { ChangeEvent, useEffect, useState } from "react"
import Button from "../ui/button/Button"
import { useManageModals } from "@/hooks/useModal"
import GenericModalContainer from "../modals/GenericModalContainer"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import { fetchDeleteConfig, fetchPatchConfig, fetchPostConfig } from "@/lib/fetch/fetchConfig"
import { handleResponses } from "@/lib/responses/handleResponses"
import { SwalAlert } from "@/lib/swal/swal"
import { usePathname, useRouter } from "next/navigation"
import { TvIcon } from "@heroicons/react/24/outline"
import { api } from "@/consts/api"


const useItems = ({ search, limit }: any) => {
    const [items, setItems] = useState([])


    const getItems = async ({ search, limit }: any) => {
        return fetch(`/api/inventory?search=${search}&limit=${limit ?? 10}`).then(res => res.json()).then(data => {
            return data
        })
    }

    useEffect(() => {
        getItems({ search, limit }).then(res => {
            setItems(res)
        })
    }, [])
    return { items, setItems, getItems }
}


export default function InventoryManagePage({ }) {
    //search handler
    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState('10')
    //routing
    const pathname = usePathname()
    const router = useRouter()
    //books
    const { items, setItems, getItems } = useItems({ search, limit })
    //modals
    const { createModal, setCreateModal, editModal, setEditModal, deleteModal, setDeleteModal } = useManageModals()
    const [selectedItem, setSelectedItem]: any = useState(null)

    //http responses handler
    const { handleCreateSubmit, handleDeleteSubmit, handleEditSubmit } = useHttpRequests({ search, limit, selectedItem, getItems, setItems, setDeleteModal })



    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        router.push(`${pathname}?${params}`)

        getItems({ search, limit }).then((res: any) => setItems(res))


    }, [search, limit])


    return <div className="flex flex-col gap-3">

        <h1 className="text-3xl font-bold">Inventario</h1>
        <Button onClick={() => setCreateModal(true)}>Añadir Item</Button>
        <div className="flex gap-1">

            <Input onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} placeholder="Nombre del item"></Input>
            <Input type='number' onChange={(e: ChangeEvent<HTMLInputElement>) => setLimit(e.target.value)} placeholder="Cantidad"></Input>
        </div>
        {createModal && <GenericModalContainer>
            <div>
                <div className="flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>

                <form encType="multipart/form-data" action="" onSubmit={handleCreateSubmit} className="flex flex-col gap-2">

                    <div className="flex flex-col">
                        <Label>Nombre</Label>
                        <Input name='name' placeholder="Nombre"></Input>
                    </div>


                    <div className="flex flex-col">
                        <Label>Descripcion</Label>
                        <Input name='description' placeholder="Descripcion"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label>Cantidad</Label>
                        <Input name='stock' type='number' placeholder="Cantidad..."></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label>Imagen</Label>
                        <Input name='img' type='file' placeholder="Imagen de referencia"></Input>
                    </div>

                    <Button>Subir</Button>
                </form>
            </div>
        </GenericModalContainer>}

        {(editModal && selectedItem) && <GenericModalContainer>
            <div>
                <div className="flex justify-end"><Button onClick={() => setEditModal(false)}>X</Button></div>
                <form encType="multipart/form-data" action="" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEditSubmit(e)} className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <Label>Nombre</Label>
                        <Input defaultValue={selectedItem.name} name='name' placeholder="Nombre"></Input>
                    </div>


                    <div className="flex flex-col">
                        <Label>Descripcion</Label>
                        <Input defaultValue={selectedItem.description} name='description' placeholder="Descripcion"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label>Cantidad</Label>
                        <Input defaultValue={selectedItem.stock} name='stock' type='number' placeholder="Cantidad..."></Input>
                    </div>
                    <Button>Subir</Button>
                </form>
            </div>
        </GenericModalContainer>}

        {deleteModal && <GenericModalContainer>
            <div>
                <div className="flex justify-end"><Button onClick={() => setDeleteModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteSubmit(e)}>
                    <h3 className="text-lg font-bold">Seguro de que quieres eliminar {selectedItem.name}?</h3>
                    <div className="flex justify-center">
                        <Button className="bg-red-600 mt-3">Eliminar</Button>
                    </div>
                </form>
            </div>
        </GenericModalContainer>}

        <div className="grid grid-cols-5 gap-10">
            {
                items && items?.map((item: any) => <div key={item.id} className="p-5 flex flex-col gap-1 items-center rounded-lg shadow-xl hover:scale-110 transition-all">
                    {!item.routeimg && <div onClick={() => setSelectedItem(false)} className="size-30 bg-blue-600 rounded-lg"></div>}
                    {item.routeimg && <img onClick={() => setSelectedItem(false)} className="w-32 h-32 object-cover rounded-lg" src={`${api.base_url}${item.routeimg}`} alt={item.name} />}

                    <strong className="text-md">{item.name}</strong>

                    <p>{item.description}</p>

                    <p className="font-bold">Cantidad: <span className="text-blue-600">{item.stock}</span></p>
                    <div className="flex gap-1 justify-center">
                        <Button onClick={() => {
                            setSelectedItem(item)
                            setEditModal(true)

                        }}>Editar</Button>
                        <Button onClick={() => {
                            setSelectedItem(item)
                            setDeleteModal(true)
                        }} className="bg-red-600">Eliminar</Button>
                    </div>
                </div>)
            }

        </div>

    </div>
}


const useHttpRequests = ({ selectedItem, setDeleteModal, getItems, setItems, search, limit }: any) => {
    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        fetch(`/api/inventory`, { method: 'POST', credentials: 'include', body: data }).then(res => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getItems({ search, limit }).then((res: any) => setItems(res))
            }
        })

    }

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        fetch(`/api/inventory/${selectedItem.id}`, fetchPatchConfig(data)).then(res => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getItems({ search, limit }).then((res: any) => setItems(res))
            }
        })
    }

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget).entries())
        fetch(`/api/inventory/${selectedItem.id}`, fetchDeleteConfig()).then(res => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                setDeleteModal(false)
                getItems({ search, limit }).then((res: any) => setItems(res))
            }
        })
    }
    return { handleCreateSubmit, handleDeleteSubmit, handleEditSubmit }
}