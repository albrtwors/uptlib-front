"use client"

import { useEffect, useState } from "react";
import { useManageBooks } from "../books/manageBooksPage";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import GenericModalContainer from "../modals/GenericModalContainer";
import Label from "../form/Label";
import { useHttpSubmit } from "@/hooks/itemOperations/useHttpSubmit";
import { useManageModals } from "@/hooks/useModal";
import PhysicalBookSearcher from "../form/input/physical-book-searcher/PhysicalBookSearcher";
import { OPERATIONS } from "@/consts/operations";
import TextArea from "../form/input/TextArea";
import ManageLoansTable from "@/app/(admin)/physical-books/tables/manageLoansTable";
import { usePhysicalBookLoans } from "@/hooks/physicalBooksLoans/usePhysicalBookLoans";
import ManagePhysicalBooksTable from "../physical-books/tables/operationsTable";
import { useItemOperation } from "@/hooks/itemOperations/itemOperations";
import usePagination from "@/hooks/usePaginationOwn";
import Pagination from "../pagination/OwnPaginator";
import ManageItemOperationsTable from "./tables/manageOperationsHistoricTable";
import { useOperations } from "@/hooks/physicalBookOperations/useOperations";
import ItemSearcher from "../form/input/itemSearcher/itemSearcher";

export default function ItemOperationsPage() {
    //modal handling
    const { setCreateModal, setEditModal, setDeleteModal, createModal, deleteModal, editModal } = useManageModals()
    const [entrieModal, setEntrieModal] = useState<any>(false)
    const [dropModal, setDropModal] = useState<any>(false)
    const [selectedBook, setSelectedBook]: any = useState(null)
    const [selectedOperation, setSelectedOperation] = useState<any>(null)

    //search handling
    const pathname = usePathname();
    const router = useRouter();

    //search
    const [searchInput, setSearchInput] = useState('')
    const { page, totalPages, setPage } = usePagination()
    const [limit, setLimit] = useState(10)
    const { loans, setLoans, getLoans } = usePhysicalBookLoans({ search: searchInput, limit })
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: searchInput, limit: limit })
    const { operations, setOperations, getOperations } = useItemOperation({ search: searchInput, limit })


    //handlehttp
    const { handleCreateSubmit, handleEntrieSubmit, handleDropSubmit, handleEditSubmit, handleDeleteSubmit } = useHttpSubmit({ getOperations, setOperations, setBooks: setUseAllBooks, getBooks, selectedBook, limit, setDeleteModal, setCreateModal, setEditModal, search: searchInput, selectedOperation, totalPages })


    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', searchInput)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        router.push(`${pathname}?${params}`)

        getOperations({ search: searchInput, limit, page }).then((res: any) => {
            console.log(res)
            setOperations(res.data)
            totalPages.current = res.totalPages
        })

    }, [searchInput, limit, page]);



    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Histórico de Operaciones</h1>
        <div className="flex gap-2 justify-center">
            <Button className="flex-1" onClick={() => setEntrieModal(true)}>Entrada</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-400" onClick={() => setDropModal(true)}>Baja</Button>
            {/* <Button className="flex-1" onClick={() => setCreateModal(true)}>Hacer Ajuste</Button> */}
        </div>



        <div className="flex gap-3">

            <Input type="number" placeholder="Cantidad" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const limi = parseInt(e.target.value)
                if (!isNaN(limi) && limi > 0) {
                    setLimit(parseInt(e.target.value))
                } else {
                    setLimit(10)
                }

            }}></Input>

            <Input className="w-full" placeholder="Buscar libros..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}></Input>

        </div>

        <Pagination page={page} showInfo={true} setPage={setPage} limit={limit} totalItems={totalPages.current} />

        <ManageItemOperationsTable operations={operations}></ManageItemOperationsTable>


        {createModal &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateSubmit(e)} className="flex flex-col gap-2">

                    <div>
                        <PhysicalBookSearcher></PhysicalBookSearcher>
                    </div>

                    <input type="hidden" name="operation" value="PRESTAMO"></input>
                    <div>
                        <Label>Cantidad</Label>
                        <Input name="quantity" placeholder="30.."></Input>
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
                        <Label>Cédula del Prestatario (solo números)</Label>
                        <Input name="personId" placeholder="ej: 31758635"></Input>

                    </div>
                    <div>
                        <Label>Observaciones</Label>
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
                        <Label>Descripción</Label>
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

        {(deleteModal && selectedOperation) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setDeleteModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteSubmit(e)} className="flex flex-col gap-2">

                    <h3 className="text-lg font-bold">Seguro de que quieres eliminar {selectedOperation.book.title}?</h3>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => setDeleteModal(false)}>Cancelar</Button>
                        <Button className="bg-red-600">Eliminar</Button>
                    </div>

                </form>
            </GenericModalContainer>}

        {(entrieModal) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setEntrieModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEntrieSubmit(e)} className="flex flex-col gap-2">
                    <div>
                        <Label>Nombre del Encargado</Label>
                        <Input name="personNames"></Input>
                    </div>

                    <div>
                        <Label>Apellido del Encargado</Label>
                        <Input name="personSurNames"></Input>
                    </div>

                    <div>
                        <Label>Cantidad a agregar</Label>
                        <Input name="quantity"></Input>
                    </div>
                    <div>
                        <ItemSearcher></ItemSearcher>
                    </div>

                    <Button>Guardar</Button>

                </form>
            </GenericModalContainer>}


        {(dropModal) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setDropModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDropSubmit(e)} className="flex flex-col gap-2">
                    <div>
                        <Label>Nombre del Encargado</Label>
                        <Input name="personNames"></Input>
                    </div>

                    <div>
                        <Label>Apellido del Encargado</Label>
                        <Input name="personSurNames"></Input>
                    </div>

                    <div>
                        <Label>Cantidad a agregar</Label>
                        <Input name="quantity"></Input>
                    </div>
                    <div>
                        <ItemSearcher></ItemSearcher>
                    </div>

                    <Button>Guardar</Button>

                </form>
            </GenericModalContainer>}
    </section>
}