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

    const handleSearch = (e: any) => {
        const val = e.target.value
        getTypes({ src: val }).then(res => setTypes(res))
        setSearch(val)
        if (setSearchHandler) setSearchHandler(val)
        setDropdownShow(val !== '')
    }

    useEffect(() => {
        getTypes({ search }).then(res => setTypes(res))
    }, [])

    return (
        <div className="flex flex-col relative"> {/* Añadido relative para que el dropdown no flote raro */}
            <Label>Tipo de Item</Label>

            {/* 💡 IMPORTANTE: Asegurar que tenga el atributo 'name' para que el FormData del submit lo capture */}
            <input
                name={name}
                onChange={handleSearch}
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={search}
                placeholder="Seleccione o escriba un tipo..."
            />

            {dropDownShow && types.length > 0 && (
                <div className="p-2 absolute z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 mt-20 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                    {types.map((type: any) => (
                        <div
                            key={type.id}
                            onClick={() => handleTypeSelect(type)}
                            className="w-50 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md transition-colors"
                        >
                            <h1 className="text-sm text-gray-700 dark:text-gray-200">{type.name}</h1>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}