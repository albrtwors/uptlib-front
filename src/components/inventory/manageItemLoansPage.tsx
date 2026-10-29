"use client"

import { useEffect, useRef, useState } from "react";
import { useManageBooks } from "../books/manageBooksPage";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import GenericModalContainer from "../modals/GenericModalContainer";
import Label from "../form/Label";
import { useHttpSubmit } from "@/hooks/itemLoans/useHttpRequests";
import { useManageModals } from "@/hooks/useModal";
import PhysicalBookSearcher from "../form/input/physical-book-searcher/PhysicalBookSearcher";
import { OPERATIONS } from "@/consts/operations";
import TextArea from "../form/input/TextArea";
import ManageLoansTable from "@/app/(admin)/physical-books/tables/manageLoansTable";
import { usePhysicalBookLoans } from "@/hooks/physicalBooksLoans/usePhysicalBookLoans";
import Pagination from "../pagination/OwnPaginator";
import usePagination from "@/hooks/usePaginationOwn";
import useItemLoans from "@/hooks/itemLoans/useItemLoans";
import ManageItemLoansTable from "./tables/manageLoansTable";
import ItemSearcher from "../form/input/itemSearcher/itemSearcher";
import CopySelector from "../copies/CopySelector";
import ExportItemsPDFButton from "./pdf/exportButton";
import FilterBar from "@/components/ui/FilterBar";
import SearchField from "@/components/form/SearchField";
import dynamic from "next/dynamic";


const ExportPDFButton = dynamic(
    () => import('./pdf/exportLoansButton'),
    { ssr: false }
);




export default function ManageItemLoansPage() {
    //modal handling
    const { setCreateModal, setEditModal, setDeleteModal, createModal, deleteModal, editModal } = useManageModals()
    const [selectedItem, setSelectedItem]: any = useState(null)
    const [selectedBook, setSelectedBook]: any = useState(null)
    const [loanItemId, setLoanItemId] = useState<string | null>(null)
    const [selectedCopyIds, setSelectedCopyIds] = useState<string[]>([])

    //search handling
    const pathname = usePathname();
    const router = useRouter();

    //search
    const [searchInput, setSearchInput] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [limit, setLimit] = useState(10)
    const { loans, setLoans, getLoans } = usePhysicalBookLoans({ search: appliedSearch, limit })
    const { page, setPage, totalPages } = usePagination()
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: appliedSearch, limit: limit })
    const { itemLoans, setItemLoans, getItemLoans } = useItemLoans({ search: appliedSearch, limit, page })
    //handlehttp
    const { handleCreateSubmit, handleEditSubmit, handleDeleteSubmit, handleSettle } = useHttpSubmit({ setItemLoans, getItemLoans, page, totalPages, getLoans, setLoans, setBooks: setUseAllBooks, getBooks, selectedBook, limit, setDeleteModal, setCreateModal, setEditModal, search: appliedSearch, setPage })


    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', appliedSearch)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        router.replace(`${pathname}?${params}`)

        fetch(`/api/inventory-operation/loan?limit=${limit}&search=${appliedSearch}&page=${page}`)
            .then(res => res.json())
            .then((data: any) => {

                setItemLoans(data.data)
                totalPages.current = data.totalPages
                console.log(totalPages)
            })
    }, [appliedSearch, limit, page]);



    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Préstamos</h1>



        <FilterBar
            actions={<>
                <Button type="button" onClick={() => setCreateModal(true)}>Hacer préstamo</Button>
                <ExportPDFButton items={itemLoans} title="Reporte de Prestamos"></ExportPDFButton>
            </>}
        >
            <div className="sm:max-w-40">
                <Label>Cantidad por Pagina</Label>
                <Input type="number" defaultValue={10} placeholder="Cantidad" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const limi = parseInt(e.target.value)
                    setLimit(!isNaN(limi) && limi > 0 ? limi : 10)
                }}></Input>
            </div>

            <SearchField
                label="Buscar por Nombre del Item"
                placeholder="Buscar items..."
                value={searchInput}
                onValueChange={setSearchInput}
                onSubmit={(term) => {
                    setPage(1)
                    setAppliedSearch(term)
                }}
            />
        </FilterBar>



        <Pagination page={page} setPage={setPage} totalItems={totalPages.current || 0} limit={limit} showInfo={true}></Pagination>

        <ManageItemLoansTable onSettle={(id: any) => handleSettle(id)} loanOperations={itemLoans}></ManageItemLoansTable>


        {createModal &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateSubmit(e)} className="flex flex-col gap-2">

                    <div>
                        <ItemSearcher onSelect={(item: any) => {
                            setLoanItemId(item?.id ?? null)
                            setSelectedCopyIds([])
                        }}></ItemSearcher>
                    </div>


                    {loanItemId && (
                        <CopySelector
                            key={loanItemId}
                            kind="inventory"
                            resourceId={loanItemId}
                            onChange={setSelectedCopyIds}
                        />
                    )}

                    <div>
                        <Label>Cantidad</Label>
                        <Input
                            type="number"
                            name="quantity"
                            placeholder="30.."
                            disabled={selectedCopyIds.length > 0}
                            defaultValue={selectedCopyIds.length > 0 ? selectedCopyIds.length : undefined}
                        ></Input>
                    </div>

                    <div>
                        <Label>Nombres del Prestatario</Label>
                        <Input name="personNames" placeholder="Johnny Ryan"></Input>
                    </div>

                    <div>
                        <Label>Apellidos del Prestatario</Label>
                        <Input name="personSurNames" placeholder="Knoxville Lacy"></Input>
                    </div>


                    <div>
                        <Label isRequired={false}>Cédula del Prestatario (solo números)</Label>
                        <Input name="personId" placeholder="ej: 31758635"></Input>

                    </div>
                    <div>
                        <Label isRequired={false}>Observaciones</Label>
                        <textarea name="observations" className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"></textarea>
                    </div>
                    {/* <Label>Pdf</Label>
                    <Input type="text" name="routepdf" placeholder="pdf"></Input> */}

                    <Button>Realizar</Button>
                </form>
            </GenericModalContainer>
        }

        {(editModal && selectedBook) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setEditModal(false)}>X</Button></div>
                <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEditSubmit(e)} className="flex flex-col gap-2">
                    <div>
                        <Label>Título del libro</Label>
                        <Input defaultValue={selectedBook.title} name="title" placeholder="Mago de Oz"></Input>
                    </div>
                    <div>
                        <Label isRequired={false}>Descripción</Label>
                        <Input defaultValue={selectedBook.description} name="description" placeholder="Las aventuras de Dorothy en la tierra de OZ"></Input>
                    </div>

                    <div>
                        <Label>Pdf</Label>
                        <Input type="file" name="pdf" placeholder="archivo"></Input>
                    </div>
                    {/* <div>
                        <Label>Pdf</Label>
                        <Input type="file" name="pdf" placeholder="archivo"></Input>
                    </div> */}
                    <div>
                        <Label>Imágen</Label>
                        <Input defaultValue={selectedBook.routeimg} name="routeimg" placeholder="image"></Input>

                    </div>
                    <Button>Guardar</Button>
                </form>
            </GenericModalContainer>}

        {(deleteModal && selectedBook) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setDeleteModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteSubmit(e)} className="flex flex-col gap-2">

                    <h3 className="text-lg font-bold">Seguro de que quieres eliminar {selectedBook.title}?</h3>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => setDeleteModal(false)}>Cancelar</Button>
                        <Button className="bg-red-600">Eliminar</Button>
                    </div>

                </form>
            </GenericModalContainer>}

    </section>
}