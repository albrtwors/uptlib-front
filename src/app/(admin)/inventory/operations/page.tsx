import ItemOperationsPage from "@/components/inventory/itemOperationsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Operaciones del Inventario'
}
export default function Page() {
    return <ItemOperationsPage></ItemOperationsPage>
}