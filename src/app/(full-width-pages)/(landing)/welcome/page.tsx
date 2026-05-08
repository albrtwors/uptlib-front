import LandingPage from "@/components/landing/landingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'UPTALib - Bienvenido'
}
export default function Page() {
    return <LandingPage></LandingPage>
}