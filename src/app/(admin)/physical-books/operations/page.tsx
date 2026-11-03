import ManageOperationsPage from "@/components/physical-books/manageOperations";
import PageFallback from "@/components/ui/PageFallback";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Gestionar Operaciones de Libros - UPTALib",
}

// La página lee los filtros de la URL, así que el prerender necesita este límite.
export default function page() {
    return <Suspense fallback={<PageFallback />}><ManageOperationsPage /></Suspense>
}