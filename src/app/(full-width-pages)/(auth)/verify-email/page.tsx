import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "UPTALib - Verificar correo",
  description: "Verifica tu cuenta de UPTALib",
};

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
