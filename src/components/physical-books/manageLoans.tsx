"use client"

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import GenericModalContainer from "../modals/GenericModalContainer";
import Label from "../form/Label";
import { useHttpSubmit } from "@/hooks/physicalBooksLoans/useHttpRequests";
import { useManageModals } from "@/hooks/useModal";
import PhysicalBookSearcher from "../form/input/physical-book-searcher/PhysicalBookSearcher";
import ManageLoansTable from "@/app/(admin)/physical-books/tables/manageLoansTable";
import { usePhysicalBookLoans } from "@/hooks/physicalBooksLoans/usePhysicalBookLoans";
import Pagination from "../pagination/OwnPaginator";
import usePagination from "@/hooks/usePaginationOwn";
import CopySelector from "../copies/CopySelector";
import FilterBar from "@/components/ui/FilterBar";
import PageSizeSelect from "@/components/ui/PageSizeSelect";
import SearchField from "@/components/form/SearchField";
import dynamic from "next/dynamic";



const ExportPDFButton = dynamic(
    () => import('./pdf/exportLoansButton'),
    { ssr: false }
)
export default function ManageLoansPage() {
    //modal handling
    const { setCreateModal, createModal } = useManageModals()
    const [loanBookId, setLoanBookId] = useState<string | null>(null)
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

    //handlehttp
    const { handleCreateSubmit, handleSettle, handleDropLoan } = useHttpSubmit({ page, totalPages, getLoans, setLoans, limit, setCreateModal, search: appliedSearch, setPage })


    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', appliedSearch)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        router.replace(`${pathname}?${params}`)

        fetch(`/api/physical-book-operation/loan?limit=${limit}&search=${appliedSearch}&page=${page}`)
            .then(res => res.json())
            .then((data: any) => {

                setLoans(data.data)
                totalPages.current = data.totalPages
            })
    }, [appliedSearch, limit, page]);



    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold dark:text-white">Gestionar Préstamos</h1>


        <FilterBar
            actions={<>
                <Button type="button" onClick={() => setCreateModal(true)}>Hacer préstamo</Button>
                <ExportPDFButton items={loans} title="Reporte de Préstamos de Libros"></ExportPDFButton>
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
        </FilterBar>



        <Pagination page={page} setPage={setPage} totalItems={totalPages.current || 0} limit={limit} showInfo={true}></Pagination>

        <ManageLoansTable
            onSettle={(id) => handleSettle(id)}
            onDrop={(id) => handleDropLoan(id)}
            loans={loans}
        ></ManageLoansTable>




        {createModal &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateSubmit(e)} className="flex flex-col gap-2">

                    <div>
                        <PhysicalBookSearcher onSelect={(book: any) => {
                            setLoanBookId(book?.id ?? null)
                            setSelectedCopyIds([])
                        }}></PhysicalBookSearcher>
                    </div>

                    <input type="hidden" name="operation" value="PRESTAMO"></input>

                    {loanBookId && (
                        <CopySelector
                            key={loanBookId}
                            kind="physical-book"
                            resourceId={loanBookId}
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
                        <Label>Cédula del Prestatario (solo números)</Label>
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

    </section>
}
