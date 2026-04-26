import { fetchDeleteConfig } from "@/lib/fetch/fetchConfig"
import { handleResponses } from "@/lib/responses/handleResponses"
import { SwalAlert } from "@/lib/swal/swal"

export const useHttpSubmit = ({ setItemLoans, getItemLoans, setPage, search, getBooks, limit, selectedBook, setDeleteModal, setCreateModal, setEditModal, setBooks, getLoans, setLoans, page = 1, totalPages }: any) => {
    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        fetch(`/api/inventory-operation/loan`, {
            method: 'POST', body: JSON.stringify(data), headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res: Response) => res.json())
            .then((response: any) => {

                const result = handleResponses(response)

                if (result) {
                    getItemLoans({ search, limit, page }).then((res: any) => {
                        setItemLoans(res.data)
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


    const handleSettle = (id: any) => {
        fetch(`/api/inventory-operation/settle/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' } }).then((res: any) => {
            return res.json()
        }).then(data => {
            handleResponses(data)
            getItemLoans({ search, limit, page }).then((res: any) => {
                setItemLoans(res.data)
                setPage(1)
                totalPages.current = res.totalPages

            })
        })

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
                getBooks({ search, limit, page }).then((res: any) => {

                    setBooks(res.data)
                    totalPages.current = res.totalPages
                })
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
                getBooks({ search, limit, page }).then((res: any) => {
                    setBooks(res.data)
                    totalPages.current = res.totalPages
                })
                setDeleteModal(false)
            }
        })
    }
    return { handleDeleteSubmit, handleEditSubmit, handleCreateSubmit, handleSettle }
}