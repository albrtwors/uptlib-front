import { fetchDeleteConfig } from "@/hooks/lib/fetch/fetchConfig"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { SwalAlert } from "@/hooks/lib/swal/swal"

/**
 * peticiones HTTP del área de libros físicos que siguen usando formularios
 * (eliminación puntual y alta/baja de autores y géneros). El alta y la edición
 * de libros viven ahora en /physical-book/bulk, dentro de la mesa de trabajo.
 */
export const useHttpSubmit = ({ category, setPage, pnf, search, getBooks, totalPages, limit, selectedBook, setDeleteModal, setBooks, page }: any) => {

    const refresh = () => getBooks({ search, limit, page, category, pnf }).then((res: any) => {
        setBooks(res.data)
        totalPages.current = res.totalPages
    })

    const handleCreateAuthor = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        const formData = new FormData(e.currentTarget)

        fetch('/api/author', {
            method: 'POST', body: JSON.stringify(Object.fromEntries(formData.entries())), headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            handleResponses(data)
        })


    }
    const handleDeleteAuthor = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        const form = Object.fromEntries(new FormData(e.currentTarget).entries())
        fetch(`/api/author/${form.authorId}`, {
            method: 'DELETE', body: JSON.stringify(form), headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            handleResponses(data)
        })
    }

    const handleCreateGenre = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        const formData = new FormData(e.currentTarget)

        fetch('/api/category', {
            method: 'POST', body: JSON.stringify(Object.fromEntries(formData.entries())), headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            handleResponses(data)
        })


    }
    const handleDeleteGenre = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        const form = Object.fromEntries(new FormData(e.currentTarget).entries())

        fetch(`/api/category/${form.categoryId}`, { method: 'DELETE' }).then(res => res.json()).then(data => {
            handleResponses(data)
        })


    }

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        fetch(`/api/physical-book/${selectedBook.id}`, fetchDeleteConfig()).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            if (result) {
                getBooks({ search, limit, page: 1, category, pnf }).then((res: any) => {
                    setBooks(res.data)
                    setPage(1)
                    totalPages.current = res.totalPages
                })
                setDeleteModal(false)
            }
        })
    }

    return { handleDeleteGenre, handleCreateAuthor, handleDeleteAuthor, handleCreateGenre, handleDeleteSubmit, refresh }
}
