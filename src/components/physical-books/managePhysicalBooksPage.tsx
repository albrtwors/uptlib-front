"use client"
import Button from "@/components/ui/button/Button"
import { useEffect, useState } from "react"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import BookManageCard from "../cards/BookManageCard"
import GenericModalContainer from "../modals/GenericModalContainer"
import { handleResponses } from "@/lib/responses/handleResponses"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Pagination from "../pagination/Paginator"
import { useManageModals } from "@/hooks/useModal"
import { useManageBooks } from "@/hooks/physicalBooks/useManageBooks"
import { useHttpSubmit } from "@/hooks/physicalBooks/useHttpSubmit"
import AuthorSearcher from "../form/input/authors/AuthorSearcher"
import CategorySearcher from "../form/input/category/categorySearcher"
import Select from "../form/Select"
import { CATEGORIES } from "@/consts/categories"
import ManagePhysicalBooksTable from "./tables/manageTable"



export default function ManagePhysicalBooksPage() {
    //modal handling
    const { setCreateModal, setEditModal, setDeleteModal, createModal, deleteModal, editModal } = useManageModals()
    const [selectedBook, setSelectedBook]: any = useState(null)

    //search handling
    const pathname = usePathname();
    const router = useRouter();

    //search
    const [searchInput, setSearchInput] = useState('')
    const [limit, setLimit] = useState(10)
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: searchInput, limit: limit })

    //handlehttp
    const { handleCreateSubmit, handleEditSubmit, handleDeleteSubmit } = useHttpSubmit({ setBooks: setUseAllBooks, getBooks, selectedBook, limit, setDeleteModal, setCreateModal, setEditModal, search: searchInput })

    //handleAuthor 
    const [author, setAuthor]: any = useState(null)

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', searchInput)
        params.set('limit', limit.toString())
        router.push(`${pathname}?${params}`)

        fetch(`/api/physical-book?limit=${limit}&search=${searchInput}`)
            .then(res => res.json())
            .then(setUseAllBooks)
    }, [searchInput, limit]);



    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Libros Físicos</h1>
        <Button onClick={() => setCreateModal(true)}>Añadir un Libro</Button>


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

        {/* table */}
        <div className="p-3">

            {books && <ManagePhysicalBooksTable

                onEdit={(book: any) => {
                    console.log(book)
                    setSelectedBook(book)
                    setEditModal(true)
                }}

                onDelete={(book: any) => {

                    setDeleteModal(true)
                    setSelectedBook(book)
                }}

                books={books} />}

        </div>




        {createModal &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    console.log(Object.fromEntries(new FormData(e.currentTarget).entries()))
                    handleCreateSubmit(e)
                }} className="flex flex-col gap-2">
                    <div>
                        <Label>Título del libro</Label>
                        <Input name="title" type="text" placeholder="Mago de Oz"></Input>
                    </div>
                    <div>
                        <Label>ISBN</Label>
                        <Input name="isbn" placeholder="1234567890"></Input>
                    </div>
                    <AuthorSearcher></AuthorSearcher>
                    <CategorySearcher></CategorySearcher>
                    <div >
                        <Label>Categoría</Label>
                        <select name="pnf" className="p-2 rounded-lg border border-gray-300">
                            {CATEGORIES.map((category, index) => <option key={index} value={category}>{category}</option>)}
                        </select>
                    </div>

                    <div>
                        <Label>Año</Label>
                        <Input name="yearOfPublication" type="number"></Input>
                    </div>

                    <div>
                        <Label>Editorial</Label>
                        <Input name="editorial" type="text"></Input>
                    </div>


                    <div>
                        <Label>Stock</Label>
                        <Input name="totalStock" type="number"></Input>
                    </div>


                    <Button>Guardar</Button>
                </form>
            </GenericModalContainer>
        }

        {(editModal && selectedBook) &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setEditModal(false)}>X</Button></div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    console.log(Object.fromEntries(new FormData(e.currentTarget).entries()))
                    handleEditSubmit(e)
                }} className="flex flex-col gap-2">
                    <div>
                        <Label>Título del libro</Label>
                        <Input defaultValue={selectedBook.title} name="title" type="text" placeholder="Mago de Oz"></Input>
                    </div>
                    <div>
                        <Label>ISBN</Label>
                        <Input defaultValue={selectedBook.isbn} name="isbn" placeholder="1234567890"></Input>
                    </div>
                    <AuthorSearcher defaultValue={selectedBook.author}></AuthorSearcher>
                    <CategorySearcher defaultValue={selectedBook.category}></CategorySearcher>
                    <div >
                        <Label>Categoría</Label>
                        <select defaultValue={selectedBook.pnf} name="pnf" className="p-2 rounded-lg border border-gray-300">
                            {CATEGORIES.map((category, index) => {
                                return <option key={index} value={category}>{category}</option>
                            })}
                        </select>
                    </div>

                    <div>
                        <Label>Año</Label>
                        <Input defaultValue={selectedBook.yearOfPublication} name="yearOfPublication" type="number"></Input>
                    </div>

                    <div>
                        <Label>Editorial</Label>
                        <Input defaultValue={selectedBook.editorial} name="editorial" type="text"></Input>
                    </div>


                    <div>
                        <Label>Stock</Label>
                        <Input defaultValue={selectedBook.availableStock} name="totalStock" type="number"></Input>
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