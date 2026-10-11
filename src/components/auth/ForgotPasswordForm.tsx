"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { fetchPostConfig } from "@/hooks/lib/fetch/fetchConfig";
import { SwalAlert } from "@/hooks/lib/swal/swal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const getErrorMessage = (body: any, fallback: string) =>
  (Array.isArray(body?.message) ? body.message[0] : body?.message) || fallback;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "/api/auth/forgot-password",
        fetchPostConfig({ email })
      );
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        SwalAlert.fire({
          title: "Error",
          text: getErrorMessage(body, "No se pudo procesar la solicitud"),
          icon: "error",
        });
        return;
      }

      await SwalAlert.fire({
        title: "Revisa tu correo",
        text: body?.message || "Si el correo está registrado, recibirás un código.",
        icon: "success",
      });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error(error);
      SwalAlert.fire({ title: "Error", text: "Ocurrió un error, inténtalo de nuevo", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu email y te enviaremos un código para restablecer tu contraseña
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label isRequired={false}>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Ingresa tu email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar código"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Volver al inicio de sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
