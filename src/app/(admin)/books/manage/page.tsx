import ManageBooksPage from "@/components/books/manageBooksPage";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: 'UPTALib - Gestionar Libros',

}
export default function page() {
    return <ManageBooksPage />
}
