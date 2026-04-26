import ManageItemLoansPage from "@/components/inventory/manageItemLoansPage";
import ManageLoansPage from "@/components/physical-books/manageLoans";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Gestionar Préstammos - Inventario'
}


export default function Page() {
    return <ManageItemLoansPage />
}