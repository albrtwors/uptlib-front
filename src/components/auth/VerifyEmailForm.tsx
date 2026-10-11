"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { fetchPostConfig } from "@/hooks/lib/fetch/fetchConfig";
import { SwalAlert } from "@/hooks/lib/swal/swal";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const getErrorMessage = (body: any, fallback: string) =>
  (Array.isArray(body?.message) ? body.message[0] : body?.message) || fallback;

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "/api/auth/verify-email",
        fetchPostConfig({ email, code })
      );
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        SwalAlert.fire({
          title: "Error",
          text: getErrorMessage(body, "No se pudo verificar el código"),
          icon: "error",
        });
        return;
      }

      await SwalAlert.fire({
        title: "¡Éxito!",
        text: "Tu cuenta ha sido verificada. Ya puedes iniciar sesión.",
        icon: "success",
      });
      router.push("/signin");
    } catch (error) {
      console.error(error);
      SwalAlert.fire({ title: "Error", text: "Ocurrió un error, inténtalo de nuevo", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(
        "/api/auth/resend-verification",
        fetchPostConfig({ email })
      );
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        SwalAlert.fire({
          title: "Error",
          text: getErrorMessage(body, "No se pudo reenviar el código"),
          icon: "error",
        });
        return;
      }

      SwalAlert.fire({
        title: "Código reenviado",
        text: body?.message || "Revisa tu correo",
        icon: "success",
      });
    } catch (error) {
      console.error(error);
      SwalAlert.fire({ title: "Error", text: "Ocurrió un error, inténtalo de nuevo", icon: "error" });
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verifica tu correo
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa el código de 6 dígitos que enviamos a tu correo
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
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label isRequired={false}>Código de verificación</Label>
                  <Input
                    name="code"
                    type="text"
                    placeholder="123456"
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Verificando..." : "Verificar cuenta"}
                  </Button>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={handleResend}
                  >
                    Reenviar código
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Ya verificaste tu cuenta?{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
