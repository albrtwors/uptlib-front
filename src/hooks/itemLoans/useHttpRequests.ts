import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { SwalAlert } from "@/hooks/lib/swal/swal"

export const useHttpSubmit = ({ setItemLoans, getItemLoans, setPage, search, limit, setCreateModal, page = 1, totalPages }: any) => {
    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()
        SwalAlert.loading()
        const formData = new FormData(e.currentTarget)
        const data: any = Object.fromEntries(formData.entries())
        const copyIds = formData.getAll('copyIds').map((v) => String(v)).filter(Boolean)
        if (copyIds.length > 0) {
            data.copyIds = copyIds
            delete data.quantity
        }

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

    const reloadLoans = () => {
        getItemLoans({ search, limit, page }).then((res: any) => {
            setItemLoans(res.data)
            setPage(1)
            totalPages.current = res.totalPages
        })
    }

    const handleSettle = (id: any) => {
        SwalAlert.loading()
        fetch(`/api/inventory-operation/settle/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' } }).then((res: any) => {
            return res.json()
        }).then((data: any) => {
            const result = handleResponses(data)
            if (result) reloadLoans()
        })

    }

    /** El ejemplar prestado se perdió o se dañó: se da de baja y el préstamo se cierra. */
    const handleDropLoan = async (id: any) => {
        const ok = await SwalAlert.confirm(
            'Dar de baja el ejemplar prestado',
            'El ejemplar saldrá del inventario como baja definitiva y el préstamo quedará cerrado. ¿Continuar?'
        )
        if (!ok) return
        SwalAlert.loading()
        fetch(`/api/inventory-operation/drop-loan/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' } }).then((res: any) => {
            return res.json()
        }).then((data: any) => {
            const result = handleResponses(data)
            if (result) reloadLoans()
        })

    }

    return { handleCreateSubmit, handleSettle, handleDropLoan }
}
