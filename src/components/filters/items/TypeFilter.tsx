"use client"

import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import useTypes from "@/hooks/types/useTypes"
import { useEffect, useState } from "react"

export default function ItemTypeSearcher({ setSearchHandler, defaultValue, name = "typeName" }: any) {
    const [search, setSearch] = useState('')
    const [dropDownShow, setDropdownShow] = useState(false)
    const { types, setTypes, getTypes } = useTypes({ search })

    // 💡 EFECTO CLAVE: Si la IA cambia el defaultValue desde afuera, 
    // forzamos al estado interno a enterarse y sincronizarse.
    useEffect(() => {
        if (defaultValue?.name) {
            setSearch(defaultValue.name)
            if (setSearchHandler) setSearchHandler(defaultValue.name)
        } else if (defaultValue === undefined) {
            setSearch('')
        }
    }, [defaultValue])

    const handleTypeSelect = (type: any) => {
        setSearch(type.name)
        setDropdownShow(false)
        if (setSearchHandler) setSearchHandler(type.name)
    }

    // El filtro sólo se aplica al elegir un tipo de la lista; escribir no
    // debe relanzar la consulta del listado cada tecla.
    const handleSearch = (e: any) => {
        const val = e.target.value
        getTypes({ src: val }).then(res => setTypes(res))
        setSearch(val)
        setDropdownShow(val !== '')
    }

    const handleClear = () => {
        setSearch('')
        setDropdownShow(false)
        if (setSearchHandler) setSearchHandler('')
    }

    useEffect(() => {
        getTypes({ src: search }).then(res => setTypes(res))
    }, [])

    return (
        <div className="flex flex-col relative"> {/* Añadido relative para que el dropdown no flote raro */}
            <Label>Tipo de Item</Label>

            <div className="relative">
                {/* 💡 IMPORTANTE: Asegurar que tenga el atributo 'name' para que el FormData del submit lo capture */}
                <input
                    name={name}
                    onChange={handleSearch}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-9 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={search}
                    placeholder="Seleccione o escriba un tipo..."
                />
                {search && (
                    <button
                        type="button"
                        aria-label="Limpiar el tipo seleccionado"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {dropDownShow && types.length > 0 && (
                <div className="p-2 absolute left-0 top-full mt-1 w-full z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                    {types.map((type: any) => (
                        <div
                            key={type.id}
                            onClick={() => handleTypeSelect(type)}
                            className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md transition-colors"
                        >
                            <h1 className="text-sm text-gray-700 dark:text-gray-200">{type.name}</h1>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}