import ManageLoansPage from "@/components/physical-books/manageLoans"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Gestionar prestamos | UPTALib'
}

export default function Page() {
    return <ManageLoansPage></ManageLoansPage>
}