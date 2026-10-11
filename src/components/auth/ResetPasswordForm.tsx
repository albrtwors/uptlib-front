"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { fetchPostConfig } from "@/hooks/lib/fetch/fetchConfig";
import { SwalAlert } from "@/hooks/lib/swal/swal";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const getErrorMessage = (body: any, fallback: string) =>
  (Array.isArray(body?.message) ? body.message[0] : body?.message) || fallback;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    try {
      const res = await fetch(
        "/api/auth/reset-password",
        fetchPostConfig({ email, code, password })
      );
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        SwalAlert.fire({
          title: "Error",
          text: getErrorMessage(body, "No se pudo restablecer la contraseña"),
          icon: "error",
        });
        return;
      }

      await SwalAlert.fire({
        title: "¡Éxito!",
        text: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
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

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Restablecer contraseña
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa el código que recibiste y tu nueva contraseña
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
                  <Label isRequired={false}>Código de recuperación</Label>
                  <Input
                    name="code"
                    type="text"
                    placeholder="123456"
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div>
                  <Label isRequired={false}>Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Actualizando..." : "Restablecer contraseña"}
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
