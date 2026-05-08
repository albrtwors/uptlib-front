import LogsPage from "@/components/admin/logsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Bitacora de Usuario - UPTALib'
}
export default function Page() {
    return <LogsPage></LogsPage>
}