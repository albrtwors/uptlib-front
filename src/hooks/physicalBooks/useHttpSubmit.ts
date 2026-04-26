import { fetchDeleteConfig, fetchPostConfig } from "@/lib/fetch/fetchConfig"
import { handleResponses } from "@/lib/responses/handleResponses"
import { SwalAlert } from "@/lib/swal/swal"

export const useHttpSubmit = ({ category, setPage, pnf, search, getBooks, totalPages, limit, selectedBook, setDeleteModal, setCreateModal, setEditModal, setBooks, page }: any) => {

    const handleCreateAuthor = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        fetch('/api/author', {
            method: 'POST', body: JSON.stringify(Object.fromEntries(formData.entries())), headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            const results = handleResponses(data)

        })


    }
    const handleDeleteAuthor = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
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
        const formData = new FormData(e.currentTarget)

        fetch('/api/category', {
            method: 'POST', body: JSON.stringify(Object.fromEntries(formData.entries())), headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            const results = handleResponses(data)

        })


    }
    const handleDeleteGenre = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = Object.fromEntries(new FormData(e.currentTarget).entries())

        fetch(`/api/category/${form.categoryId}`, { method: 'DELETE' }).then(res => res.json()).then(data => {
            handleResponses(data)
        })


    }


    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        fetch(`/api/physical-book`, {
            method: 'POST', body: JSON.stringify(data), headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res: Response) => res.json())
            .then((response: any) => {

                const result = handleResponses(response)
                if (result) {
                    getBooks({ search, limit, page, category, pnf }).then((res: any) => {
                        setBooks(res.data)
                        totalPages.current = res.totalPages
                    })
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

        fetch(`/api/physical-book/${selectedBook.id}`, {
            body: JSON.stringify(dataXd),
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH'
        }).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            console.log(data)
            if (result) {
                getBooks({ search, limit, page, category, pnf }).then((res: any) => {
                    setBooks(res.data)

                    totalPages.current = res.totalPages
                }
                )
                setEditModal(false)
            }
        })

    }

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget).entries())
        fetch(`/api/physical-book/${selectedBook.id}`, fetchDeleteConfig()).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            if (result) {
                getBooks({ search, limit, category, pnf }).then((res: any) => {
                    setBooks(res.data)
                    setPage(1)
                    totalPages.current = res.totalPages
                })
                setDeleteModal(false)
            }
        })
    }
    return { handleDeleteGenre, handleCreateAuthor, handleDeleteAuthor, handleCreateGenre, handleDeleteSubmit, handleEditSubmit, handleCreateSubmit }
}