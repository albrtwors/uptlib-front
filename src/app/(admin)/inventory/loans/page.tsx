import ManageItemLoansPage from "@/components/inventory/manageItemLoansPage";
import PageFallback from "@/components/ui/PageFallback";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: 'Gestionar Préstammos - Inventario'
}

// La página lee los filtros de la URL, así que el prerender necesita este límite.
export default function Page() {
    return <Suspense fallback={<PageFallback />}><ManageItemLoansPage /></Suspense>
}