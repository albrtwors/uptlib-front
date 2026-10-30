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
import CopiesManager from "@/components/copies/CopiesManager"
import FilterBar from "@/components/ui/FilterBar"
import SearchField from "@/components/form/SearchField"
import BulkActionBar from "@/components/ui/BulkActionBar"
import useRowSelection from "@/hooks/lib/useRowSelection"
import { useBulkActions } from "@/hooks/lib/useBulkActions"
import { itemToRecord } from "@/utils/jsonRecords"
import { formCacheKey, useCachedState } from "@/hooks/lib/useCachedForm"
import InventoryRecordsWorkspaceModal from "./records/InventoryRecordsWorkspaceModal"

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
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [type, setType] = useState('')
    const [limit, setLimit] = useState('10')

    const pathname = usePathname()
    const router = useRouter()

    const { items, setItems, getItems } = useItems({ search, limit })
    const { deleteModal, setDeleteModal } = useManageModals()
    const [selectedItem, setSelectedItem]: any = useState(null)
    const [copiesItem, setCopiesItem]: any = useState(null)
    const [typeModal, setTypeModal] = useState({ create: false, delete: false })

    // 💡 La mesa de trabajo vive en el navegador: si la página se recarga o se cierra
    // el portátil, el lote de artículos reaparece tal como se dejó.
    const {
        value: workspace,
        setValue: setWorkspace,
        clear: clearWorkspaceCache
    } = useCachedState<any>(formCacheKey('inventory-workspace-open'), () => null)

    const { handleCreateType, handleDeleteType, handleDeleteSubmit } = useHttpRequests({
        setPage, type, totalPages, search, limit, selectedItem, getItems, setItems, setDeleteModal
    })

    const reload = (targetPage = page) => getItems({ search, limit, page: targetPage, type }).then((res: any) => {
        setItems(res.data)
        totalPages.current = res.totalPages
    })

    const selection = useRowSelection(items)
    const { deleteSelected, exportSelected, busy: bulkBusy } = useBulkActions({
        resource: 'inventory',
        selection,
        unit: 'item(s)',
        toRecord: itemToRecord,
        fileBaseName: 'inventario',
        onDone: () => reload(1)
    })

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', search)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        params.set('type', type.toString())
        router.replace(`${pathname}?${params}`)

        getItems({ search, limit, page, type }).then((res: any) => {
            setItems(res.data)
            totalPages.current = res.totalPages
        })
    }, [search, limit, page, type])

    return <div className="flex flex-col gap-3">

        <h1 className="text-3xl font-bold">Inventario</h1>

        <FilterBar
            actions={<>
                <Button type="button" onClick={() => setWorkspace({ mode: 'create', seeds: [] })}>Añadir Item</Button>
                <ExportItemsPDFButton items={items} title={'Inventario de Items UPTALib'}></ExportItemsPDFButton>
            </>}
        >
            <SearchField
                label="Nombre del Item"
                placeholder="Nombre del item"
                value={searchInput}
                onValueChange={setSearchInput}
                onSubmit={(term) => {
                    setPage(1)
                    setSearch(term)
                }}
            />

            <div className="sm:max-w-40">
                <Label>Cantidad por Pagina</Label>
                <Input type='number' defaultValue={10} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setLimit(isNaN(parseInt(e.currentTarget.value)) ? '10' : e.currentTarget.value)
                }} placeholder="Cantidad"></Input>
            </div>

            <TypeFilter setSearchHandler={setType}></TypeFilter>
        </FilterBar>

        <Pagination totalItems={totalPages.current} limit={limit} page={page} setPage={setPage}></Pagination>

        <BulkActionBar
            selection={selection}
            unit="item(s)"
            busy={bulkBusy}
            onDelete={deleteSelected}
            onExport={exportSelected}
            onEdit={() => setWorkspace({ mode: 'edit', seeds: selection.selectedRows })}
        />

        {/* MESA DE TRABAJO: crear, editar en lote e importar/exportar JSON */}
        {workspace &&
            <InventoryRecordsWorkspaceModal
                mode={workspace.mode ?? 'create'}
                seeds={workspace.seeds ?? []}
                onClose={clearWorkspaceCache}
                onSaved={() => reload()}
            />}

        {/* MODAL ELIMINAR */}
        {deleteModal && selectedItem && <GenericModalContainer>
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
            selection={selection}
            onDelete={(item: any) => {
                setDeleteModal(true)
                setSelectedItem(item)
            }}
            onEdit={(item: any) => setWorkspace({ mode: 'edit', seeds: [item] })}
            onCopies={(item: any) => setCopiesItem(item)}
            items={items}></ManageItemsTable>
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

        {copiesItem && <CopiesManager
            kind="inventory"
            resourceId={copiesItem.id}
            title={copiesItem.name}
            parentCode={copiesItem.code}
            onClose={() => setCopiesItem(null)}
            onChanged={() => reload()}
        />}

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

    return { handleCreateType, handleDeleteType, handleDeleteSubmit }
}