"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { fetchPostConfig } from "@/lib/fetch/fetchConfig";
import { SwalAlert } from "@/lib/swal/swal";
import Link from "next/link";
import React, { ChangeEvent, ChangeEventHandler, useState } from "react";

const useSingUpForm = () => {
  const [credentials, setCredentials] = useState({
    name: { value: '', error: false },
    password: { value: '', error: false },
    email: {
      value: '', error: false
    }

  })

  return { credentials, setCredentials }
}
//generic function to handle input changes and show errors based on regex expresion
export const handleInputChangeWithErrorShowing = (e: ChangeEvent<HTMLInputElement>, setCredentials: any, field: any, expression: RegExp) => {
  if (!e.target.value.match(expression)) {
    setCredentials((prev: any) => ({ ...prev, [field]: { value: e.target.value, error: true } }))
    return
  }
  setCredentials((prev: any) => ({ ...prev, [field]: { value: e.target.value, error: false } }))
}

export default function SignUpForm() {
  const { credentials, setCredentials } = useSingUpForm()
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    fetch('/api/users/register', fetchPostConfig(data)).then((res: Response) => {
      try {
        if (!res.ok) {
          SwalAlert.fire({ title: 'Error', text: 'Asegúrate de cumplir el formato de todas las credenciales', icon: 'error' })
          return
        }
        if (res.status === 201) {
          SwalAlert.fire({ title: 'Éxito', text: 'Usuario registrado', icon: 'success' })
          return
        }

        throw new Error('Hubo un error')
      } catch (error) {
        console.error(error)
      }
    })


  }
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Regístrate
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu email y contraseña para registrarte
            </p>
          </div>
          <div>

            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { handleSubmit(e) }}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Nombre de Usuario<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChangeWithErrorShowing(e, setCredentials, 'name', /^[a-zA-Z0-9_]{3,}$/)}
                      hint="El nombre de usuario debe ser superior a 3 caracteres y solo incluir alfanumericos"
                      error={credentials.name.error}
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>

                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChangeWithErrorShowing(e, setCredentials, 'email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
                    hint="El email debe ser válido"
                    error={credentials.email.error}
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Ingresa tu email"
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Contraseña<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChangeWithErrorShowing(e, setCredentials, 'password', /^.{4,}$/)}
                      hint="La contraseña debe superar los 4 caracteres"
                      error={credentials.password.error}
                      placeholder="Ingresa tu contraseña"
                      name="password"
                      type={showPassword ? "text" : "password"}
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

                {/* <!-- Button --> */}
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Regístrate
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Ya tienes una cuenta? {" "}
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
