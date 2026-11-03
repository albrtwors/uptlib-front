import ManageLoansPage from "@/components/physical-books/manageLoans"
import PageFallback from "@/components/ui/PageFallback"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
    title: 'Gestionar prestamos | UPTALib'
}

// La página lee los filtros de la URL, así que el prerender necesita este límite.
export default function Page() {
    return <Suspense fallback={<PageFallback />}><ManageLoansPage></ManageLoansPage></Suspense>
}