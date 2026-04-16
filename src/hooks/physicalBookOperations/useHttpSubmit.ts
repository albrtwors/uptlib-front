import { fetchDeleteConfig, fetchPatchConfig } from "@/lib/fetch/fetchConfig"
import { handleResponses } from "@/lib/responses/handleResponses"
import { SwalAlert } from "@/lib/swal/swal"

export const useHttpSubmit = ({ search, getOperations, limit, selectedOperation, setDeleteModal, setCreateModal, setEditModal, setOperations, selectedBook }: any) => {

    const handleEntrieSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        console.log(Object.fromEntries(formData.entries()))
        fetch(`/api/physical-book-operation/entries`, {
            credentials: 'include',
            body: JSON.stringify(Object.fromEntries(formData.entries())),
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res: any) => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getOperations({ search, limit }).then((res: any) => setOperations(res))
                setCreateModal(false)
            }
        })
    }

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        fetch(`/api/physical-book-operation`, {
            method: 'POST', body: JSON.stringify(data), headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((res: Response) => res.json())
            .then((response: any) => {

                const result = handleResponses(response)
                if (result) {
                    getOperations({ search, limit }).then((res: any) => setOperations(res))
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

    const handleDropSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        console.log(Object.fromEntries(formData.entries()))
        fetch(`/api/physical-book-operation/drops`, {
            credentials: 'include',
            body: JSON.stringify(Object.fromEntries(formData.entries())),
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res: any) => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getOperations({ search, limit }).then((res: any) => setOperations(res))
                setCreateModal(false)
            }
        })
    }
    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const dataXd = Object.fromEntries(formData.entries())

        fetch(`/api/physical-book-operation/${selectedOperation.id}`, {
            body: JSON.stringify(dataXd),
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH'
        }).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            console.log(data)
            if (result) {
                getOperations({ search, limit }).then((res: any) => setOperations(res))
                setEditModal(false)
            }
        })

    }

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget).entries())
        fetch(`/api/physical-book-operation/${selectedOperation.id}`, fetchDeleteConfig()).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            if (result) {
                getOperations({ search, limit }).then((res: any) => setOperations(res))
                setDeleteModal(false)
            }
        })
    }
    return { handleDropSubmit, handleEntrieSubmit, handleDeleteSubmit, handleEditSubmit, handleCreateSubmit }
}