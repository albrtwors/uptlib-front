import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "UPTALib - Registro",
  description: "Esta es la página de Registro",
};

export default function SignUp() {
  return <SignUpForm />;
}
