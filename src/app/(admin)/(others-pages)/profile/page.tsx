"use client"

import { useEffect, useState } from "react";
import React from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { SwalAlert } from "@/hooks/lib/swal/swal";
import { handleResponses } from "@/hooks/lib/responses/handleResponses";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Estados del formulario de edición
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Cargar perfil del usuario autenticado al montar la vista
  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener el perfil");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        SwalAlert.fire({
          title: "Error",
          text: "Hubo un problema al cargar los datos del perfil.",
          icon: "error",
        });
        setLoading(false);
      });
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return SwalAlert.fire({
        title: "Campos obligatorios",
        text: "El nombre y el correo electrónico no pueden quedar vacíos.",
        icon: "warning",
      });
    }

    SwalAlert.loading();

    try {
      const payload: any = { name, email };
      if (password.trim() !== "") {
        payload.password = password;
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const responseData = await res.json();

      // handleResponses procesará los mensajes devueltos por el backend
      const success = handleResponses(responseData);

      if (success) {
        setPassword(""); // Limpiamos el campo de clave por seguridad
        setUser((prev: any) => ({ ...prev, name, email }));
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      SwalAlert.fire({
        title: "Error",
        text: "Ocurrió un error inesperado al procesar la actualización.",
        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-xs">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Configuración del Perfil
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* TARJETA META (INFORMACIÓN FIJA) */}
          <div className="md:col-span-1 flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 rounded-xl text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold uppercase mb-3">
              {name.substring(0, 2)}
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-white">{user?.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{user?.email}</p>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold tracking-wider uppercase">
              Rol: {user?.role || "USER"}
            </span>

            {user?.saves && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 w-full">
                <p className="text-xs font-medium text-gray-400">Libros Guardados</p>
                <span className="text-xl font-bold text-gray-700 dark:text-gray-200">{user?.saves.length}</span>
              </div>
            )}
          </div>

          {/* FORMULARIO DE EDICIÓN */}
          <div className="md:col-span-2">
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input
                  type="text"
                  placeholder="Tu nombre real"
                  defaultValue={name}
                  onChange={(e: any) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Correo Electrónico</Label>
                <Input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  defaultValue={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                <Label isRequired={false}>Nueva Contraseña</Label>
                <Input
                  type="password"
                  placeholder="Déjala en blanco si no quieres cambiarla"
                  defaultValue={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                />
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  Solo llena este campo si deseas reescribir tu contraseña actual de acceso.
                </p>
              </div>

              <div className="flex justify-end mt-2">
                <Button type="submit" className="px-6 h-11 w-full sm:w-auto">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}