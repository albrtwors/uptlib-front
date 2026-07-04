"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import Button from "../ui/button/Button"
import { useManageModals } from "@/hooks/useModal"
import GenericModalContainer from "../modals/GenericModalContainer"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import { fetchDeleteConfig, fetchPatchConfig, fetchPostConfig } from "@/hooks/lib/fetch/fetchConfig"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { SwalAlert } from "@/hooks/lib/swal/swal"
import { usePathname, useRouter } from "next/navigation"
import { TvIcon } from "@heroicons/react/24/outline"
import { api } from "@/consts/api"
import ManageItemsTable from "./tables/manageItemsTable"
import ItemTypeSearcher from "../form/input/types/ItemTypeSearcher"
import Pagination from "../pagination/OwnPaginator"
import usePagination from "@/hooks/usePaginationOwn"
import TypeFilter from "../filters/items/TypeFilter"
import dynamic from 'next/dynamic'
import InventoryFormChatbot from "@/components/chatbot/inventory/InventoryFormChatbot"

const ExportItemsPDFButton = dynamic(
    () => import('./pdf/exportButton'),
    { ssr: false }
);

export const useItems = ({ search, limit }: any) => {
    const [items, setItems] = useState([])

    const getItems = async ({ search, limit = 10, page = 1, type }: any) => {
        return fetch(`/api/inventory?page=${page ?? ''}&type=${type ?? ''}&search=${search ?? ''}&limit=${limit ?? 10}`).then(res => res.json()).then(data => {
            return data
        })
    }

    useEffect(() => {
        getItems({ search, limit }).then(res => {
            setItems(res.data)
        })
    }, [])
    return { items, setItems, getItems }
}

export default function InventoryManagePage({ }) {
    const { page, setPage, totalPages } = usePagination()
    const [search, setSearch] = useState('')
    const [type, setType] = useState('')
    const [limit, setLimit] = useState('10')

    const pathname = usePathname()
    const router = useRouter()

    const { items, setItems, getItems } = useItems({ search, limit })
    const { createModal, setCreateModal, editModal, setEditModal, deleteModal, setDeleteModal } = useManageModals()
    const [selectedItem, setSelectedItem]: any = useState(null)
    const [typeModal, setTypeModal] = useState({ create: false, delete: false })

    // 💡 Añadimos typeId a los estados para sincronizar adecuadamente los IDs de la BD con el buscador
    const [createValues, setCreateValues] = useState({ name: '', code: '', description: '', stock: '', typeName: '', typeId: '' })
    const [editValues, setEditValues] = useState({ name: '', code: '', description: '', stock: '', typeName: '', typeId: '' })

    const { handleCreateType, handleDeleteType, handleCreateSubmit, handleDeleteSubmit, handleEditSubmit } = useHttpRequests({
        setPage, type, totalPages, search, limit, selectedItem, getItems, setItems, setDeleteModal
    })

    // Sincronizar el formulario de edición cuando seleccionas un item de la tabla
    useEffect(() => {
        if (selectedItem) {
            setEditValues({
                name: selectedItem.name || '',
                code: selectedItem.code || '',
                description: selectedItem.description || '',
                stock: selectedItem.totalStock?.toString() || '0',
                typeName: selectedItem.type?.name || '',
                typeId: selectedItem.type?.id || '' // 💡 Extraemos el ID real correspondiente al tipo
            })
        }
    }, [selectedItem])

    // Limpiar el estado de creación cada vez que se decide añadir un nuevo item
    useEffect(() => {
        if (createModal) {
            setCreateValues({ name: '', code: '', description: '', stock: '', typeName: '', typeId: '' })
        }
    }, [createModal])

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        params.set('type', type.toString())
        router.push(`${pathname}?${params}`)

        getItems({ search, limit, page, type }).then((res: any) => {
            setItems(res.data)
            totalPages.current = res.totalPages
        })
    }, [search, limit, page, type])

    const handleAICreateExtract = (data: any) => {
        setCreateValues(prev => ({
            ...prev,
            name: data.name ?? prev.name,
            code: data.code ?? prev.code,
            description: data.description ?? prev.description,
            stock: data.stock ?? prev.stock,
            typeName: data.typeName ?? prev.typeName,
            typeId: data.typeId ?? prev.typeId
        }))
    }

    const handleAIEditExtract = (data: any) => {
        setEditValues(prev => ({
            ...prev,
            name: data.name ?? prev.name,
            code: data.code ?? prev.code,
            description: data.description ?? prev.description,
            stock: data.stock ?? prev.stock,
            typeName: data.typeName ?? prev.typeName,
            typeId: data.typeId ?? prev.typeId
        }))
    }

    return <div className="flex flex-col gap-3">

        <h1 className="text-3xl font-bold">Inventario</h1>

        <div className="flex sm:flex-col lg:flex-row flex-col h-20 md:flex-row gap-3 min-w-full overflow-y-scroll">
            <div>
                <Label>Nombre del Item</Label>
                <Input onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} placeholder="Nombre del item"></Input>
            </div>

            <div>
                <Label>Cantidad por Pagina</Label>
                <Input type='number' onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (isNaN(parseInt(e.currentTarget.value))) {
                        setLimit('10')
                    } else {
                        setLimit(e.currentTarget.value)
                    }
                }} placeholder="Cantidad"></Input>
            </div>

            <TypeFilter setSearchHandler={setType}></TypeFilter>
            <Button onClick={() => setCreateModal(true)}>Añadir Item</Button>
            <ExportItemsPDFButton items={items} title={'Inventario de Items UPTALib'}></ExportItemsPDFButton>
        </div>

        <Pagination totalItems={totalPages.current} limit={limit} page={page} setPage={setPage}></Pagination>

        {/* MODAL CREAR */}
        {createModal && <GenericModalContainer>
            <div>
                <div className="flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>

                <form encType="multipart/form-data" onSubmit={handleCreateSubmit} className="flex flex-col gap-2 pb-14">
                    <div className="flex flex-col">
                        <Label>Nombre</Label>
                        <Input name='name' defaultValue={createValues.name} onChange={(e: any) => setCreateValues({ ...createValues, name: e.target.value })} placeholder="Nombre"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label isRequired={false}>Código</Label>
                        <Input name='code' defaultValue={createValues.code} onChange={(e: any) => setCreateValues({ ...createValues, code: e.target.value })} placeholder="Código"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label isRequired={false}>Descripcion</Label>
                        <Input name='description' defaultValue={createValues.description} onChange={(e: any) => setCreateValues({ ...createValues, description: e.target.value })} placeholder="Descripcion"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label>Stock</Label>
                        <Input name='stock' type='number' defaultValue={createValues.stock} onChange={(e: any) => setCreateValues({ ...createValues, stock: e.target.value })} placeholder="Cantidad..."></Input>
                    </div>

                    {/* 💡 Enviamos un objeto unificado con name e id mapeado desde createValues */}
                    <ItemTypeSearcher name="typeName" defaultValue={createValues.typeName ? { name: createValues.typeName, id: createValues.typeId } : undefined}></ItemTypeSearcher>

                    <Button>Subir</Button>
                </form>

                <InventoryFormChatbot mode="create" onExtract={handleAICreateExtract} />
            </div>
        </GenericModalContainer>}

        {/* MODAL EDITAR */}
        {(editModal && selectedItem) && <GenericModalContainer>
            <div>
                <div className="flex justify-end"><Button onClick={() => setEditModal(false)}>X</Button></div>
                <form encType="multipart/form-data" onSubmit={handleEditSubmit} className="flex flex-col gap-2 pb-14">
                    <div className="flex flex-col">
                        <Label>Nombre</Label>
                        <Input defaultValue={editValues.name} onChange={(e: any) => setEditValues({ ...editValues, name: e.target.value })} name='name' placeholder="Nombre"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label isRequired={false}>Código</Label>
                        <Input defaultValue={editValues.code} onChange={(e: any) => setEditValues({ ...editValues, code: e.target.value })} name='code' placeholder="Código"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label isRequired={false}>Descripcion</Label>
                        <Input defaultValue={editValues.description} onChange={(e: any) => setEditValues({ ...editValues, description: e.target.value })} name='description' placeholder="Descripcion"></Input>
                    </div>

                    <div className="flex flex-col">
                        <Label>Stock</Label>
                        <Input defaultValue={editValues.stock} onChange={(e: any) => setEditValues({ ...editValues, stock: e.target.value })} name='stock' type='number' placeholder="Cantidad..."></Input>
                    </div>

                    {/* 💡 Pasamos la estructura completa requerida para alimentar el useEffect del buscador interno */}
                    <ItemTypeSearcher name="typeName" defaultValue={editValues.typeName ? { name: editValues.typeName, id: editValues.typeId } : null}></ItemTypeSearcher>

                    <Button>Subir</Button>
                </form>

                <InventoryFormChatbot mode="edit" currentItem={selectedItem} onExtract={handleAIEditExtract} />
            </div>
        </GenericModalContainer>}

        {/* MODAL ELIMINAR */}
        {deleteModal && <GenericModalContainer>
            <div>
                <div className="flex justify-end"><Button onClick={() => setDeleteModal(false)}>X</Button></div>
                <form onSubmit={handleDeleteSubmit}>
                    <h3 className="text-lg font-bold">Seguro de que quieres eliminar {selectedItem.name}?</h3>
                    <div className="flex justify-center">
                        <Button className="bg-red-600 mt-3">Eliminar</Button>
                    </div>
                </form>
            </div>
        </GenericModalContainer>}

        {items && <ManageItemsTable
            onDelete={(item: any) => {
                setDeleteModal(true)
                setSelectedItem(item)
            }}
            onEdit={(item: any) => {
                setEditModal(true)
                setSelectedItem(item)
            }} items={items}></ManageItemsTable>
        }

        {typeModal.create && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button onClick={() => setTypeModal({ ...typeModal, create: false })}>X</Button></div>
            <form onSubmit={handleCreateType} className="flex flex-col gap-2">
                <Label>Tipo</Label>
                <Input name="name"></Input>
                <Button>Crear</Button>
            </form>
        </GenericModalContainer>}

        {typeModal.delete && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button onClick={() => setTypeModal({ ...typeModal, delete: false })}>X</Button></div>
            <form onSubmit={handleDeleteType} className="flex flex-col gap-2">
                <ItemTypeSearcher></ItemTypeSearcher>
                <Button>Eliminar</Button>
            </form>
        </GenericModalContainer>}

        <div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Tipos</h3>
                    </div>
                </div>

                <div className="flex gap-2 ml-auto">
                    <Button size="sm" onClick={() => setTypeModal({ ...typeModal, create: true })}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 shadow-sm px-6 py-2.5"
                        onClick={() => setTypeModal({ ...typeModal, delete: true })}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
    </div>
}

const useHttpRequests = ({ selectedItem, setDeleteModal, setPage, getItems, setItems, search, limit, page, type, totalPages }: any) => {
    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        fetch(`/api/inventory`, { method: 'POST', credentials: 'include', body: data }).then(res => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getItems({ search, limit, type }).then((res: any) => {
                    setItems(res.data)
                    totalPages.current = res.totalPages
                })
            }
        })
    }

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        fetch(`/api/inventory/${selectedItem.id}`, {
            method: 'PATCH',
            body: JSON.stringify(Object.fromEntries(data.entries())),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getItems({ search, limit, page, type }).then((res: any) => {
                    setItems(res.data)
                    totalPages.current = res.totalPages
                })
            }
        })
    }

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        fetch(`/api/inventory/${selectedItem.id}`, fetchDeleteConfig()).then(res => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                setDeleteModal(false)
                getItems({ search, limit, page: 1, type }).then((res: any) => {
                    setItems(res.data)
                    setPage(1)
                    totalPages.current = res.totalPages
                })
            }
        })
    }

    const handleCreateType = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const data = Object.fromEntries(form.entries())

        fetch(`/api/item-type`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()).then(data => {
            handleResponses(data)
        })
    }

    const handleDeleteType = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const data = Object.fromEntries(form.entries())

        fetch(`/api/item-type/${data.typeId}`, { method: 'DELETE', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()).then(data => {
            handleResponses(data)
        })
    }

    return { handleCreateType, handleCreateSubmit, handleDeleteType, handleDeleteSubmit, handleEditSubmit }
}