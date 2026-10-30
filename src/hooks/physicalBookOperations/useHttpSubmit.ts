import { fetchDeleteConfig, fetchPatchConfig } from "@/hooks/lib/fetch/fetchConfig"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { SwalAlert } from "@/hooks/lib/swal/swal"

export const useHttpSubmit = ({ totalPages, search, type, getOperations, limit, selectedOperation, setDeleteModal, setCreateModal, setEditModal, setEntrieModal, setDropModal, setOperations, selectedBook }: any) => {

    const handleEntrieSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        const formData = new FormData(e.currentTarget)
        const data: any = Object.fromEntries(formData.entries())

        // 🎯 Con ejemplares concretos se reactivan; la cantidad sólo se usa para crear nuevos
        const copyIds = formData.getAll('copyIds').map(String).filter(Boolean)
        if (copyIds.length > 0) {
            data.copyIds = copyIds
            delete data.quantity
        }

        fetch(`/api/physical-book-operation/entries`, {
            credentials: 'include',
            body: JSON.stringify(data),
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res: any) => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getOperations({ search, limit, type }).then((res: any) => {
                    setOperations(res.data)
                })
                setCreateModal(false)
                setEntrieModal?.(false)
            }
        })
    }

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()
        SwalAlert.loading()
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
                    getOperations({ search, limit, type }).then((res: any) => {
                        setOperations(res.data)
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

    const handleDropSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        const formData = new FormData(e.currentTarget)
        const data: any = Object.fromEntries(formData.entries())

        // 🎯 Con ejemplares concretos la baja recae sólo sobre ellos
        const copyIds = formData.getAll('copyIds').map(String).filter(Boolean)
        if (copyIds.length > 0) {
            data.copyIds = copyIds
            delete data.quantity
        }

        fetch(`/api/physical-book-operation/drops`, {
            credentials: 'include',
            body: JSON.stringify(data),
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res: any) => res.json()).then(data => {
            const result = handleResponses(data)
            if (result) {
                getOperations({ search, limit, type }).then((res: any) => {

                    setOperations(res.data)
                    totalPages.current = res.totalPages
                })
                setCreateModal(false)
                setDropModal?.(false)
            }
        })
    }
    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
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
                getOperations({ search, limit, type }).then((res: any) => setOperations(res))
                setEditModal(false)
            }
        })

    }

    const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        SwalAlert.loading()
        const data = Object.fromEntries(new FormData(e.currentTarget).entries())
        fetch(`/api/physical-book-operation/${selectedOperation.id}`, fetchDeleteConfig()).then(res => res.json()).then((data: any) => {
            const result = handleResponses(data)
            if (result) {
                getOperations({ search, limit, type }).then((res: any) => setOperations(res))
                setDeleteModal(false)
            }
        })
    }
    return { handleDropSubmit, handleEntrieSubmit, handleDeleteSubmit, handleEditSubmit, handleCreateSubmit }
}