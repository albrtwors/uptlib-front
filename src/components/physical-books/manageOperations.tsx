"use client"

import { useEffect, useState } from "react";
import { useManageBooks } from "../books/manageBooksPage";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import GenericModalContainer from "../modals/GenericModalContainer";
import Label from "../form/Label";
import { useHttpSubmit } from "@/hooks/physicalBookOperations/useHttpSubmit";
import { useManageModals } from "@/hooks/useModal";
import PhysicalBookSearcher from "../form/input/physical-book-searcher/PhysicalBookSearcher";
import CopySelector from "../copies/CopySelector";
import { OPERATIONS } from "@/consts/operations";
import TextArea from "../form/input/TextArea";
import { usePhysicalBookLoans } from "@/hooks/physicalBooksLoans/usePhysicalBookLoans";
import ManagePhysicalBooksTable from "./tables/operationsTable";
import { useOperations } from "@/hooks/physicalBookOperations/useOperations";
import usePagination from "@/hooks/usePaginationOwn";
import Pagination from "../pagination/OwnPaginator";
import dynamic from "next/dynamic";
import FilterBar from "@/components/ui/FilterBar";
import PageSizeSelect from "@/components/ui/PageSizeSelect";
import SearchField from "@/components/form/SearchField";
import BulkActionBar from "@/components/ui/BulkActionBar";
import useRowSelection from "@/hooks/lib/useRowSelection";
import { useBulkActions } from "@/hooks/lib/useBulkActions";
import QrScannerModal from "@/components/qr/QrScannerModal";
import { useQrScan } from "@/hooks/qr/useQrScan";

const ExportPDFButton = dynamic(
    () => import('./pdf/exportOperationsButton'),
    { ssr: false }
)



export default function ManageOperationsPage() {
    //modal handling
    const { setCreateModal, setEditModal, setDeleteModal, createModal, deleteModal, editModal } = useManageModals()
    const [entrieModal, setEntrieModal] = useState<any>(false)
    const [dropModal, setDropModal] = useState<any>(false)
    const [entrieBookId, setEntrieBookId] = useState<string | null>(null)
    const [selectedEntrieCopies, setSelectedEntrieCopies] = useState<string[]>([])
    const [dropBookId, setDropBookId] = useState<string | null>(null)
    const [selectedDropCopies, setSelectedDropCopies] = useState<string[]>([])
    const [selectedBook, setSelectedBook]: any = useState(null)
    const [selectedOperation, setSelectedOperation] = useState<any>(null)
    // El último QR leído: con él sabemos qué formulario abrir y qué ejemplar marcar.
    const [scanned, setScanned] = useState<{ form: 'entrie' | 'drop'; record: any; copy: any } | null>(null)

    //search handling
    const pathname = usePathname();
    const router = useRouter();

    //search · la URL es la que manda: un F5 o un enlace compartido recuperan el contexto
    const searchParams = useSearchParams()
    const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
    const [appliedSearch, setAppliedSearch] = useState(searchParams.get('search') ?? '')
    const [type, setType] = useState(searchParams.get('type') ?? '')
    const { page, totalPages, setPage } = usePagination(searchParams.get('page') ?? 1)
    const [limit, setLimit] = useState(parseInt(searchParams.get('limit') ?? '10', 10) || 10)
    const { loans, setLoans, getLoans } = usePhysicalBookLoans({ search: appliedSearch, limit })
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: appliedSearch, limit: limit })
    const { operations, setOperations, getOperations } = useOperations({ search: appliedSearch, limit })

    //handlehttp
    const { handleCreateSubmit, handleEntrieSubmit, handleDropSubmit, handleEditSubmit, handleDeleteSubmit } = useHttpSubmit({ getOperations, setOperations, setBooks: setUseAllBooks, getBooks, selectedBook, limit, setDeleteModal, setCreateModal, setEditModal, setEntrieModal, setDropModal, search: appliedSearch, type, selectedOperation, totalPages })


    const reload = (targetPage = page) => fetch(`/api/physical-book-operation?limit=${limit}&page=${targetPage}&type=${type}&search=${appliedSearch}`)
        .then(res => res.json())
        .then((data: any) => {
            setOperations(data.data)
            totalPages.current = data.totalPages
        })

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', appliedSearch)
        params.set('type', type)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        router.replace(`${pathname}?${params}`)

        reload()
    }, [appliedSearch, type, limit, page]);

    const selection = useRowSelection(operations)
    const { deleteSelected, busy: bulkBusy } = useBulkActions({
        resource: 'physical-book-operation',
        selection,
        unit: 'operación(es)',
        onDone: () => reload(1)
    })

    // 💡 El QR de un ejemplar abre la operación que le toca según su estado: lo dado
    // de baja se reactiva y lo disponible se da de baja. El QR del libro y un
    // código suelto sólo filtran el histórico por ese recurso.
    const { scanning, setScanning, handleRaw } = useQrScan({
        resource: 'physical-book',
        onResult: ({ record, copy, payload }) => {
            const term = record
                ? (record.code || record.title || '')
                : payload.type === 'code' ? payload.value : ''
            if (term) {
                setSearchInput(term)
                setAppliedSearch(term)
                setPage(1)
            }
            if (!record || !copy?.id) return

            const status = String(copy.status ?? '').toUpperCase()
            if (status === 'BAJA' || status === 'MANTENIMIENTO') {
                setScanned({ form: 'entrie', record, copy })
                setEntrieBookId(record.id)
                setSelectedEntrieCopies([copy.id])
                setEntrieModal(true)
            } else if (status === 'DISPONIBLE') {
                setScanned({ form: 'drop', record, copy })
                setDropBookId(record.id)
                setSelectedDropCopies([copy.id])
                setDropModal(true)
            }
        }
    })

    const entrieScan = scanned?.form === 'entrie' ? scanned : null
    const dropScan = scanned?.form === 'drop' ? scanned : null



    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Histórico de Operaciones</h1>


        <FilterBar
            actions={<>
                <Button type="button" onClick={() => { setScanned(null); setEntrieBookId(null); setSelectedEntrieCopies([]); setEntrieModal(true) }}>Entrada</Button>
                <Button type="button" className="bg-red-600 hover:bg-red-400" onClick={() => { setScanned(null); setDropBookId(null); setSelectedDropCopies([]); setDropModal(true) }}>Baja</Button>
                <Button type="button" variant="outline" onClick={() => setScanning(true)}>Escanear QR</Button>
                <ExportPDFButton items={operations} title={'Reporte de operaciones de Libros físicos'} ></ExportPDFButton>
            </>}
        >
            <PageSizeSelect limit={limit} onLimitChange={(size) => { setLimit(size); setPage(1) }} />
            <SearchField
                label="Buscar por Nombre del Libro"
                placeholder="Buscar libros..."
                value={searchInput}
                onValueChange={setSearchInput}
                onSubmit={(term) => {
                    setPage(1)
                    setAppliedSearch(term)
                }}
            />
            <div>
                <Label>Tipo de Operación</Label>
                <select value={type} onChange={(e: any) => {
                    setType(e.target.value)
                    setPage(1)
                }} className="h-11 w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700">
                    <option value="">TODAS LAS OPERACIONES</option>
                    {OPERATIONS.map((operationType: string) => <option key={operationType} value={operationType}>{operationType}</option>)}
                </select>
            </div>
        </FilterBar>

        <Pagination page={page} showInfo={true} setPage={setPage} limit={limit} totalItems={totalPages.current} />

        <BulkActionBar selection={selection} unit="operación(es)" busy={bulkBusy} onDelete={deleteSelected} />

        <ManagePhysicalBooksTable selection={selection} onDelete={(operation: any) => {
            setSelectedOperation(operation)
            setDeleteModal(true)
        }} onEdit={(id: any) => { console.log('yay') }} operations={operations}></ManagePhysicalBooksTable>




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
                        <Button type="button" onClick={() => setDeleteModal(false)}>Cancelar</Button>
                        <Button className="bg-red-600">Eliminar</Button>
                    </div>

                </form>
            </GenericModalContainer>}

        {(entrieModal) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => { setScanned(null); setEntrieModal(false) }}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEntrieSubmit(e)} className="flex flex-col gap-2">
                    <div>
                        <PhysicalBookSearcher defaultValue={entrieScan ? entrieScan.record : null} onSelect={(book: any) => {
                            setEntrieBookId(book?.id ?? null)
                            setSelectedEntrieCopies([])
                            setScanned(null)
                        }}></PhysicalBookSearcher>
                    </div>

                    {entrieScan && (
                        <p className="text-sm bg-amber-50 text-amber-900 border border-amber-200 rounded-lg px-3 py-2">
                            Escaneado: <strong>{entrieScan.record.title ?? 'Libro'}</strong>
                            {entrieScan.record.code ? ` · ${entrieScan.record.code}` : ''}
                            {entrieScan.copy?.code ? ` · ejemplar ${entrieScan.copy.code}` : ''}
                        </p>
                    )}

                    {entrieBookId && (
                        <CopySelector
                            key={entrieBookId}
                            kind="physical-book"
                            resourceId={entrieBookId}
                            statuses={["BAJA", "MANTENIMIENTO"]}
                            label="Ejemplares a reactivar"
                            emptyText="No hay ejemplares dados de baja ni en mantenimiento. Se crearán ejemplares nuevos con la cantidad."
                            initialSelected={entrieScan?.copy?.id ? [entrieScan.copy.id] : []}
                            onChange={setSelectedEntrieCopies}
                        />
                    )}

                    <div>
                        <Label>Cantidad a agregar</Label>
                        <Input
                            type="number"
                            name="quantity"
                            placeholder="3"
                            disabled={selectedEntrieCopies.length > 0}
                            defaultValue={selectedEntrieCopies.length > 0 ? selectedEntrieCopies.length : undefined}
                        ></Input>
                    </div>

                    <div>
                        <Label>Nombre del Encargado</Label>
                        <Input name="personNames"></Input>
                    </div>

                    <div>
                        <Label>Apellido del Encargado</Label>
                        <Input name="personSurNames"></Input>
                    </div>

                    <Button>Guardar</Button>

                </form>
            </GenericModalContainer>}


        {(dropModal) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => { setScanned(null); setDropModal(false) }}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDropSubmit(e)} className="flex flex-col gap-2">
                    <div>
                        <PhysicalBookSearcher defaultValue={dropScan ? dropScan.record : null} onSelect={(book: any) => {
                            setDropBookId(book?.id ?? null)
                            setSelectedDropCopies([])
                            setScanned(null)
                        }}></PhysicalBookSearcher>
                    </div>

                    {dropScan && (
                        <p className="text-sm bg-amber-50 text-amber-900 border border-amber-200 rounded-lg px-3 py-2">
                            Escaneado: <strong>{dropScan.record.title ?? 'Libro'}</strong>
                            {dropScan.record.code ? ` · ${dropScan.record.code}` : ''}
                            {dropScan.copy?.code ? ` · ejemplar ${dropScan.copy.code}` : ''}
                        </p>
                    )}

                    {dropBookId && (
                        <CopySelector
                            key={dropBookId}
                            kind="physical-book"
                            resourceId={dropBookId}
                            statuses={["DISPONIBLE", "MANTENIMIENTO"]}
                            label="Ejemplares a dar de baja"
                            emptyText="Este libro no tiene ejemplares que puedan darse de baja. Se usará la cantidad."
                            initialSelected={dropScan?.copy?.id ? [dropScan.copy.id] : []}
                            onChange={setSelectedDropCopies}
                        />
                    )}

                    <div>
                        <Label>Cantidad a dar de baja</Label>
                        <Input
                            type="number"
                            name="quantity"
                            placeholder="3"
                            disabled={selectedDropCopies.length > 0}
                            defaultValue={selectedDropCopies.length > 0 ? selectedDropCopies.length : undefined}
                        ></Input>
                    </div>

                    <div>
                        <Label>Nombre del Encargado</Label>
                        <Input name="personNames"></Input>
                    </div>

                    <div>
                        <Label>Apellido del Encargado</Label>
                        <Input name="personSurNames"></Input>
                    </div>

                    <Button>Guardar</Button>

                </form>
            </GenericModalContainer>}

        {scanning && <QrScannerModal onResult={handleRaw} onClose={() => setScanning(false)} />}
    </section>
}