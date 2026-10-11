import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "UPTALib - Recuperar contraseña",
  description: "Recupera el acceso a tu cuenta de UPTALib",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
