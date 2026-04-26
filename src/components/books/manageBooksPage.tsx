"use client"
import Button from "@/components/ui/button/Button"
import { useEffect, useState } from "react"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import { fetchDeleteConfig, fetchPatchConfig, fetchPostConfig } from "@/lib/fetch/fetchConfig"
import { SwalAlert } from "@/lib/swal/swal"
import BookManageCard from "../cards/BookManageCard"
import GenericModalContainer from "../modals/GenericModalContainer"
import { handleResponses } from "@/lib/responses/handleResponses"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Pagination from "../pagination/OwnPaginator"
import { useManageModals } from "@/hooks/useModal"
import usePagination from "@/hooks/usePaginationOwn"


export const useManageBooks = ({ search, limit }: any) => {
    const [books, setUseAllBooks]: any = useState([])


    const getBooks = async ({ search, limit }: any) => {
        return fetch(`/api/book?search=${search}&limit=${limit ?? 10}`).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    useEffect(() => {
        getBooks({ search, limit })
    }, [])

    return { books, setUseAllBooks, getBooks }
}

const useHttpSubmit = ({ search, getBooks, limit, selectedBook, setDeleteModal, setCreateModal, setEditModal, setBooks }: any) => {
    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        fetch(`/api/book`, { method: 'POST', body: formData, credentials: 'include' })
            .then((res: Response) => res.json())
            .then((response: any) => {

                const result = handleResponses(response)
                if (result) {
                    getBooks({ search, limit }).then((res: any) => setBooks(res.data))
                    setCreateModal(false)
                }

            })
            .catch((err) => {
                console.error('Error de red:', err);
                SwalAlert.fire({
                    title: 'Error de conexión',
                    text: 'Verifica tu conexión',
                    icon: 'error'
                });
            });
    }

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const dataXd = Object.fromEntries(formData.entries())

        fetch(`/api/book/${selectedBook.id}`, {
            body: formData,
            credentials: 'include',
            method: 'PATCH'
        }).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            console.log(data)
            if (result) {
                getBooks({ search, limit }).then((res: any) => setBooks(res.data))
                setEditModal(false)
            }
        })

    }

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget).entries())
        fetch(`/api/book/${selectedBook.id}`, fetchDeleteConfig()).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            if (result) {
                getBooks({ search, limit }).then((res: any) => setBooks(res.data))
                setDeleteModal(false)
            }
        })
    }
    return { handleDeleteSubmit, handleEditSubmit, handleCreateSubmit }
}

export default function ManageBooksPage() {
    //modal handling
    const { setCreateModal, setEditModal, setDeleteModal, createModal, deleteModal, editModal } = useManageModals()
    const [selectedBook, setSelectedBook]: any = useState(null)

    //search handling
    const pathname = usePathname();
    const router = useRouter();

    //search
    const { page, setPage, totalPages } = usePagination()
    const [searchInput, setSearchInput] = useState('')
    const [limit, setLimit] = useState(10)
    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: searchInput, limit: limit })

    //handlehttp
    const { handleCreateSubmit, handleEditSubmit, handleDeleteSubmit } = useHttpSubmit({ setBooks: setUseAllBooks, getBooks, selectedBook, limit, setDeleteModal, setCreateModal, setEditModal, search: searchInput })


    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', searchInput)
        params.set('limit', limit.toString())
        router.push(`${pathname}?${params}`)

        fetch(`/api/book?limit=${limit}&search=${searchInput}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                setUseAllBooks(data.data)
                totalPages.current = data.totalPages
            })
    }, [searchInput, limit, page]);



    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Libros <span className="text-blue-600">(admin)</span></h1>
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

        <Pagination page={page} setPage={setPage} totalItems={totalPages.current} limit={limit}></Pagination>

        <div className="grid grid-cols-3 gap-3">
            {books && books.map((book: any) => <BookManageCard onDelete={() => {
                setSelectedBook(book)
                setDeleteModal(true)
            }} onEdit={() => {
                setSelectedBook(book)
                setEditModal(true)
            }} key={book.id} id={book.id} title={book.title} description={book.description}></BookManageCard>)}
        </div>




        {createModal &&
            <GenericModalContainer>
                <div className="flex-1 flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                <form encType="multipart/form-data" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateSubmit(e)} className="flex flex-col gap-2">
                    <div>
                        <Label>Título del libro</Label>
                        <Input name="title" placeholder="Mago de Oz"></Input>
                    </div>
                    <div>
                        <Label>Descripción</Label>
                        <Input name="description" placeholder="Las aventuras de Dorothy en la tierra de OZ"></Input>
                    </div>
                    <div>
                        <Label>Pdf</Label>
                        <Input type="file" name="pdf" placeholder="archivo"></Input>
                    </div>
                    {/* <Label>Pdf</Label>
                    <Input type="text" name="routepdf" placeholder="pdf"></Input> */}
                    <div>
                        <Label>Imágen</Label>
                        <Input name="routeimg" placeholder="image"></Input>

                    </div>
                    <Button>Guardar</Button>
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