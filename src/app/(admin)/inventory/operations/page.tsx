import ItemOperationsPage from "@/components/inventory/itemOperationsPage";
import PageFallback from "@/components/ui/PageFallback";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: 'Operaciones del Inventario'
}

// La página lee los filtros de la URL, así que el prerender necesita este límite.
export default function Page() {
    return <Suspense fallback={<PageFallback />}><ItemOperationsPage></ItemOperationsPage></Suspense>
}