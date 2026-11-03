import InventoryManagePage from "@/components/inventory/InventoryManagePage";
import PageFallback from "@/components/ui/PageFallback";
import { Suspense } from "react";
export const metadata = {
    title: 'UPTALib - Inventario'
}

// La página lee los filtros de la URL, así que el prerender necesita este límite.
export default function Page() {
    return <Suspense fallback={<PageFallback />}><InventoryManagePage /></Suspense>
}