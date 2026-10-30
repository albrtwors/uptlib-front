"use client"
import Button from "@/components/ui/button/Button"
import { useEffect, useState } from "react"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import GenericModalContainer from "../modals/GenericModalContainer"
import { usePathname, useRouter } from "next/navigation"

import { useManageModals } from "@/hooks/useModal"
import { useManageBooks } from "@/hooks/physicalBooks/useManageBooks"
import { useHttpSubmit } from "@/hooks/physicalBooks/useHttpSubmit"
import AuthorSearcher from "../form/input/authors/AuthorSearcher"
import CategorySearcher from "../form/input/category/categorySearcher"
import { usePnfs } from "@/hooks/pnfs/usePnfs"
import ManagePhysicalBooksTable from "./tables/manageTable"
import usePagination from "@/hooks/usePaginationOwn"
import Pagination from "../pagination/OwnPaginator"
import CategoryFilter from "../filters/physical-books/categoryFilter"
import dynamic from "next/dynamic"
import CopiesManager from "@/components/copies/CopiesManager"
import FilterBar from "@/components/ui/FilterBar"
import PageSizeSelect from "@/components/ui/PageSizeSelect"
import SearchField from "@/components/form/SearchField"
import BulkActionBar from "@/components/ui/BulkActionBar"
import useRowSelection from "@/hooks/lib/useRowSelection"
import { useBulkActions } from "@/hooks/lib/useBulkActions"
import { formCacheKey, useCachedState } from "@/hooks/lib/useCachedForm"
import { physicalBookToRecord } from "@/utils/jsonRecords"
import RecordsWorkspaceModal from "./records/RecordsWorkspaceModal"

const ExportPDFButton = dynamic(
    () => import('./pdf/exportPhysicalBooksButton'),
    { ssr: false }
)

export default function ManagePhysicalBooksPage() {
    const { setDeleteModal, deleteModal } = useManageModals()
    const [authorModal, setAuthorModal] = useState<any>({ create: false, delete: false })
    const [categoryModal, setCategoryModal] = useState<any>({ create: false, delete: false })

    const [selectedBook, setSelectedBook]: any = useState(null)
    const [copiesBook, setCopiesBook]: any = useState(null)
    // 💡 La mesa de trabajo se guarda en el navegador: si el usuario refresca la
    // página o se le cierra el portátil, el modal reaparece con sus borradores.
    const {
        value: workspace,
        setValue: setWorkspace,
        clear: clearWorkspaceCache
    } = useCachedState<any>(formCacheKey('physical-books-workspace-open'), () => null)

    const pathname = usePathname();
    const router = useRouter();

    const [searchInput, setSearchInput] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [category, setCategory] = useState('')
    const [pnf, setPnf] = useState('')
    const [limit, setLimit] = useState(10)
    const { page, setPage, totalPages } = usePagination()
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: searchInput, limit: limit, page, totalPages })

    const { pnfs: pnfOptions } = usePnfs({ search: '', limit: 100 })

    const { handleDeleteGenre, handleCreateAuthor, handleDeleteAuthor, handleCreateGenre, handleDeleteSubmit } = useHttpSubmit({
        setPage, category, pnf, setBooks: setUseAllBooks, totalPages, getBooks, selectedBook, limit, setDeleteModal, search: appliedSearch, page
    })

    const reload = (targetPage = page) => getBooks({ search: appliedSearch, limit, page: targetPage, category, pnf }).then((res: any) => {
        setUseAllBooks(res.data)
        totalPages.current = res.totalPages
    })

    const selection = useRowSelection(books)
    const { deleteSelected, exportSelected, busy: bulkBusy } = useBulkActions({
        resource: 'physical-book',
        selection,
        unit: 'libro(s) físico(s)',
        toRecord: physicalBookToRecord,
        fileBaseName: 'libros-fisicos',
        onDone: () => reload(1)
    })

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', appliedSearch)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        params.set('genre', category.toString())
        params.set('pnf', pnf.toString())
        router.replace(`${pathname}?${params}`)

        reload()
    }, [appliedSearch, limit, page, category, pnf]);

    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Libros Físicos</h1>

        <FilterBar
            actions={<>
                <Button type="button" onClick={() => setWorkspace({ mode: 'create', seeds: [] })}>Añadir libros</Button>
                <ExportPDFButton items={books} title={'Reporte de Libros Fisicos'}></ExportPDFButton>
            </>}
        >
            <SearchField
                label="Titulo del Libro"
                placeholder="Buscar libros..."
                value={searchInput}
                onValueChange={setSearchInput}
                onSubmit={(term) => {
                    setPage(1)
                    setAppliedSearch(term)
                }}
            />
            <PageSizeSelect label="Cantidad" limit={limit} onLimitChange={(size) => { setLimit(size); setPage(1) }} />
            <CategoryFilter setSearchHandler={setCategory}></CategoryFilter>

            <div>
                <Label>PNF</Label>
                <select value={pnf} onChange={(e: any) => {
                    setPnf(e.target.value)
                    setPage(1)
                }} className="h-11 w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700">
                    <option value="">TODOS LOS PNF</option>
                    {(Array.isArray(pnfOptions) ? pnfOptions : []).map((pnfEntity: any) => <option key={pnfEntity.id} value={pnfEntity.name}>{pnfEntity.name}</option>)}
                </select>
            </div>
        </FilterBar>

        <Pagination page={page} setPage={setPage} totalItems={totalPages.current} limit={limit}></Pagination>

        <BulkActionBar
            selection={selection}
            unit="libro(s)"
            busy={bulkBusy}
            onDelete={deleteSelected}
            onExport={exportSelected}
            onEdit={() => setWorkspace({ mode: 'edit', seeds: selection.selectedRows })}
        />

        <div className="p-3">
            {books && <ManagePhysicalBooksTable
                selection={selection}
                onEdit={(book: any) => setWorkspace({ mode: 'edit', seeds: [book] })}
                onDelete={(book: any) => {
                    setDeleteModal(true)
                    setSelectedBook(book)
                }}
                onCopies={(book: any) => setCopiesBook(book)}
                books={books} />}
        </div>

        {/* SECCIÓN AUTORES */}
        <div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Autores</h3>
                    </div>
                </div>

                <div className="flex gap-2 ml-auto">
                    <Button size="sm" type="button" onClick={() => setAuthorModal({ ...authorModal, create: true })}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir
                    </Button>

                    <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 shadow-sm px-6 py-2.5"
                        onClick={() => setAuthorModal({ ...authorModal, delete: true })}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>

        {/* SECCIÓN GÉNEROS */}
        <div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Género</h3>
                    </div>
                </div>

                <div className="flex gap-2 ml-auto">
                    <Button size="sm" type="button" onClick={() => setCategoryModal({ ...categoryModal, create: true })}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir
                    </Button>

                    <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 shadow-sm px-6 py-2.5"
                        onClick={() => setCategoryModal({ ...categoryModal, delete: true })}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>

        {/* MESA DE TRABAJO: crear, editar en lote e importar/exportar JSON */}
        {workspace &&
            <RecordsWorkspaceModal
                mode={workspace.mode ?? 'create'}
                seeds={workspace.seeds ?? []}
                onClose={clearWorkspaceCache}
                onSaved={() => reload()}
            />}

        {/* MODAL ELIMINAR */}
        {(deleteModal && selectedBook) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button type="button" onClick={() => setDeleteModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteSubmit(e)} className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold">Seguro de que quieres eliminar {selectedBook.title}?</h3>
                    <div className="flex gap-3 justify-center">
                        <Button type="button" onClick={() => setDeleteModal(false)}>Cancelar</Button>
                        <Button className="bg-red-600">Eliminar</Button>
                    </div>
                </form>
            </GenericModalContainer>}

        {/* DELEGACIÓN DE MODALS INTERNOS */}
        {authorModal.create && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button type="button" onClick={() => setAuthorModal({ ...authorModal, create: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateAuthor(e)} className="flex flex-col gap-2">
                <Label>Nombre del Autor</Label>
                <Input name="name"></Input>
                <Button>Crear</Button>
            </form>
        </GenericModalContainer>}

        {authorModal.delete && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button type="button" onClick={() => setAuthorModal({ ...authorModal, delete: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteAuthor(e)} className="flex flex-col gap-2">
                <AuthorSearcher></AuthorSearcher>
                <Button className="bg-red-600 hover:bg-red-400">Eliminar</Button>
            </form>
        </GenericModalContainer>}

        {categoryModal.create && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button type="button" onClick={() => setCategoryModal({ ...categoryModal, create: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateGenre(e)} className="flex flex-col gap-2">
                <Label>Nombre del Genero</Label>
                <Input name="name"></Input>
                <Button>Crear</Button>
            </form>
        </GenericModalContainer>}

        {categoryModal.delete && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button type="button" onClick={() => setCategoryModal({ ...categoryModal, delete: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteGenre(e)} className="flex flex-col gap-2">
                <CategorySearcher></CategorySearcher>
                <Button className="bg-red-600 hover:bg-red-400">Eliminar</Button>
            </form>
        </GenericModalContainer>}

        {copiesBook && <CopiesManager
            kind="physical-book"
            resourceId={copiesBook.id}
            title={copiesBook.title}
            parentCode={copiesBook.code}
            onClose={() => setCopiesBook(null)}
            onChanged={() => reload()}
        />}
    </section>
}
