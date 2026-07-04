"use client"
import Button from "@/components/ui/button/Button"
import { useEffect, useState } from "react"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import BookManageCard from "../cards/BookManageCard"
import GenericModalContainer from "../modals/GenericModalContainer"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useManageModals } from "@/hooks/useModal"
import { useManageBooks } from "@/hooks/physicalBooks/useManageBooks"
import { useHttpSubmit } from "@/hooks/physicalBooks/useHttpSubmit"
import AuthorSearcher from "../form/input/authors/AuthorSearcher"
import CategorySearcher from "../form/input/category/categorySearcher"
import Select from "../form/Select"
import { CATEGORIES } from "@/consts/categories"
import ManagePhysicalBooksTable from "./tables/manageTable"
import usePagination from "@/hooks/usePaginationOwn"
import Pagination from "../pagination/OwnPaginator"
import CategoryFilter from "../filters/physical-books/categoryFilter"
import dynamic from "next/dynamic"
import PhysicalBookFormChatbot from "@/components/chatbot/physical-book/PhysicalBookFormChatbot" // 💡 Importamos el bot

const ExportPDFButton = dynamic(
    () => import('./pdf/exportPhysicalBooksButton'),
    { ssr: false }
)

export default function ManagePhysicalBooksPage() {
    const { setCreateModal, setEditModal, setDeleteModal, createModal, deleteModal, editModal } = useManageModals()
    const [authorModal, setAuthorModal] = useState<any>({ create: false, delete: false })
    const [categoryModal, setCategoryModal] = useState<any>({ create: false, delete: false })

    const [selectedBook, setSelectedBook]: any = useState(null)

    const pathname = usePathname();
    const router = useRouter();

    const [searchInput, setSearchInput] = useState('')
    const [category, setCategory] = useState('')
    const [pnf, setPnf] = useState('')
    const [limit, setLimit] = useState(10)
    const { page, setPage, totalPages } = usePagination()
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: searchInput, limit: limit, page, totalPages })

    const { handleCreateGenre, handleDeleteGenre, handleDeleteAuthor, handleCreateSubmit, handleEditSubmit, handleDeleteSubmit, handleCreateAuthor } = useHttpSubmit({ setPage, category, pnf, setBooks: setUseAllBooks, totalPages, getBooks, selectedBook, limit, setDeleteModal, setCreateModal, setEditModal, search: searchInput, page })

    // 💡 ESTADOS PARA PODER INTERCEPTAR EL COMPORTAMIENTO DE LA IA Y CONTROLAR LOS INPUTS
    const [createValues, setCreateValues] = useState({ title: '', isbn: '', pnf: '', yearOfPublication: '', editorial: '', totalStock: '', author: null as any, category: null as any })
    const [editValues, setEditValues] = useState({ title: '', isbn: '', pnf: '', yearOfPublication: '', editorial: '', totalStock: '', author: null as any, category: null as any })

    // Limpiar estados al abrir el modal de creación
    useEffect(() => {
        if (createModal) {
            setSelectedBook(null)
            setCreateValues({ title: '', isbn: '', pnf: CATEGORIES[0] || '', yearOfPublication: '', editorial: '', totalStock: '', author: null, category: null })
        }
    }, [createModal])

    // Sincronizar el estado de edición cuando se selecciona un libro de la tabla
    useEffect(() => {
        if (selectedBook && editModal) {
            setEditValues({
                title: selectedBook.title || '',
                isbn: selectedBook.isbn || '',
                pnf: selectedBook.pnf || '',
                yearOfPublication: selectedBook.yearOfPublication?.toString() || '',
                editorial: selectedBook.editorial || '',
                totalStock: selectedBook.availableStock?.toString() || '0',
                author: selectedBook.author || null,
                category: selectedBook.category || null
            })
        }
    }, [selectedBook, editModal])

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', searchInput)
        params.set('limit', limit.toString())
        params.set('page', page.toString())
        params.set('genre', category.toString())
        params.set('pnf', pnf.toString())
        router.push(`${pathname}?${params}`)

        fetch(`/api/physical-book?limit=${limit}&pnf=${pnf}&genre=${category}&page=${page}&search=${searchInput}`)
            .then(res => res.json())
            .then((data: any) => {
                setUseAllBooks(data.data)
                totalPages.current = data.totalPages
            })
    }, [searchInput, limit, page, category, pnf]);

    // 💡 HANDLERS PARA INYECTAR LAS EXTRACCIONES DEL ASISTENTE EN LOS CAMPOS
    const handleAICreateExtract = (data: any) => {
        setCreateValues(prev => ({
            ...prev,
            title: data.title ?? prev.title,
            isbn: data.isbn ?? prev.isbn,
            pnf: data.pnf ?? prev.pnf,
            yearOfPublication: data.yearOfPublication ?? prev.yearOfPublication,
            editorial: data.editorial ?? prev.editorial,
            totalStock: data.totalStock ?? prev.totalStock,
            author: data.authorName ? { name: data.authorName } : prev.author,
            category: data.categoryName ? { name: data.categoryName } : prev.category
        }))
    }

    const handleAIEditExtract = (data: any) => {
        setEditValues(prev => ({
            ...prev,
            title: data.title ?? prev.title,
            isbn: data.isbn ?? prev.isbn,
            pnf: data.pnf ?? prev.pnf,
            yearOfPublication: data.yearOfPublication ?? prev.yearOfPublication,
            editorial: data.editorial ?? prev.editorial,
            totalStock: data.totalStock ?? prev.totalStock,
            author: data.authorName ? { name: data.authorName } : prev.author,
            category: data.categoryName ? { name: data.categoryName } : prev.category
        }))
    }

    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Libros Físicos</h1>

        <div className="flex sm:flex-col lg:flex-row flex-col h-20 md:flex-row gap-3 min-w-full overflow-y-scroll">
            <div>
                <Label>Titulo del Libro</Label>
                <Input className="w-full" placeholder="Buscar libros..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}></Input></div>
            <div>
                <Label>Cantidad</Label>
                <Input type="number" placeholder="Cantidad" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const limi = parseInt(e.target.value)
                    if (!isNaN(limi) && limi > 0) {
                        setLimit(parseInt(e.target.value))
                    } else {
                        setLimit(10)
                    }
                }}></Input>
            </div>
            <CategoryFilter setSearchHandler={setCategory}></CategoryFilter>

            <div>
                <Label>Categoría</Label>
                <select onChange={(e: any) => {
                    setPnf(e.target.value)
                }} name="pnf" className="p-2 rounded-lg border border-gray-300">
                    {CATEGORIES.map((category, index) => <option key={index} value={category}>{category}</option>)}
                </select>
            </div>
            <Button onClick={() => setCreateModal(true)}>Añadir un Libro</Button>
            <ExportPDFButton items={books} title={'Reporte de Libros Fisicos'}></ExportPDFButton>
        </div>

        <Pagination page={page} setPage={setPage} totalItems={totalPages.current} limit={limit}></Pagination>

        <div className="p-3">
            {books && <ManagePhysicalBooksTable
                onEdit={(book: any) => {
                    setSelectedBook(book)
                    setEditModal(true)
                }}
                onDelete={(book: any) => {
                    setDeleteModal(true)
                    setSelectedBook(book)
                }}
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
                    <Button size="sm" onClick={() => setAuthorModal({ ...authorModal, create: true })}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir
                    </Button>

                    <Button
                        size="sm"
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
                    <Button size="sm" onClick={() => setCategoryModal({ ...categoryModal, create: true })}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir
                    </Button>

                    <Button
                        size="sm"
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

        {/* MODAL CREAR */}
        {createModal &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-2">
                    <div>
                        <Label>Título del libro</Label>
                        <Input defaultValue={createValues.title} onChange={(e: any) => setCreateValues({ ...createValues, title: e.target.value })} name="title" type="text" placeholder="Mago de Oz"></Input>
                    </div>
                    <div>
                        <Label>ISBN</Label>
                        <Input defaultValue={createValues.isbn} onChange={(e: any) => setCreateValues({ ...createValues, isbn: e.target.value })} name="isbn" placeholder="1234567890"></Input>
                    </div>
                    <AuthorSearcher defaultValue={createValues.author}></AuthorSearcher>
                    <CategorySearcher defaultValue={createValues.category}></CategorySearcher>
                    <div>
                        <Label>PNF</Label>
                        <select value={createValues.pnf} onChange={(e: any) => setCreateValues({ ...createValues, pnf: e.target.value })} name="pnf" className="p-2 rounded-lg border border-gray-300">
                            {CATEGORIES.map((category, index) => <option key={index} value={category}>{category}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label>Año</Label>
                        <Input defaultValue={createValues.yearOfPublication} onChange={(e: any) => setCreateValues({ ...createValues, yearOfPublication: e.target.value })} name="yearOfPublication" type="number"></Input>
                    </div>
                    <div>
                        <Label>Editorial</Label>
                        <Input defaultValue={createValues.editorial} onChange={(e: any) => setCreateValues({ ...createValues, editorial: e.target.value })} name="editorial" type="text"></Input>
                    </div>
                    <div>
                        <Label>Stock</Label>
                        <Input defaultValue={createValues.totalStock} onChange={(e: any) => setCreateValues({ ...createValues, totalStock: e.target.value })} name="totalStock" type="number"></Input>
                    </div>
                    <Button>Guardar</Button>
                </form>
                {/* 🤖 Botón de IA para el formulario de Creación */}
                <PhysicalBookFormChatbot mode="create" onExtract={handleAICreateExtract} />
            </GenericModalContainer>
        }

        {/* MODAL EDITAR */}
        {(editModal && selectedBook) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setEditModal(false)}>X</Button></div>
                <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                    <div>
                        <Label>Título del libro</Label>
                        <Input defaultValue={editValues.title} onChange={(e: any) => setEditValues({ ...editValues, title: e.target.value })} name="title" type="text" placeholder="Mago de Oz"></Input>
                    </div>
                    <div>
                        <Label>ISBN</Label>
                        <Input defaultValue={editValues.isbn} onChange={(e: any) => setEditValues({ ...editValues, isbn: e.target.value })} name="isbn" placeholder="1234567890"></Input>
                    </div>
                    <AuthorSearcher defaultValue={editValues.author}></AuthorSearcher>
                    <CategorySearcher defaultValue={editValues.category}></CategorySearcher>
                    <div>
                        <Label>PNF</Label>
                        <select value={editValues.pnf} onChange={(e: any) => setEditValues({ ...editValues, pnf: e.target.value })} name="pnf" className="p-2 rounded-lg border border-gray-300">
                            {CATEGORIES.map((category, index) => <option key={index} value={category}>{category}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label>Año</Label>
                        <Input defaultValue={editValues.yearOfPublication} onChange={(e: any) => setEditValues({ ...editValues, yearOfPublication: e.target.value })} name="yearOfPublication" type="number"></Input>
                    </div>
                    <div>
                        <Label>Editorial</Label>
                        <Input defaultValue={editValues.editorial} onChange={(e: any) => setEditValues({ ...editValues, editorial: e.target.value })} name="editorial" type="text"></Input>
                    </div>
                    <div>
                        <Label>Stock</Label>
                        <Input defaultValue={editValues.totalStock} onChange={(e: any) => setEditValues({ ...editValues, totalStock: e.target.value })} name="totalStock" type="number"></Input>
                    </div>
                    <Button>Guardar</Button>
                </form>
                {/* 🤖 Botón de IA para el formulario de Edición pasándole el contexto actual */}
                <PhysicalBookFormChatbot mode="edit" currentBook={selectedBook} onExtract={handleAIEditExtract} />
            </GenericModalContainer>}

        {/* MODAL ELIMINAR */}
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

        {/* DELEGACIÓN DE MODALS INTERNOS */}
        {authorModal.create && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button onClick={() => setAuthorModal({ ...authorModal, create: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateAuthor(e)} className="flex flex-col gap-2">
                <Label>Nombre del Autor</Label>
                <Input name="name"></Input>
                <Button>Crear</Button>
            </form>
        </GenericModalContainer>}

        {authorModal.delete && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button onClick={() => setAuthorModal({ ...authorModal, delete: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteAuthor(e)} className="flex flex-col gap-2">
                <AuthorSearcher></AuthorSearcher>
                <Button className="bg-red-600 hover:bg-red-400">Eliminar</Button>
            </form>
        </GenericModalContainer>}

        {categoryModal.create && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button onClick={() => setCategoryModal({ ...categoryModal, create: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateGenre(e)} className="flex flex-col gap-2">
                <Label>Nombre del Genero</Label>
                <Input name="name"></Input>
                <Button>Crear</Button>
            </form>
        </GenericModalContainer>}

        {categoryModal.delete && <GenericModalContainer>
            <div className="flex-1 flex justify-end"><Button onClick={() => setCategoryModal({ ...categoryModal, delete: false })}>X</Button></div>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleDeleteGenre(e)} className="flex flex-col gap-2">
                <CategorySearcher></CategorySearcher>
                <Button className="bg-red-600 hover:bg-red-400">Eliminar</Button>
            </form>
        </GenericModalContainer>}
    </section>
}