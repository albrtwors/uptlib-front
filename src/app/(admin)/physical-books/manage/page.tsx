import ManagePhysicalBooksPage from "@/components/physical-books/managePhysicalBooksPage";
import PageFallback from "@/components/ui/PageFallback";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Gestionar Libros Físicos - UPTALib",
}

// La página lee los filtros de la URL, así que el prerender necesita este límite.
export default function page() {
    return <Suspense fallback={<PageFallback />}><ManagePhysicalBooksPage /></Suspense>
}