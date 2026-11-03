"use client"

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import GenericModalContainer from "../modals/GenericModalContainer";
import Label from "../form/Label";
import { useHttpSubmit } from "@/hooks/itemLoans/useHttpRequests";
import { useManageModals } from "@/hooks/useModal";
import Pagination from "../pagination/OwnPaginator";
import usePagination from "@/hooks/usePaginationOwn";
import useItemLoans from "@/hooks/itemLoans/useItemLoans";
import ManageItemLoansTable from "./tables/manageLoansTable";
import ItemSearcher from "../form/input/itemSearcher/itemSearcher";
import CopySelector from "../copies/CopySelector";
import FilterBar from "@/components/ui/FilterBar";
import PageSizeSelect from "@/components/ui/PageSizeSelect";
import SearchField from "@/components/form/SearchField";
import QrScannerModal from "@/components/qr/QrScannerModal";
import { useQrScan } from "@/hooks/qr/useQrScan";
import dynamic from "next/dynamic";


const ExportPDFButton = dynamic(
    () => import('./pdf/exportLoansButton'),
    { ssr: false }
);




export default function ManageItemLoansPage() {
    //modal handling
    const { setCreateModal, createModal } = useManageModals()
    const [loanItemId, setLoanItemId] = useState<string | null>(null)
    const [selectedCopyIds, setSelectedCopyIds] = useState<string[]>([])
    // El QR llega antes de que el selector cargue los ejemplares: se guarda aparte
    // porque el propio selector vacía selectedCopyIds mientras hace la petición.
    const [preselectedCopyIds, setPreselectedCopyIds] = useState<string[]>([])
    const [scanned, setScanned] = useState<{ record: any; copy: any } | null>(null)

    //search handling
    const pathname = usePathname();
    const router = useRouter();

    //search · la URL es la que manda: un F5 o un enlace compartido recuperan el contexto
    const searchParams = useSearchParams()
    const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
    const [appliedSearch, setAppliedSearch] = useState(searchParams.get('search') ?? '')
    const [limit, setLimit] = useState(parseInt(searchParams.get('limit') ?? '10', 10) || 10)
    const { page, setPage, totalPages } = usePagination(searchParams.get('page') ?? 1)
    const { itemLoans, setItemLoans, getItemLoans } = useItemLoans({ search: appliedSearch, limit, page })

    //handlehttp
    const { handleCreateSubmit, handleSettle, handleDropLoan } = useHttpSubmit({ setItemLoans, getItemLoans, page, totalPages, limit, setCreateModal, search: appliedSearch, setPage })

    // 💡 El QR de un artículo o de su ejemplar abre el préstamo ya enfocado en
    // esa unidad; un código suelto se manda a la búsqueda general.
    const clearScan = () => { setScanned(null); setPreselectedCopyIds([]) }

    const { scanning, setScanning, handleRaw } = useQrScan({
        resource: 'inventory',
        onResult: ({ record, copy, payload }) => {
            if (record) {
                setLoanItemId(record.id)
                setSelectedCopyIds(copy?.id ? [copy.id] : [])
                setPreselectedCopyIds(copy?.id ? [copy.id] : [])
                setScanned({ record, copy })
                setCreateModal(true)
                return
            }
            const term = payload.type === 'code' ? payload.value : ''
            if (!term) return
            setSearchInput(term)
            setAppliedSearch(term)
            setPage(1)
        }
    })


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
            })
    }, [appliedSearch, limit, page]);



    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Préstamos</h1>



        <FilterBar
            actions={<>
                <Button type="button" onClick={() => { clearScan(); setCreateModal(true) }}>Hacer préstamo</Button>
                <Button type="button" variant="outline" onClick={() => setScanning(true)}>Escanear QR</Button>
                <ExportPDFButton items={itemLoans} title="Reporte de Prestamos"></ExportPDFButton>
            </>}
        >
            <PageSizeSelect limit={limit} onLimitChange={(size) => { setLimit(size); setPage(1) }} />

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

        <ManageItemLoansTable
            onSettle={(id: any) => handleSettle(id)}
            onDrop={(id: any) => handleDropLoan(id)}
            loanOperations={itemLoans}
        ></ManageItemLoansTable>


        {createModal &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => { clearScan(); setCreateModal(false) }}>X</Button></div>
                <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateSubmit(e)} className="flex flex-col gap-2">

                    <div>
                        <ItemSearcher defaultValue={scanned?.record ?? null} onSelect={(item: any) => {
                            setLoanItemId(item?.id ?? null)
                            setSelectedCopyIds([])
                            setPreselectedCopyIds([])
                            setScanned(null)
                        }}></ItemSearcher>
                    </div>


                    {scanned && (
                        <p className="text-sm bg-amber-50 text-amber-900 border border-amber-200 rounded-lg px-3 py-2">
                            Escaneado: <strong>{scanned.record.name ?? 'Artículo'}</strong>
                            {scanned.record.code ? ` · ${scanned.record.code}` : ''}
                            {scanned.copy?.code ? ` · ejemplar ${scanned.copy.code}` : ''}
                        </p>
                    )}

                    {loanItemId && (
                        <CopySelector
                            key={loanItemId}
                            kind="inventory"
                            resourceId={loanItemId}
                            initialSelected={preselectedCopyIds}
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

        {scanning && (
            <QrScannerModal onResult={handleRaw} onClose={() => setScanning(false)} />
        )}

    </section>
}
