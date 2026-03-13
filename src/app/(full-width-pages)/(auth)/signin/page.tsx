import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "UPTALib - Login",
  description: "Esta es la página de login",
};

export default function SignIn() {
  return <SignInForm />;
}
