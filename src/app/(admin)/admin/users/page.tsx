import ManageUsersPage from "@/components/admin/manageUsersPage";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Gestionar Usuarios - Uptalib'
}
export default function Page() {
    return <ManageUsersPage></ManageUsersPage>
}