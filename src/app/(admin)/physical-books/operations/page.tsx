import ManageOperationsPage from "@/components/physical-books/manageOperations";
import ManagePhysicalBooksPage from "@/components/physical-books/managePhysicalBooksPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestionar Operaciones de Libros - UPTALib",
}
export default function page() {
    return <ManageOperationsPage />
}