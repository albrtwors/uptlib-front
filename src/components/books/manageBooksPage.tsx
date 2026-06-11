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
import { uploadFile } from "../../../utils/supabase"
import { generateSafeFileName } from "../../../utils/string"


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
    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        const file = formData.get('pdf') as File;

        if (!file || file.size === 0) {
            return SwalAlert.fire({ title: 'Error', text: 'Por favor selecciona un archivo PDF', icon: 'error' });
        }

        SwalAlert.loading()

        try {
            const titleField = formData.get('title') as string || 'documento';

            // Usamos la función utilitaria
            const newFileName = generateSafeFileName(titleField, file.name);

            // Subida directa a Supabase
            const finalPublicUrl = await uploadFile(file, 'pdfs', newFileName, file.type);

            if (!finalPublicUrl) throw new Error("Supabase Storage no retornó una URL válida.");

            // Preparar JSON para NestJS
            const formEntries = Object.fromEntries(formData.entries());
            const payload: any = { ...formEntries, routepdf: finalPublicUrl };
            delete payload.pdf;

            // Petición ligera a NestJS
            const res = await fetch(`/api/book`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);

            const response = await res.json();


            const result = handleResponses(response);
            if (result) {
                formElement.reset();
                getBooks({ search, limit }).then((res: any) => setBooks(res.data));
                setCreateModal(false);
            }

        } catch (err) {
            console.error('Error en creación:', err);
            SwalAlert.fire({ title: 'Error de proceso', text: 'Hubo un problema al guardar el libro.', icon: 'error' });
        }
    };

    // ==========================================
    // EDITAR LIBRO
    // ==========================================
    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        const file = formData.get('pdf') as File;

        SwalAlert.loading();

        try {
            let finalPublicUrl = selectedBook.routepdf; // Conserva la URL actual si no se sube nada nuevo

            // Si el usuario seleccionó un archivo nuevo en la edición
            if (file && file.size > 0) {
                const titleField = formData.get('title') as string || 'documento';

                // Usamos la misma función utilitaria
                const newFileName = generateSafeFileName(titleField, file.name);

                const uploadedUrl = await uploadFile(file, 'pdfs', newFileName, file.type);
                if (!uploadedUrl) throw new Error("No se pudo subir el nuevo archivo.");

                finalPublicUrl = uploadedUrl;
            }

            // Preparar JSON para NestJS
            const formEntries = Object.fromEntries(formData.entries());
            const payload: any = { ...formEntries, routepdf: finalPublicUrl };
            delete payload.pdf;

            // Petición PATCH a NestJS
            const res = await fetch(`/api/book/${selectedBook.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);

            const data = await res.json();


            const result = handleResponses(data);
            if (result) {
                getBooks({ search, limit }).then((res: any) => setBooks(res.data));
                setEditModal(false);
            }

        } catch (err) {
            console.error('Error al editar:', err);
            SwalAlert.fire({ title: 'Error de actualización', text: 'Hubo un problema al modificar el libro.', icon: 'error' });
        }
    };

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
            <Button onClick={() => setCreateModal(true)}>Añadir un Libro</Button>
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
                        <Label isRequired={false}>Descripción</Label>
                        <Input name="description" placeholder="Las aventuras de Dorothy en la tierra de OZ"></Input>
                    </div>
                    <div>
                        <Label>Pdf</Label>
                        <Input type="file" name="pdf" placeholder="archivo"></Input>
                    </div>
                    {/* <Label>Pdf</Label>
                    <Input type="text" name="routepdf" placeholder="pdf"></Input> */}
                    {/* <div>
                        <Label>Imágen</Label>
                        <Input name="routeimg" placeholder="image"></Input>

                    </div> */}
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
                    {/* <div>
                        <Label>Imágen</Label>
                        <Input defaultValue={selectedBook.routeimg} name="routeimg" placeholder="image"></Input>

                    </div> */}
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