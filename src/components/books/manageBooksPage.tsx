"use client"
import Button from "@/components/ui/button/Button"
import { useState } from "react"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import { fetchPostConfig } from "@/lib/fetch/fetchConfig"
import { SwalAlert } from "@/lib/swal/swal"


export default function ManageBooksPage() {
    const [createModal, setCreateModal] = useState(false)
    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        fetch('/api/book', fetchPostConfig(data))
            .then((res: Response) => res.json())
            .then((response: any) => {

                if (response.error) {
                    SwalAlert.fire({
                        title: 'Error',
                        text: response.message[0] || 'OCurrio un error',
                        icon: 'error'
                    });
                } else {
                    console.log('Libro creado:', response.data);
                    SwalAlert.fire({
                        title: '¡Éxito!',
                        text: 'Libro creado correctamente',
                        icon: 'success'
                    });
                }
            })
            .catch((err) => {
                console.error('Error de red:', err);
                SwalAlert.fire({
                    title: 'Error de conexión',
                    text: 'Verifica tu conexión',
                    icon: 'error'
                });
            });
    }
    return <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Gestionar Libros <span className="text-blue-600">(admin)</span></h1>
        <Button onClick={() => setCreateModal(true)}>Añadir un Libro</Button>

        {createModal &&
            <div className="fixed z-300000000 top-0 left-0 w-dvw h-dvh flex flex-col items-center justify-center bg-[#00000066]">
                <div className="rounded-lg bg-white lg:w-120 md:w-60 w-60 p-3">
                    <div className="flex-1 flex justify-end"><Button onClick={() => setCreateModal(false)}>X</Button></div>
                    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleCreateSubmit(e)} className="flex flex-col gap-2">
                        <div>
                            <Label>Título del libro</Label>
                            <Input name="title" placeholder="Mago de Oz"></Input>
                        </div>
                        <div>
                            <Label>Descripción</Label>
                            <Input name="description" placeholder="Las aventuras de Dorothy en la tierra de OZ"></Input>
                        </div>
                        <div>
                            <Label>Pdf</Label>
                            <Input name="routepdf" placeholder="pdf"></Input>
                        </div>
                        <div>
                            <Label>Imágen</Label>
                            <Input name="routeimg" placeholder="image"></Input>

                        </div>
                        <Button>Guardar</Button>
                    </form>

                </div>

            </div>
        }

    </section>
}