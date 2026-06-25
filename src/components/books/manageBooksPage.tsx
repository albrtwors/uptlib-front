"use client"
import Button from "@/components/ui/button/Button"
import { useEffect, useState } from "react"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import { fetchDeleteConfig } from "@/hooks/lib/fetch/fetchConfig"
import { SwalAlert } from "@/hooks/lib/swal/swal"
import BookManageCard from "../cards/BookManageCard"
import GenericModalContainer from "../modals/GenericModalContainer"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { usePathname, useRouter } from "next/navigation"
import Pagination from "../pagination/OwnPaginator"
import { useManageModals } from "@/hooks/useModal"
import usePagination from "@/hooks/usePaginationOwn"
import { uploadFile } from "../../../utils/supabase"
import { generateSafeFileName } from "../../../utils/string"

const PNF_OPTIONS = [
    "GENERAL", "INFORMATICA", "ELECTRONICA", "MANTENIMIENTO",
    "CONTADURIA", "ADMINISTRACION", "ELECTRICIDAD",
    "MECANICA", "INSTRUMENTACION", "TELECOMUNICACIONES"
];

export const useManageBooks = ({ search, limit, page, pnf }: any) => {
    const [books, setUseAllBooks]: any = useState([])

    const getBooks = async ({ search, limit, page, pnf }: any) => {
        let url = `/api/book?search=${search}&limit=${limit ?? 10}&page=${page ?? 1}`;
        if (pnf) {
            url += `&pnf=${pnf}`;
        }
        return fetch(url).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    return { books, setUseAllBooks, getBooks }
}

const useHttpSubmit = ({ search, getBooks, limit, page, pnf, selectedBook, setDeleteModal, setCreateModal, setEditModal, setBooks }: any) => {

    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);

        const file = formData.get('pdf') as File | null;
        const pdfUrl = formData.get('pdfUrl') as string | null;

        let finalPublicUrl: any = "";
        SwalAlert.loading();

        try {
            if (file && file.size > 0) {
                const titleField = formData.get('title') as string || 'documento';
                const newFileName = generateSafeFileName(titleField, file.name);
                finalPublicUrl = await uploadFile(file, 'pdfs', newFileName, file.type);
                if (!finalPublicUrl) throw new Error("Supabase Storage no retornó una URL válida.");
            } else if (pdfUrl && pdfUrl.trim() !== "") {
                finalPublicUrl = pdfUrl.trim();
            } else {
                return SwalAlert.fire({ title: 'Error', text: 'Por favor, sube un archivo PDF o introduce una URL válida.', icon: 'error' });
            }

            const formEntries = Object.fromEntries(formData.entries());
            const payload: any = { ...formEntries, routepdf: finalPublicUrl };
            delete payload.pdf;
            delete payload.pdfUrl;

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
                getBooks({ search, limit, page, pnf }).then((res: any) => setBooks(res.data));
                setCreateModal(false);
            }

        } catch (err) {
            console.error('Error en creación:', err);
            SwalAlert.fire({ title: 'Error de proceso', text: 'Hubo un problema al guardar el libro.', icon: 'error' });
        }
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        const file = formData.get('pdf') as File | null;
        const pdfUrl = formData.get('pdfUrl') as string | null;

        SwalAlert.loading();

        try {
            let finalPublicUrl = selectedBook.routepdf;

            if (file && file.size > 0) {
                const titleField = formData.get('title') as string || 'documento';
                const newFileName = generateSafeFileName(titleField, file.name);
                const uploadedUrl = await uploadFile(file, 'pdfs', newFileName, file.type);
                if (!uploadedUrl) throw new Error("No se pudo subir el nuevo archivo.");
                finalPublicUrl = uploadedUrl;
            } else if (pdfUrl && pdfUrl.trim() !== "") {
                finalPublicUrl = pdfUrl.trim();
            }

            const formEntries = Object.fromEntries(formData.entries());
            const payload: any = { ...formEntries, routepdf: finalPublicUrl };
            delete payload.pdf;
            delete payload.pdfUrl;

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
                getBooks({ search, limit, page, pnf }).then((res: any) => setBooks(res.data));
                setEditModal(false);
            }

        } catch (err) {
            console.error('Error al editar:', err);
            SwalAlert.fire({ title: 'Error de actualización', text: 'Hubo un problema al modificar el libro.', icon: 'error' });
        }
    };

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        fetch(`/api/book/${selectedBook.id}`, fetchDeleteConfig()).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            if (result) {
                getBooks({ search, limit, page, pnf }).then((res: any) => setBooks(res.data))
                setDeleteModal(false)
            }
        })
    }
    return { handleDeleteSubmit, handleEditSubmit, handleCreateSubmit }
}

export default function ManageBooksPage() {
    const { setCreateModal, setEditModal, setDeleteModal, createModal, deleteModal, editModal } = useManageModals()
    const [selectedBook, setSelectedBook]: any = useState(null)
    const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

    const pathname = usePathname();
    const router = useRouter();

    const { page, setPage, totalPages } = usePagination()
    const [searchInput, setSearchInput] = useState('')
    const [limit, setLimit] = useState(10)
    const [pnfFilter, setPnfFilter] = useState('') // Estado para el filtro de la vista principal

    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: searchInput, limit, page, pnf: pnfFilter })
    const { handleCreateSubmit, handleEditSubmit, handleDeleteSubmit } = useHttpSubmit({
        setBooks: setUseAllBooks, getBooks, selectedBook, limit, page, pnf: pnfFilter, setDeleteModal, setCreateModal, setEditModal, search: searchInput
    })

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', searchInput)
        params.set('limit', limit.toString())
        if (pnfFilter) params.set('pnf', pnfFilter)
        router.push(`${pathname}?${params}`)

        getBooks({ search: searchInput, limit, page, pnf: pnfFilter })
            .then(data => {
                setUseAllBooks(data.data)
                totalPages.current = data.totalPages
            })
    }, [searchInput, limit, page, pnfFilter]);

    return (
        <section className="flex flex-col gap-4 p-4 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-bold">Gestionar Libros <span className="text-blue-600">(admin)</span></h1>

            {/* BARRA DE BÚSQUEDA RESPONSIVE */}
            <div className="flex flex-col sm:flex-row gap-3 items-end w-full">
                <div className="w-full sm:w-24">
                    <Label>Cantidad</Label>
                    <Input type="number" placeholder="10" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const limi = parseInt(e.target.value)
                        setLimit(!isNaN(limi) && limi > 0 ? limi : 10)
                    }}></Input>
                </div>

                <div className="w-full sm:flex-1">
                    <Label>Buscar por Texto</Label>
                    <Input className="w-full" placeholder="Buscar libros..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}></Input>
                </div>

                <div className="w-full sm:w-56">
                    <Label>Filtrar por PNF</Label>
                    <select
                        value={pnfFilter}
                        onChange={(e) => setPnfFilter(e.target.value)}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white"
                    >
                        <option value="">TODOS LOS PNF</option>
                        {PNF_OPTIONS.map((option, key) => <option key={key} value={option}>{option}</option>)}
                    </select>
                </div>

                <Button className="w-full sm:w-auto h-11 whitespace-nowrap" onClick={() => setCreateModal(true)}>Añadir Libro</Button>
            </div>

            <Pagination page={page} setPage={setPage} totalItems={totalPages.current} limit={limit}></Pagination>

            {/* GRID TOTALMENTE RESPONSIVE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books && books.map((book: any) => (
                    <BookManageCard
                        onDelete={() => { setSelectedBook(book); setDeleteModal(true); }}
                        onEdit={() => { setSelectedBook(book); setEditModal(true); }}
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        description={book.description}
                        pnf={book.pnf} // 💡 Pasamos el PNF a la tarjeta
                    />
                ))}
            </div>

            {/* MODAL CREAR */}
            {createModal &&
                <GenericModalContainer>
                    <div className="flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                    <form encType="multipart/form-data" onSubmit={handleCreateSubmit} className="flex flex-col gap-3 max-w-md mx-auto w-full">
                        <div>
                            <Label>Título del libro</Label>
                            <Input name="title" placeholder="Mago de Oz" ></Input>
                        </div>
                        <div>
                            <Label isRequired={false}>Descripción</Label>
                            <Input name="description" placeholder="Las aventuras de Dorothy..."></Input>
                        </div>
                        <div>
                            <Label>PNF</Label>
                            <select name="pnf" className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white">
                                {PNF_OPTIONS.map((option, key) => <option key={key} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Método de PDF</Label>
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center gap-1 text-sm cursor-pointer">
                                    <input type="radio" checked={uploadMode === "file"} onChange={() => setUploadMode("file")} /> Archivo
                                </label>
                                <label className="flex items-center gap-1 text-sm cursor-pointer">
                                    <input type="radio" checked={uploadMode === "url"} onChange={() => setUploadMode("url")} /> Enlace URL
                                </label>
                            </div>
                            {uploadMode === "file" ? (
                                <Input type="file" name="pdf"></Input>
                            ) : (
                                <Input type="url" name="pdfUrl" placeholder="https://ejemplo.com/libro.pdf"></Input>
                            )}
                        </div>
                        <Button>Guardar</Button>
                    </form>
                </GenericModalContainer>
            }

            {/* MODAL EDITAR */}
            {(editModal && selectedBook) &&
                <GenericModalContainer>
                    <div className="flex justify-end"><Button onClick={() => setEditModal(false)}>X</Button></div>
                    <form encType="multipart/form-data" onSubmit={handleEditSubmit} className="flex flex-col gap-3 max-w-md mx-auto w-full">
                        <div>
                            <Label>Título del libro</Label>
                            <Input defaultValue={selectedBook.title} name="title" placeholder="Mago de Oz" ></Input>
                        </div>
                        <div>
                            <Label isRequired={false}>Descripción</Label>
                            <Input defaultValue={selectedBook.description} name="description" placeholder="Las aventuras de Dorothy..."></Input>
                        </div>
                        <div>
                            <Label>PNF</Label>
                            <select name="pnf" defaultValue={selectedBook.pnf} className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white">
                                {PNF_OPTIONS.map((option, key) => <option key={key} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Método de PDF</Label>
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center gap-1 text-sm cursor-pointer">
                                    <input type="radio" checked={uploadMode === "file"} onChange={() => setUploadMode("file")} /> Archivo
                                </label>
                                <label className="flex items-center gap-1 text-sm cursor-pointer">
                                    <input type="radio" checked={uploadMode === "url"} onChange={() => setUploadMode("url")} /> Enlace URL
                                </label>
                            </div>
                            {uploadMode === "file" ? (
                                <Input type="file" name="pdf"></Input>
                            ) : (
                                <Input type="url" name="pdfUrl" defaultValue={selectedBook.routepdf.startsWith('http') && !selectedBook.routepdf.includes('supabase') ? selectedBook.routepdf : ''} placeholder="https://ejemplo.com/libro.pdf"></Input>
                            )}
                        </div>
                        <Button>Guardar</Button>
                    </form>
                </GenericModalContainer>}

            {/* MODAL ELIMINAR */}
            {(deleteModal && selectedBook) &&
                <GenericModalContainer>
                    <div className="flex justify-end"><Button onClick={() => setDeleteModal(false)}>X</Button></div>
                    <form onSubmit={handleDeleteSubmit} className="flex flex-col gap-3 text-center">
                        <h3 className="text-lg font-bold">¿Seguro de que quieres eliminar {selectedBook.title}?</h3>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => setDeleteModal(false)}>Cancelar</Button>
                            <Button className="bg-red-600 text-white">Eliminar</Button>
                        </div>
                    </form>
                </GenericModalContainer>}
        </section>
    )
}