import ManagePhysicalBooksPage from "@/components/physical-books/managePhysicalBooksPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestionar Libros Físicos - UPTALib",
}
export default function page() {
    return <ManagePhysicalBooksPage />
}