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
import BookFormChatbot from "@/components/chatbot/book/BookFormChatbot"
import BookBulkChatbot from "@/components/chatbot/book/BookBulkChatbot"
import AuthorSelectorModal from "@/components/form/author/AuthorSelectorModal"
import PnfSelectorModal from "@/components/form/pnf/PnfSelectorModal"

const PNF_OPTIONS = [
    "GENERAL", "INFORMATICA", "ELECTRONICA", "MANTENIMIENTO",
    "CONTADURIA", "ADMINISTRACION", "ELECTRICIDAD",
    "MECANICA", "INSTRUMENTACION", "TELECOMUNICACIONES"
];

export const useManageBooks = ({ search, limit, page, pnf, authorIds }: any) => {
    const [books, setUseAllBooks]: any = useState([])

    const getBooks = async ({ search, limit, page, pnf, authorIds }: any) => {
        let url = `/api/book?search=${search}&limit=${limit ?? 10}&page=${page ?? 1}`;
        if (pnf) {
            url += `&pnf=${pnf}`;
        }
        if (authorIds && authorIds.length > 0) {
            url += `&authors=${authorIds.join(',')}`;
        }
        return fetch(url).then((res: any) => res.json()).then((data: any) => {
            return data
        })
    }

    return { books, setUseAllBooks, getBooks }
}

const useHttpSubmit = ({ search, getBooks, limit, page, pnf, authorFilterIds, selectedBook, setDeleteModal, setCreateModal, setEditModal, setBooks, createValues, editValues, createModal }: any) => {

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

            const payload = {
                title: formData.get('title'),
                description: formData.get('description'),
                routepdf: finalPublicUrl,
                pnfs: createValues.pnfs,
                authorIds: createValues.authorIds
            };

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
                getBooks({ search, limit, page, pnf, authorIds: authorFilterIds }).then((res: any) => setBooks(res.data));
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

            const payload = {
                title: formData.get('title'),
                description: formData.get('description'),
                routepdf: finalPublicUrl,
                pnfs: editValues.pnfs,
                authorIds: editValues.authorIds
            };

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
                getBooks({ search, limit, page, pnf, authorIds: authorFilterIds }).then((res: any) => setBooks(res.data));
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
                getBooks({ search, limit, page, pnf, authorIds: authorFilterIds }).then((res: any) => setBooks(res.data))
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

    const [isAuthorModalOpen, setIsAuthorModalOpen]: any = useState(false)
    const [isPnfModalOpen, setIsPnfModalOpen]: any = useState(false)

    const [modalContext, setModalContext] = useState<'filter' | 'form'>('form')

    const [createValues, setCreateValues]: any = useState({ title: "", description: "", pnfs: ["GENERAL"] as string[], authorIds: [] as string[], pdfUrl: "" });
    const [editValues, setEditValues]: any = useState({ title: "", description: "", pnfs: [] as string[], authorIds: [] as string[], pdfUrl: "" });

    const pathname = usePathname();
    const router = useRouter();

    const { page, setPage, totalPages } = usePagination()
    const [searchInput, setSearchInput] = useState('')
    const [limit, setLimit] = useState(10)
    const [pnfFilter, setPnfFilter] = useState('')

    const [authorFilterIds, setAuthorFilterIds] = useState<string[]>([])

    // 💡 CLAVE DE LA VICTORIA: Estado reactivo local para renderizar controles en tiempo real
    const [calculatedItems, setCalculatedItems] = useState(0)

    const { books, setUseAllBooks, getBooks } = useManageBooks({ search: searchInput, limit, page, pnf: pnfFilter, authorIds: authorFilterIds })
    const { handleCreateSubmit, handleEditSubmit, handleDeleteSubmit } = useHttpSubmit({
        setBooks: setUseAllBooks, getBooks, selectedBook, limit, page, pnf: pnfFilter, authorFilterIds, setDeleteModal, setCreateModal, setEditModal, search: searchInput, createValues, editValues, createModal
    })

    useEffect(() => {
        if (selectedBook) {
            const defaultUrl = selectedBook.routepdf?.startsWith('http') && !selectedBook.routepdf.includes('supabase') ? selectedBook.routepdf : '';
            setEditValues({
                title: selectedBook.title || "",
                description: selectedBook.description || "",
                pnfs: selectedBook.pnfs?.map((p: any) => p.pnf) || [],
                authorIds: selectedBook.authors?.map((a: any) => a.id) || [],
                pdfUrl: defaultUrl
            });
            if (defaultUrl) setUploadMode("url");
            else setUploadMode("file");
        }
    }, [selectedBook]);

    useEffect(() => {
        if (createModal) {
            setCreateValues({ title: "", description: "", pnfs: ["GENERAL"], authorIds: [], pdfUrl: "" });
            setUploadMode("file");
        }
    }, [createModal]);

    const handleCreateAIExtract = (data: any) => {
        setCreateValues((prev: any) => ({
            title: data.title ?? prev.title,
            description: data.description ?? prev.description,
            pnfs: data.pnfs ?? (data.pnf ? [data.pnf] : prev.pnfs),
            authorIds: data.authorIds ?? prev.authorIds,
            pdfUrl: data.routepdf ?? data.pdfUrl ?? prev.pdfUrl,
            routeimg: data.routeimg ?? prev.routeimg
        }));

        if (data.routepdf || data.pdfUrl) setUploadMode("url");
    };

    const handleEditAIExtract = (data: any) => {
        setEditValues((prev: any) => ({
            title: data.title ?? prev.title,
            description: data.description ?? prev.description,
            pnfs: data.pnfs ?? (data.pnf ? [data.pnf] : prev.pnfs),
            authorIds: data.authorIds ?? prev.authorIds,
            pdfUrl: data.routepdf ?? data.pdfUrl ?? prev.pdfUrl,
            routeimg: data.routeimg ?? prev.routeimg
        }));

        if (data.routepdf || data.pdfUrl) setUploadMode("url");
    };

    const refreshTableData = () => {
        getBooks({ search: searchInput, limit, page, pnf: pnfFilter, authorIds: authorFilterIds })
            .then(data => {
                setUseAllBooks(data.data)
                totalPages.current = data.totalPages
                // 💡 Sincronizamos las matemáticas de ítems al refrescar
                setCalculatedItems((data.totalPages || 1) * limit)
            })
    }

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('search', searchInput)
        params.set('limit', limit.toString())
        params.set('page', page.toString()) // Aseguramos persistencia de la página
        if (pnfFilter) params.set('pnf', pnfFilter)
        if (authorFilterIds.length > 0) params.set('authors', authorFilterIds.join(','))
        router.push(`${pathname}?${params}`)

        refreshTableData()
    }, [searchInput, limit, page, pnfFilter, authorFilterIds]);

    const handleAuthorModalChange = (ids: string[]) => {
        if (modalContext === 'filter') {
            setAuthorFilterIds(ids)
            setPage(1) // Al filtrar por autor volvemos a la primera página
        } else if (createModal) {
            setCreateValues({ ...createValues, authorIds: ids })
        } else if (editModal) {
            setEditValues({ ...editValues, authorIds: ids })
        }
    }

    return (
        <section className="relative flex flex-col gap-4 p-4 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-bold">Gestionar Libros <span className="text-blue-600">(admin)</span></h1>

            {/* BARRA DE BÚSQUEDA Y FILTROS OPTIMIZADA */}
            <div className="flex flex-col sm:flex-row gap-3 items-end w-full bg-slate-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-900">
                <div className="w-full sm:w-28">
                    <Label>Cantidad</Label>
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(parseInt(e.target.value) || 10)
                            setPage(1) // Regresar a la 1 al alterar filas
                        }}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10 filas</option>
                        <option value={20}>20 filas</option>
                        <option value={30}>30 filas</option>
                    </select>
                </div>

                <div className="w-full sm:flex-1">
                    <Label>Buscar por Nombre / Texto</Label>
                    <Input
                        className="w-full"
                        placeholder="Escribe el nombre del libro..."
                        defaultValue={searchInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchInput(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>

                <div className="w-full sm:w-48">
                    <Label>Filtrar por PNF</Label>
                    <select
                        value={pnfFilter}
                        onChange={(e) => {
                            setPnfFilter(e.target.value)
                            setPage(1)
                        }}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">TODOS LOS PNF</option>
                        {PNF_OPTIONS.map((option, key) => <option key={key} value={option}>{option}</option>)}
                    </select>
                </div>

                <div className="w-full sm:w-48 flex flex-col gap-1">
                    <Label>Filtrar por Autor</Label>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 text-xs justify-between"
                        onClick={() => { setModalContext('filter'); setIsAuthorModalOpen(true); }}
                    >
                        <span>{authorFilterIds.length > 0 ? `Autores (${authorFilterIds.length})` : "Todos los autores"}</span>
                    </Button>
                </div>

                <Button type="button" className="w-full sm:w-auto h-11 whitespace-nowrap px-6" onClick={() => setCreateModal(true)}>Añadir Libro</Button>
            </div>

            {/* 💡 CONTROLES DE PAGINACIÓN ACTUALIZADOS Y CONDICIONADOS */}
            {books && books.length > 0 && (
                <Pagination
                    page={page}
                    setPage={setPage}
                    totalItems={calculatedItems}
                    limit={limit}
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books && books.map((book: any) => (
                    <BookManageCard
                        onDelete={() => { setSelectedBook(book); setDeleteModal(true); }}
                        onEdit={() => { setSelectedBook(book); setEditModal(true); }}
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        description={book.description}
                        pnf={book.pnfs?.map((p: any) => p.pnf).join(', ') || 'GENERAL'}
                    />
                ))}
            </div>

            {/* MODAL CREAR */}
            {createModal &&
                <GenericModalContainer>
                    <div className="flex justify-end">
                        <Button type="button" onClick={() => setCreateModal(false)}>X</Button>
                    </div>
                    <form encType="multipart/form-data" onSubmit={handleCreateSubmit} className="flex flex-col gap-3 max-w-md mx-auto w-full mb-4">
                        <div>
                            <Label>Título del libro</Label>
                            <Input name="title" placeholder="Mago de Oz" defaultValue={createValues.title} onChange={(e: any) => setCreateValues({ ...createValues, title: e.target.value })}></Input>
                        </div>
                        <div>
                            <Label isRequired={false}>Descripción</Label>
                            <Input name="description" placeholder="Las aventuras de Dorothy..." defaultValue={createValues.description} onChange={(e: any) => setCreateValues({ ...createValues, description: e.target.value })}></Input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label>Autores Seleccionados ({createValues.authorIds.length})</Label>
                            <Button type="button" onClick={() => { setModalContext('form'); setIsAuthorModalOpen(true); }}>
                                Vincular Autores
                            </Button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label>PNFs Vinculados</Label>
                            <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-950 p-2 border rounded-lg min-h-10">
                                {createValues.pnfs.map((p: any) => (
                                    <span key={p} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold uppercase">{p}</span>
                                ))}
                            </div>
                            <Button type="button" onClick={() => setIsPnfModalOpen(true)}>
                                Asignar Áreas PNF
                            </Button>
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
                                <Input type="url" name="pdfUrl" placeholder="https://ejemplo.com/libro.pdf" defaultValue={createValues.pdfUrl} onChange={(e: any) => setCreateValues({ ...createValues, pdfUrl: e.target.value })}></Input>
                            )}
                        </div>
                        <Button type="submit">Guardar</Button>
                    </form>

                    <BookFormChatbot mode="create" onExtract={handleCreateAIExtract} />
                </GenericModalContainer>
            }

            {/* MODAL EDITAR */}
            {(editModal && selectedBook) &&
                <GenericModalContainer>
                    <div className="flex justify-end">
                        <Button type="button" onClick={() => setEditModal(false)}>X</Button>
                    </div>
                    <form encType="multipart/form-data" onSubmit={handleEditSubmit} className="flex flex-col gap-3 max-w-md mx-auto w-full mb-4">
                        <div>
                            <Label>Título del libro</Label>
                            <Input name="title" placeholder="Mago de Oz" defaultValue={editValues.title} onChange={(e: any) => setEditValues({ ...editValues, title: e.target.value })}></Input>
                        </div>
                        <div>
                            <Label isRequired={false}>Descripción</Label>
                            <Input name="description" placeholder="Las aventuras de Dorothy..." defaultValue={editValues.description} onChange={(e: any) => setEditValues({ ...editValues, description: e.target.value })}></Input>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label>Autores Seleccionados ({editValues.authorIds.length})</Label>
                            <Button type="button" onClick={() => { setModalContext('form'); setIsAuthorModalOpen(true); }}>
                                Vincular Autores
                            </Button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label>PNFs Vinculados</Label>
                            <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-950 p-2 border rounded-lg min-h-10">
                                {editValues.pnfs.map((p: any) => (
                                    <span key={p} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold uppercase">{p}</span>
                                ))}
                            </div>
                            <Button type="button" onClick={() => setIsPnfModalOpen(true)}>
                                Asignar Áreas PNF
                            </Button>
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
                                <Input type="url" name="pdfUrl" placeholder="https://ejemplo.com/libro.pdf" defaultValue={editValues.pdfUrl} onChange={(e: any) => setEditValues({ ...editValues, pdfUrl: e.target.value })}></Input>
                            )}
                        </div>
                        <Button type="submit">Guardar</Button>
                    </form>

                    <BookFormChatbot mode="edit" currentBook={selectedBook} onExtract={handleEditAIExtract} />
                </GenericModalContainer>
            }

            {/* MODAL ELIMINAR */}
            {(deleteModal && selectedBook) &&
                <GenericModalContainer>
                    <div className="flex justify-end">
                        <Button type="button" onClick={() => setDeleteModal(false)}>X</Button>
                    </div>
                    <form onSubmit={handleDeleteSubmit} className="flex flex-col gap-3 text-center">
                        <h3 className="text-lg font-bold">¿Seguro de que quieres eliminar {selectedBook.title}?</h3>
                        <div className="flex gap-3 justify-center">
                            <Button type="button" onClick={() => setDeleteModal(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-red-600 text-white">Eliminar</Button>
                        </div>
                    </form>
                </GenericModalContainer>
            }

            <AuthorSelectorModal
                isOpen={isAuthorModalOpen}
                onClose={() => setIsAuthorModalOpen(false)}
                selectedIds={modalContext === 'filter' ? authorFilterIds : (createModal ? createValues.authorIds : editValues.authorIds)}
                onChange={handleAuthorModalChange}
            />

            <PnfSelectorModal
                isOpen={isPnfModalOpen}
                onClose={() => setIsPnfModalOpen(false)}
                options={PNF_OPTIONS}
                selectedPnfs={createModal ? createValues.pnfs : editValues.pnfs}
                onChange={(pnfs: any) => {
                    if (createModal) setCreateValues({ ...createValues, pnfs })
                    else if (editModal) setEditValues({ ...editValues, pnfs })
                }}
            />

            <BookBulkChatbot onSuccessExecute={refreshTableData} />
        </section>
    )
}